import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { PlusIcon } from "@radix-ui/react-icons";
import { Popover } from "@radix-ui/themes";
import { cn } from "@/utils";
import BlockIcon from "../block-icon";
import { NodeType } from "../types";

const nodes = [
  { id: "llm", name: "LLM" },
  { id: "http", name: "HTTP" },
  { id: "end", name: "End" },
];

export const OverlayNode: React.FC<{ type: NodeType }> = ({ type }) => {
  const name = nodes.find((node) => node.id === type)?.name;
  return (
    <div className="flex items-center justify-start px-3 h-8 rounded-lg text-sm text-gray-700">
      <BlockIcon
        className="shrink-0 mr-2"
        type={type as NodeType}
        size="md"
      />
      <span className="font-semibold">{name}</span>
    </div>
  );
};

const DraggableNode = ({ node }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: node.id,
    data: { type: node.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center justify-start px-3 h-8 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700",
        isDragging && "opacity-50",
      )}
      onClick={(event) => {
        //event.preventDefault();
      }}
    >
      <BlockIcon
        className="shrink-0 mr-2"
        type={node.id as NodeType}
        size="md"
      />
      <span className="font-semibold">{node.name}</span>
    </div>
  );
};

/**
 * 节点列表选择器
 * @param param0
 * @returns
 */
const NodeSelector: React.FC = () => {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer text-white",
            "bg-[var(--accent-9)] hover:bg-[var(--accent-11)]",
          )}
        >
          <PlusIcon />
        </div>
      </Popover.Trigger>
      <Popover.Content
        style={{
          width: 160,
          "--popover-content-padding": 0,
        } as React.CSSProperties}
      >
        <div className="p-1">
          {nodes.map((node) => <DraggableNode key={node.id} node={node} />)}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

export default NodeSelector;
