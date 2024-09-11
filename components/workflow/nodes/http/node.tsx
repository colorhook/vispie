import type { FC } from "react";
import React from "react";
import type { HTTPNodeType } from "./types";
import { NodeProps } from "@/components/workflow/types";

const Node: FC<NodeProps<HTTPNodeType>> = ({
  id,
  data,
}) => {
  return (
    null
  );
};

export default React.memo(Node);
