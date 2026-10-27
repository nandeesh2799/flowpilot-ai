# FlowPilot AI — Architecture & Technical Design

**Project**: FlowPilot AI — Intelligent Support Workflow Copilot  
**Assessment**: Gokul Infocare — AI Growth & Automation Associate  
**Domain**: Technology / Automation  

---

## 1. System Overview

FlowPilot AI is a human-in-the-loop customer support workflow copilot. It ingests incoming support inquiries across multiple channels (Web Form, Email, Live Chat, API), executes server-side validation, invokes structured AI analysis for triage and response generation, and presents support agents with actionable intelligence:

1. **Automated Triage**: Classifies ticket category, priority (urgent, high, medium, low), and sentiment.
2. **Confidence Calibration**: Calculates classification confidence and alerts when ambiguity requires human clarification.
3. **Evidence-Based Rationale**: Cites concrete facts from the customer inquiry justifying the assigned priority.
4. **Draft Response Generation**: Generates an empathetic, grounded draft customer reply without claiming unverified actions have occurred.
5. **Prompt Injection Defense**: Evaluates incoming customer messages as untrusted data, flagging and neutralizing adversarial prompt override attempts.
6. **Human Review & Decision Audit**: Enables agents to edit, approve, or reject draft replies, reassign teams, override priorities, resolve cases, and view an immutable event timeline.

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
| Next.js App Router (React 19, TypeScript, Tailwind CSS, Lucide Icons)           |
|                                                                                 |
|  [Operations Dashboard]   [Ticket Inbox]   [Create Ticket Form]   [Docs Viewer] |
|             \                   |                  /                     |      |
+--------------\------------------|-----------------/-----------------------------+
                \                 |                /
                 v                v               v
+---------------------------------------------------------------------------------+
|                               SERVER & API TIER                                 |
| Next.js Route Handlers (Edge & Node.js Runtime)                                 |
|                                                                                 |
|  POST /api/tickets        -> Validates input (Zod), persists, invokes AI triage |
|  GET  /api/tickets        -> Paginated, filtered, and sorted inbox queries      |
|  GET  /api/tickets/[id]   -> Fetches ticket, analyses, reviews & audit timeline |
|  POST /api/tickets/[id]/review -> Human review state machine & audit logger     |
|  GET  /api/dashboard      -> Real-time metric computations                      |
|  POST /api/demo/seed      -> Idempotent dataset seeder for testing & evaluation |
|  GET  /api/health         -> Dual-mode AI & Database connectivity status        |
+---------------------------------+-----------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+------------------------------------+   +------------------------------------+
|         AI PROVIDER BOUNDARY       |   |         PERSISTENCE LAYER          |
| interface AIProvider               |   | interface TicketRepository         |
|                                    |   |                                    |
|  [GeminiAIProvider]                |   |  [SupabasePostgreSQL]              |
|  - Google Gemini API               |   |  - Remote production database      |
|  - Structured JSON Output          |   |  - Schema migrations               |
|  - Temperature 0.1                 |   |                                    |
|                                    |   |  [LocalDataStore]                  |
|  [DeterministicDemoProvider]       |   |  - Zero-friction offline storage   |
|  - Offline heuristic rule-base     |   |  - File-backed JSON persistence    |
|  - Prompt-injection detection      |   |  - Immediate out-of-the-box run    |
+------------------------------------+   +------------------------------------+
```

---

## 3. Core Entities & Relational Schema

### 3.1. `tickets`
Represents the core customer inquiry.
- `id` (UUID): Unique ticket identifier.
- `title` (VARCHAR): Subject headline.
- `customer_name` (VARCHAR): Customer display name.
- `customer_email` (VARCHAR, optional): Customer contact address.
- `channel` (VARCHAR): Ingestion channel (`email`, `chat`, `web_form`, `api`).
- `reference_id` (VARCHAR, optional): Invoice, order, or ticket reference code.
- `customer_context` (TEXT, optional): Prior account history or SLA notes.
- `message` (TEXT): The raw customer inquiry message.
- `status` (VARCHAR): `new`, `triaged`, `in_progress`, `waiting_on_customer`, `resolved`, `closed`.
- `priority` (VARCHAR): `low`, `medium`, `high`, `urgent`.
- `assigned_team` (VARCHAR): `general_support`, `technical_support`, `billing`, `security_compliance`, `executive_escalations`, `unassigned`.
- `is_demo` (BOOLEAN): Distinguishes seeded sample tickets from user-created tickets.
- `created_at`, `updated_at` (TIMESTAMPTZ).

### 3.2. `ai_analyses`
Captures model outputs, inference latency, prompt versions, and status.
- `id` (UUID): Analysis identifier.
- `ticket_id` (UUID, FK -> `tickets.id` ON DELETE CASCADE).
- `provider` (VARCHAR): `google-gemini` or `demo-deterministic`.
- `model` (VARCHAR): e.g., `gemini-1.5-flash` or `demo-rules-v1`.
- `prompt_version` (VARCHAR): e.g., `v1.2.0`.
- `status` (VARCHAR): `success`, `failed`, `pending`.
- `summary` (TEXT): 1-2 sentence executive briefing.
- `category` (VARCHAR): Ticket category classification.
- `priority` (VARCHAR): AI suggested urgency.
- `priority_reasoning` (TEXT): Concrete evidence justifying priority.
- `confidence_score` (NUMERIC 0.00-1.00): Model certainty estimate.
- `is_uncertain` (BOOLEAN): True if message lacks diagnostic clarity.
- `sentiment` (VARCHAR): `positive`, `neutral`, `negative`, `frustrated`.
- `recommended_team` (VARCHAR): Target escalation department.
- `recommended_action` (TEXT): Operational advice for the human agent.
- `suggested_response` (TEXT): Grounded, professional drafted customer reply.
- `missing_information` (JSONB): Specific items missing from inquiry.
- `potential_security_risk` (BOOLEAN): True if adversarial injection detected.
- `security_notes` (TEXT): Description of security risks or prompt injection markers.
- `latency_ms` (INTEGER): Wall-clock inference time.

### 3.3. `review_decisions`
Stores human reviewer interventions.
- `id` (UUID): Review identifier.
- `ticket_id` (UUID, FK -> `tickets.id`).
- `action` (VARCHAR): `approve_suggested_reply`, `reject_suggested_reply`, `edit_suggested_reply`, `reassign_team`, `change_priority`, `change_status`, `resolve_ticket`, `reopen_ticket`, `retry_ai_analysis`, `add_internal_note`.
- `reviewer_name` (VARCHAR): Name of human agent.
- `edited_response` (TEXT, optional): Adjusted reply content.
- `rejection_reason` (TEXT, optional): Rationale if draft rejected.
- `previous_state`, `new_state` (JSONB): Delta for audit compliance.

### 3.4. `audit_events`
Immutable append-only audit trail.
- `id` (UUID): Event identifier.
- `ticket_id` (UUID, FK -> `tickets.id`).
- `event_type` (VARCHAR): System or human action type.
- `actor_type` (VARCHAR): `system`, `ai_engine`, `human_reviewer`.
- `actor_name` (VARCHAR): Identity of actor.
- `summary` (TEXT): Human-readable event description.
- `metadata` (JSONB): Contextual properties.
- `created_at` (TIMESTAMPTZ).

---

## 4. Key Engineering Decisions

1. **Defensive Prompt Sandboxing**:
   - Customer messages are treated as untrusted data enclosed in XML tags (`<customer_message>...</customer_message>`).
   - Meta-prompts explicitly bar model instructions from honoring commands embedded in customer text.
2. **Dual-Mode Persistence Architecture**:
   - Production targets Supabase PostgreSQL via SQL migrations.
   - A zero-dependency local JSON relational store allows any reviewer or test suite to execute immediately out-of-the-box with zero setup hurdles.
3. **Zero Data Loss on AI Failure**:
   - Ticket persistence occurs *before* AI analysis invocation.
   - If the AI provider times out or errors, the ticket is preserved with `status: "failed"` and an error record, allowing manual human triage or 1-click retry.
4. **Honest Human-in-the-Loop Semantics**:
   - Approved draft responses are logged as `approved`, never falsely represented as &quot;sent to customer&quot; unless an active email/SMS provider is connected.
