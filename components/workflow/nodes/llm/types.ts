import type { CommonNodeType } from "@/components/workflow/types";

export type LLMNodeType = CommonNodeType & {
  model: string;
  apiKey: string;
  prompt: string;
};
