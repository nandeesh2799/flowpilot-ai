-- =============================================================================
-- FlowPilot AI — Database Migration Schema (Supabase / PostgreSQL)
-- Gokul Infocare Assessment: AI Growth & Automation Associate
-- =============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150),
    channel VARCHAR(30) NOT NULL DEFAULT 'web_form' CHECK (channel IN ('email', 'chat', 'web_form', 'api')),
    reference_id VARCHAR(60),
    customer_context TEXT,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in_progress', 'waiting_on_customer', 'resolved', 'closed')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_team VARCHAR(40) NOT NULL DEFAULT 'unassigned' CHECK (assigned_team IN ('general_support', 'technical_support', 'billing', 'security_compliance', 'executive_escalations', 'unassigned')),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index frequently filtered and sorted columns
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_team ON tickets(assigned_team);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_is_demo ON tickets(is_demo);

-- 2. AI ANALYSES TABLE
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(60) NOT NULL,
    prompt_version VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    summary TEXT NOT NULL,
    category VARCHAR(40) NOT NULL CHECK (category IN ('account_access', 'billing_refund', 'technical_issue', 'feature_request', 'service_outage', 'security_incident', 'general_inquiry')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    priority_reasoning TEXT NOT NULL,
    confidence_score NUMERIC(4, 3) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    is_uncertain BOOLEAN NOT NULL DEFAULT false,
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative', 'frustrated')),
    recommended_team VARCHAR(40) NOT NULL CHECK (recommended_team IN ('general_support', 'technical_support', 'billing', 'security_compliance', 'executive_escalations', 'unassigned')),
    recommended_action TEXT NOT NULL,
    suggested_response TEXT NOT NULL,
    missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
    potential_security_risk BOOLEAN NOT NULL DEFAULT false,
    security_notes TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_ticket_id ON ai_analyses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_category ON ai_analyses(category);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_priority ON ai_analyses(priority);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);

-- 3. REVIEW DECISIONS TABLE
CREATE TABLE IF NOT EXISTS review_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    ai_analysis_id UUID REFERENCES ai_analyses(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    edited_response TEXT,
    rejection_reason TEXT,
    note TEXT,
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_decisions_ticket_id ON review_decisions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_review_decisions_created_at ON review_decisions(created_at DESC);

-- 4. AUDIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    actor_type VARCHAR(30) NOT NULL CHECK (actor_type IN ('system', 'ai_engine', 'human_reviewer')),
    actor_name VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_ticket_id ON audit_events(ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);

-- 5. AUTOMATIC UPDATED_AT TRIGGER FOR TICKETS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tickets_updated_at ON tickets;
CREATE TRIGGER trigger_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
