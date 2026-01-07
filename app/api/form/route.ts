import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const supabaseServer = getSupabaseServerClient();

    if (!supabaseServer) {
      return NextResponse.json(
        {
          error:
            "Supabase server env vars missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    if (!isPlainObject(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const formId = body.formId;
    const data = body.data;
    const status = body.status === "completed" ? "completed" : "draft";
    const currentStep =
      typeof body.currentStep === "number" ? body.currentStep : 1;
    const stepTimestamps = body.stepTimestamps ?? {};

    if (typeof formId !== "string" || !isPlainObject(data)) {
      return NextResponse.json({ error: "Missing form data" }, { status: 400 });
    }

    const termsAccepted = Boolean(data.termsAccepted);
    const termsAcceptedAt =
      data.termsAcceptedAt && typeof data.termsAcceptedAt === "string"
        ? data.termsAcceptedAt
        : termsAccepted
          ? new Date().toISOString()
          : null;

    const payload = {
      form_id: formId,
      status,
      current_step: currentStep,
      step_timestamps: stepTimestamps,
      submitted_at: status === "completed" ? new Date().toISOString() : null,
      full_name: data.fullName ?? null,
      email: data.email ?? null,
      agent_role: data.agentRole ?? null,
      agent_role_other: data.agentRoleOther ?? null,
      terms_accepted: termsAccepted,
      terms_accepted_at: termsAcceptedAt,
      agent_name: data.agentName ?? null,
      agent_description: data.agentDescription ?? null,
      agent_rules: data.agentRules ?? null,
      agent_tone: data.agentTone ?? null,
      agent_behaviors: data.agentBehaviors ?? null,
      agent_focus: data.agentFocus ?? null,
      agent_goal: data.agentGoal ?? null,
      agent_unknown_questions: data.agentUnknownQuestions ?? null,
      product_name: data.productName ?? null,
      product_description: data.productDescription ?? null,
      product_features: data.productFeatures ?? null,
      product_differentials: data.productDifferentials ?? null,
      product_audience: data.productAudience ?? null,
      should_sell: Boolean(data.shouldSell),
      sales_process: data.salesProcess ?? null,
      sales_objections: data.salesObjections ?? null,
      sales_objections_handling: data.salesObjectionsHandling ?? null,
      sales_goals: data.salesGoals ?? null,
      sales_channels: data.salesChannels ?? null,
      success_cases: data.successCases ?? null,
      scripts: data.scripts ?? null,
      knowledge_base_files: data.knowledgeBaseFiles ?? [],
      external_systems: data.externalSystems ?? [],
      external_features: data.externalFeatures ?? [],
      scheduling_tool: data.schedulingTool ?? null,
      scheduling_availability: data.schedulingAvailability ?? null,
      scheduling_required_info: data.schedulingRequiredInfo ?? null,
      operations_per_stage: data.operationsPerStage ?? null,
      follow_up_rules: data.followUpRules ?? null,
      reminders_rules: data.remindersRules ?? null,
      response_time: data.responseTime ?? null,
      important_links: data.importantLinks ?? [],
      extra_info: data.extraInfo ?? null,
    };

    const { error } = await supabaseServer
      .from("agent_forms")
      .upsert(payload, { onConflict: "form_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
