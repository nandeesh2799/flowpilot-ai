import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/service";
import { repository } from "@/lib/db";

export async function GET() {
  const providerStatus = aiService.getProviderStatus();
  const isSupabase = repository.isSupabaseConfigured();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ai_provider: {
      active: providerStatus.activeProvider,
      model: providerStatus.modelName,
      has_gemini_key: providerStatus.hasKey,
      is_forced_demo: providerStatus.isForcedDemo,
    },
    database: {
      type: isSupabase ? "supabase_postgresql" : "local_storage",
      status: "connected",
    },
  });
}
