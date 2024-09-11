import type { ComponentType } from "react";
import { NodeType } from "../types";
import StartNode from "./start/node";
import StartPanel from "./start/panel";
import EndNode from "./end/node";
import EndPanel from "./end/panel";
import LLMNode from "./llm/node";
import LLMPanel from "./llm/panel";
import HTTPNode from "./http/node";
import HTTPPanel from "./http/panel";

export const CUSTOM_NODE = "custom";

export const NodeComponentMap: Record<string, ComponentType<any>> = {
  [NodeType.Start]: StartNode,
  [NodeType.End]: EndNode,
  [NodeType.LLM]: LLMNode,
  [NodeType.HTTP]: HTTPNode,
};

export const PanelComponentMap: Record<string, ComponentType<any>> = {
  [NodeType.Start]: StartPanel,
  [NodeType.End]: EndPanel,
  [NodeType.LLM]: LLMPanel,
  [NodeType.HTTP]: HTTPPanel,
};
