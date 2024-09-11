import type { FC } from "react";
import React from "react";
import type { StartNodeType } from "./types";
import type { NodeProps } from "@/components/workflow/types";

const Node: FC<NodeProps<StartNodeType>> = ({
  data,
}) => {
  return null;
};

export default React.memo(Node);
