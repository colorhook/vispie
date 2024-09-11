import React, { memo } from "react";
import { useSelectedNode } from "@/hooks/use-node-select";
import { runningModeAtom } from "@/atoms";
import { cn } from "@/utils";
import { useAtomValue } from "jotai";
import WorkflowRunPanel from "./WorkflowRunPanel";
import WorkflowNodePanel from "./WorkflowNodePanel";

export const WorkflowPanel: React.FC = () => {
  const node = useSelectedNode();
  const runningMode = useAtomValue(runningModeAtom);
  return (
    <div
      className={cn("absolute top-2 right-0 bottom-2 flex z-10 outline-none")}
    >
      {node && <WorkflowNodePanel />}
      {runningMode && <WorkflowRunPanel />}
    </div>
  );
};

WorkflowPanel.displayName = "WorkflowPanel";

export default memo(WorkflowPanel);
