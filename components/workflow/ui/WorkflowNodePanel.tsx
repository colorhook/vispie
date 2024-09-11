import React, { memo, useMemo } from "react";
import { useSelectedNode } from "@/hooks/use-node-select";
import BasePanel from "../nodes/base/panel";
import { PanelComponentMap } from "../nodes/constants";

export const WorkflowNodePanel: React.FC = () => {
  const node = useSelectedNode();

  const PanelComponent = useMemo(() => {
    if (!node) {
      return () => null;
    }
    return PanelComponentMap[node.data.type];
  }, [node?.data?.type]);

  if (!node) {
    return null;
  }

  return (
    <BasePanel key={node.id} {...node}>
      <PanelComponent />
    </BasePanel>
  );
};

WorkflowNodePanel.displayName = "WorkflowNodePanel";

export default memo(WorkflowNodePanel);
