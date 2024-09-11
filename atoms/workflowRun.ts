import { atom } from "jotai";
import { WorkflowRun } from "@/components/workflow/types";

export const workflowRunAtom = atom<WorkflowRun | null>(null);