import type { FC, ReactElement } from "react";
import React, { cloneElement, memo } from "react";
import { RiCloseLine } from "@remixicon/react";
import { cn } from "@/utils";
import BlockIcon from "@/components/workflow/block-icon";
import type { WorkflowNode } from "@/components/workflow/types";
import { useSetAtom } from "jotai";
import { selectedNodeAtom } from "@/atoms";
import { Text } from "@radix-ui/themes";

type BasePanelProps = {
  children: ReactElement;
} & WorkflowNode;

const BasePanel: FC<BasePanelProps> = ({
  id,
  data,
  children,
}) => {
  const setSelectedNode = useSetAtom(selectedNodeAtom);

  return (
    <div
      className={cn(
        "relative mr-2 h-full",
      )}
    >
      <div
        className={cn(
          "h-full bg-white shadow-lg border-[0.5px] border-components-panel-border rounded-2xl",
        )}
        style={{
          width: `420px`,
        }}
      >
        <div className="sticky top-0 bg-components-panel-bg border-b-[0.5px] border-black/5 z-10">
          <div className="flex items-center px-4 pt-4 pb-4">
            <BlockIcon
              className="shrink-0 mr-1"
              type={data.type}
              size="md"
            />
            <div className="pl-1 flex-1">
              <Text weight="medium">{data.title}</Text>
            </div>
            <div className="shrink-0 flex items-center text-gray-500">
              <div className="mx-3 w-[1px] h-3.5 bg-divider-regular" />
              <div
                className="flex items-center justify-center w-6 h-6 cursor-pointer"
                onClick={() => {
                  setSelectedNode(null);
                }}
              >
                <RiCloseLine className="w-4 h-4 text-text-tertiary" />
              </div>
            </div>
          </div>
        </div>
        <div className="py-2">
          {cloneElement(children, { id, data })}
        </div>
      </div>
    </div>
  );
};

export default memo(BasePanel);
