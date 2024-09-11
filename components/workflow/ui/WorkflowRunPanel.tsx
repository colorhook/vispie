import React, { memo } from "react";
import { RiCloseLine } from "@remixicon/react";
import { useAtomValue, useSetAtom } from "jotai";
import { runningModeAtom, workflowAtom } from "@/atoms";
import { Callout, Spinner, Tabs } from "@radix-ui/themes";
import { useWorkflowRun, useWorkflowRunNodes } from "@/hooks/use-workflow-run";
import { NodeRun, Workflow, WorkflowRunningStatus } from "../types";
import NodeTracing from "./NodeTracing";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const WorkflowRunResult: React.FC = () => {
  const workflowRun = useWorkflowRun();
  let output = workflowRun?.output;

  if (workflowRun?.status === WorkflowRunningStatus.Failed) {
    return (
      <div className="p-4 flex items-center">
        <Callout.Root color="red" role="alert" className="w-full">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            {workflowRun.error ?? "Error"}
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="p-4 flex items-center">
        <Spinner />
      </div>
    );
  }
  if (typeof output !== "string") {
    output = JSON.stringify(output, null, 2);
  }
  return (
    <div className="p-4">
      {output}
    </div>
  );
};

export const WorkflowRunTracing: React.FC = () => {
  const workflow: Workflow = useAtomValue(workflowAtom);
  const runs = useWorkflowRunNodes();
  return (
    <div className="p-4 flex flex-col gap-2">
      {runs.map((nodeRun: NodeRun) => {
        const data = workflow.nodes.find((node) =>
          node.id === nodeRun.id
        )!.data;
        return <NodeTracing key={nodeRun.id} nodeRun={nodeRun} data={data} />;
      })}
    </div>
  );
};

export const WorkflowRunPanel: React.FC = () => {
  const setRunningMode = useSetAtom(runningModeAtom);
  return (
    <div
      className={`
      flex flex-col w-[420px] h-full rounded-l-2xl border-[0.5px] border-gray-200 shadow-xl bg-white overflow-hidden
    `}
    >
      <div className="flex items-center justify-between p-4 pb-1 text-base font-semibold text-gray-900">
        {`Workflow Run`}
        <div
          className="p-1 cursor-pointer"
          onClick={() => {
            setRunningMode(false);
          }}
        >
          <RiCloseLine className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div className="relative flex flex-1">
        <Tabs.Root
          defaultValue="result"
          className="flex flex-col flex-1 w-full"
        >
          <Tabs.List className="pl-4">
            <Tabs.Trigger value="result">结果</Tabs.Trigger>
            <Tabs.Trigger value="tracing">追踪</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content
            value="result"
            className="flex-1 overflow-y-auto w-full"
            style={{ maxHeight: "calc(100vh - 156px)" }}
          >
            <WorkflowRunResult />
          </Tabs.Content>

          <Tabs.Content
            value="tracing"
            className="flex-1 bg-gray-50 relative w-full"
            style={{ maxHeight: "calc(100vh - 156px)" }}
          >
            <WorkflowRunTracing />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

WorkflowRunPanel.displayName = "WorkflowRunPanel";

export default memo(WorkflowRunPanel);
