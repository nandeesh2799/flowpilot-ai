import { AIStructuredOutput } from "../validation";

export interface AIAnalysisRequest {
  ticketId: string;
  title: string;
  message: string;
  customerName: string;
  customerEmail?: string | null;
  channel: string;
  referenceId?: string | null;
  customerContext?: string | null;
}

export interface AIAnalysisResult {
  output: AIStructuredOutput;
  provider: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  rawResponse?: string;
}

export interface AIProvider {
  name: string;
  modelName: string;
  analyzeTicket(request: AIAnalysisRequest): Promise<AIAnalysisResult>;
}
