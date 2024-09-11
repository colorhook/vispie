import type { FC } from "react";
import { memo } from "react";
import { NodeType } from "./types";
import {
  End,
  Home,
  Http,
  Llm,
} from "@/components/icons/workflow";

type BlockIconProps = {
  type: NodeType;
  size?: string;
  className?: string;
  toolIcon?: string | { content: string; background: string };
};
const ICON_CONTAINER_CLASSNAME_SIZE_MAP: Record<string, string> = {
  xs: "w-4 h-4 rounded-[5px] shadow-xs",
  sm: "w-5 h-5 rounded-md shadow-xs",
  md: "w-6 h-6 rounded-lg shadow-md",
};
const getIcon = (type: NodeType, className: string) => {
  return {
    [NodeType.Start]: <Home className={className} />,
    [NodeType.LLM]: <Llm className={className} />,
    [NodeType.End]: <End className={className} />,
    [NodeType.HTTP]: <Http className={className} />,
  }[type];
};
const ICON_CONTAINER_BG_COLOR_MAP: Record<string, string> = {
  [NodeType.Start]: "bg-[var(--red-9)]",
  [NodeType.LLM]: "bg-[#6172F3]",
  [NodeType.End]: "bg-[#F79009]",
  [NodeType.HTTP]: "bg-[#875BF7]",
};
const BlockIcon: FC<BlockIconProps> = ({
  type,
  size = "sm",
  className,
  toolIcon,
}) => {
  return (
    <div
      className={`
      flex items-center justify-center border-[0.5px] border-white/2 text-white
      ${ICON_CONTAINER_CLASSNAME_SIZE_MAP[size]}
      ${ICON_CONTAINER_BG_COLOR_MAP[type]}
      ${toolIcon && "!shadow-none"}
      ${className}
    `}
    >
      {getIcon(type, size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5")}
    </div>
  );
};

export const VarBlockIcon: FC<BlockIconProps> = ({
  type,
  className,
}) => {
  return (
    <>
      {getIcon(type, `w-3 h-3 ${className}`)}
    </>
  );
};

export default memo(BlockIcon);
