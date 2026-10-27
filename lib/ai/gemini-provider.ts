import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./provider";
import { AIStructuredOutputSchema } from "../validation";
import { SYSTEM_PROMPT_V1_2, CURRENT_PROMPT_VERSION, formatTicketUserPrompt } from "./prompts";

export class GeminiAIProvider implements AIProvider {
  public readonly name = "google-gemini";
  public readonly modelName: string;
  private client: GoogleGenerativeAI;

  constructor(apiKey: string, modelName?: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required to initialize GeminiAIProvider");
    }
    this.modelName = modelName || process.env.GEMINI_MODEL || "gemini-1.5-flash";
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async analyzeTicket(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const startTime = Date.now();

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: SYSTEM_PROMPT_V1_2,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    const promptText = formatTicketUserPrompt(request);

    // Enforce 25-second timeout on live API calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await model.generateContent(promptText);
      clearTimeout(timeoutId);

      const candidate = response.response;
      const rawText = candidate.text();

      // Clean any accidental markdown fencing like ```json ... ```
      let cleanedJson = rawText.trim();
      if (cleanedJson.startsWith("```json")) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/```$/, "").trim();
      } else if (cleanedJson.startsWith("```")) {
        cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/```$/, "").trim();
      }

      const parsedJson = JSON.parse(cleanedJson);
      const validatedOutput = AIStructuredOutputSchema.parse(parsedJson);

      const latencyMs = Date.now() - startTime;

      return {
        output: validatedOutput,
        provider: this.name,
        model: this.modelName,
        promptVersion: CURRENT_PROMPT_VERSION,
        latencyMs,
        rawResponse: rawText,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Gemini analysis failed (${latencyMs}ms): ${message}`);
    }
  }
}
