import type { FC, ReactElement } from "react";
import { cloneElement, memo, useEffect, useMemo, useRef } from "react";
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiLoader2Line,
} from "@remixicon/react";
import type { NodeProps } from "../../types";
import { NodeRunningStatus } from "../../types";

import { NodeSourceHandle, NodeTargetHandle } from "./components/node-handle";

import { cn } from "@/utils";
import BlockIcon from "@/components/workflow/block-icon";
import { useNodesSelect } from "@/hooks/use-node-select";

type BaseNodeProps = {
  children: ReactElement;
} & NodeProps;

const BaseNode: FC<BaseNodeProps> = ({
  id,
  data,
  children,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  const { selectedNode, handleNodeSelect } = useNodesSelect();
  const showSelectedBorder = selectedNode == id;
  const {
    showRunningBorder,
    showSuccessBorder,
    showFailedBorder,
  } = useMemo(() => {
    return {
      showRunningBorder: data._runningStatus === NodeRunningStatus.Running &&
        !showSelectedBorder,
      showSuccessBorder: data._runningStatus === NodeRunningStatus.Succeeded &&
        !showSelectedBorder,
      showFailedBorder: data._runningStatus === NodeRunningStatus.Failed &&
        !showSelectedBorder,
    };
  }, [data._runningStatus, showSelectedBorder]);

  return (
    <div
      className={cn(
        "flex border-[2px] border-transparent rounded-2xl bg-white hover:border-[var(--accent-9)]",
        {
          "border-[var(--accent-9)]": selectedNode == id,
        },
      )}
      ref={nodeRef}
      style={{
        width: "auto",
        height: "auto",
      }}
      onClick={() => {
        handleNodeSelect(id);
      }}
    >
      <div
        className={cn(
          "group relative pb-1 shadow-xs",
          "border border-transparent rounded-[15px]",
          "w-[240px] bg-workflow-block-bg",
          !data._runningStatus && "hover:shadow-lg",
          showRunningBorder && "!border-primary-500",
          showSuccessBorder && "!border-[#12B76A]",
          showFailedBorder && "!border-[#F04438]",
          data._isBundled && "!shadow-lg",
        )}
      >
        {!data._isCandidate && (
          <NodeTargetHandle
            id={id}
            data={data}
            handleClassName="!top-4 !-left-[9px] !translate-y-0"
            handleId="target"
          />
        )}
        {!data._isCandidate && (
          <NodeSourceHandle
            id={id}
            data={data}
            handleClassName="!top-4 !-right-[9px] !translate-y-0"
            handleId="source"
          />
        )}
        <div
          className={cn(
            "flex items-center px-3 pt-3 pb-2 rounded-t-2xl",
          )}
        >
          <BlockIcon
            className="shrink-0 mr-2"
            type={data.type}
            size="md"
          />
          <div
            title={data.title}
            className="grow mr-1 font-semibold truncate"
          >
            {data.title}
          </div>
          {data._iterationLength && data._iterationIndex &&
            data._runningStatus === NodeRunningStatus.Running && (
            <div className="mr-1.5 text-xs font-medium text-primary-600">
              {data._iterationIndex}/{data._iterationLength}
            </div>
          )}
          {(data._runningStatus === NodeRunningStatus.Running ||
            data._singleRunningStatus === NodeRunningStatus.Running) && (
            <RiLoader2Line className="w-3.5 h-3.5 text-primary-600 animate-spin" />
          )}
          {data._runningStatus === NodeRunningStatus.Succeeded && (
            <RiCheckboxCircleLine className="w-3.5 h-3.5 text-[#12B76A]" />
          )}
          {data._runningStatus === NodeRunningStatus.Failed && (
            <RiErrorWarningLine className="w-3.5 h-3.5 text-[#F04438]" />
          )}
        </div>
        {cloneElement(children, { id, data })}
        {data.desc && (
          <div className="px-3 pt-1 pb-2 system-xs-regular text-text-tertiary whitespace-pre-line break-words">
            {data.desc}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(BaseNode);
