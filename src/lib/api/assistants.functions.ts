import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "../ai-gateway.server";

export const ASSISTANT_TYPES = [
  "grant_proposal",
  "donor_email",
  "sponsorship_letter",
  "meeting_brief",
  "board_report",
  "activity_summary",
] as const;

export type AssistantType = (typeof ASSISTANT_TYPES)[number];

const SYSTEM_PROMPTS: Record<AssistantType, string> = {
  grant_proposal:
    "You are an expert nonprofit grant writer for SMART Sports, a youth organization connecting sports, academics, and leadership. Draft compelling, fundable grant proposals. Use a clear structure: Executive Summary, Statement of Need, Project Description, Goals & Measurable Outcomes, Budget Narrative, and Organizational Capacity. Tie the ask to the funder's priorities. Be specific and persuasive, never generic. Output clean Markdown.",
  donor_email:
    "You are a major-gifts officer for SMART Sports. Write warm, personalized donor emails that build relationship and move the donor toward the next step. Match tone to the relationship stage. Keep emails concise, specific, and donor-centered (lead with impact, not the organization). Include a clear subject line and a single clear call to action. Output clean Markdown with the subject line first.",
  sponsorship_letter:
    "You are a corporate-partnerships lead for SMART Sports. Write professional sponsorship letters that connect the company's brand and goals to tangible sponsorship benefits and community impact. Include the sponsorship level, what the sponsor receives, the impact of their support, and a clear next step. Output a complete, ready-to-send business letter in clean Markdown.",
  meeting_brief:
    "You are chief of staff for SMART Sports' development team. Produce a tight, scannable meeting brief: Attendee Background, Relationship History, Objective for This Meeting, Talking Points, Likely Objections & Responses, and the Specific Ask / Next Step. Be practical and concrete. Output clean Markdown.",
  board_report:
    "You are the development director for SMART Sports preparing a report for the board. Write a clear, data-driven board report: Headline Summary, Revenue vs. Goal, Pipeline Highlights (grants, major gifts, corporate sponsors), Signature Golf Event status, Risks & Asks of the Board, and Next-Period Priorities. Be candid, concise, and decision-oriented. Output clean Markdown.",
  activity_summary:
    "You are the development director for SMART Sports. Summarize recent fundraising activity into a crisp internal update: Wins, In-Progress Opportunities, At-Risk / Stalled items, Key Numbers, and Recommended Focus. Be concise and action-oriented. Output clean Markdown.",
};

export const generateDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      type: z.enum(ASSISTANT_TYPES),
      instructions: z.string().max(8000).optional().default(""),
      context: z.string().max(20000).optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured.");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const userPrompt = [
      data.instructions ? `Request:\n${data.instructions}` : "",
      data.context ? `\n\nRelevant data and context:\n${data.context}` : "",
    ]
      .join("")
      .trim();

    try {
      const { text } = await generateText({
        model,
        system: SYSTEM_PROMPTS[data.type],
        prompt: userPrompt || "Draft a strong first version using best practices.",
      });
      return { text };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("429")) {
        throw new Error("AI is busy right now. Please try again in a moment.");
      }
      if (message.includes("402")) {
        throw new Error("AI credits are exhausted. Add credits in Settings → Workspace → Usage.");
      }
      throw new Error("Could not generate the document. Please try again.");
    }
  });