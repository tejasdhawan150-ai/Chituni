import "server-only";
import OpenAI from "openai";
import type { z } from "zod";
import { AIError, type AIProvider } from "../provider";
import { jobAnalysisSchema, parsedProfileSchema, tailoringResultSchema } from "../schemas";
import { SYSTEM_PROMPT, jobAnalysisPrompt, resumeParsePrompt, tailoringPrompt } from "../prompts";
import { uid } from "@/lib/utils";

/**
 * OpenAI implementation. Uses JSON mode and validates every response with Zod;
 * on validation failure the model gets one repair attempt with the error.
 */
export function createOpenAIProvider(apiKey: string, model: string): AIProvider {
  const client = new OpenAI({ apiKey, timeout: 60_000, maxRetries: 2 });

  async function completeJSON<S extends z.ZodType>(schema: S, prompt: string, temperature = 0.3): Promise<z.infer<S>> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ];
    for (let attempt = 0; attempt < 2; attempt++) {
      let raw: string;
      try {
        const res = await client.chat.completions.create({
          model,
          temperature,
          response_format: { type: "json_object" },
          messages,
        });
        raw = res.choices[0]?.message?.content ?? "";
      } catch (err) {
        if (err instanceof OpenAI.APIError && err.status === 429) throw new AIError("AI provider is rate limited. Please retry shortly.", "rate_limited");
        throw new AIError(`AI provider request failed: ${(err as Error).message}`);
      }
      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        messages.push({ role: "assistant", content: raw }, { role: "user", content: "That was not valid JSON. Return only the JSON object." });
        continue;
      }
      const parsed = schema.safeParse(json);
      if (parsed.success) return parsed.data;
      messages.push(
        { role: "assistant", content: raw },
        { role: "user", content: `The JSON did not match the required schema: ${parsed.error.message.slice(0, 1500)}. Return the corrected JSON only.` },
      );
    }
    throw new AIError("AI returned an invalid response.", "invalid_output");
  }

  return {
    name: "openai",
    analyzeJob: (jd) => completeJSON(jobAnalysisSchema, jobAnalysisPrompt(jd), 0.1),
    tailor: ({ profile, analysis, jobDescription, yearsOfExperience }) =>
      completeJSON(
        tailoringResultSchema,
        tailoringPrompt(JSON.stringify({ ...profile, computed_total_years_experience: yearsOfExperience }), JSON.stringify(analysis), jobDescription),
        0.3,
      ),
    parseResume: async (text) => {
      const p = await completeJSON(parsedProfileSchema, resumeParsePrompt(text), 0);
      // Guarantee unique ids regardless of what the model returned.
      p.experience.forEach((e) => (e.id = uid("exp")));
      p.education.forEach((e) => (e.id = uid("edu")));
      p.projects.forEach((e) => (e.id = uid("proj")));
      p.certifications.forEach((e) => (e.id = uid("cert")));
      return p;
    },
  };
}
