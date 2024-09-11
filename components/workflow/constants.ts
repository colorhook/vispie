import { CommonNodeType, NodeType } from "./types";
import StartNodeDefault from "./nodes/start/default";
import EndNodeDefault from "./nodes/end/default";
import LLMDefault from "./nodes/llm/default";
import HTTPDefault from "./nodes/http/default";

type NodesExtraData = {
  availablePrevNodes: NodeType[];
  availableNextNodes: NodeType[];
  getAvailablePrevNodes: () => NodeType[];
  getAvailableNextNodes: () => NodeType[];
  checkValid: any;
};
export const NODES_EXTRA_DATA: Record<NodeType, NodesExtraData> = {
  [NodeType.Start]: {
    availablePrevNodes: [],
    availableNextNodes: [],
    getAvailablePrevNodes: StartNodeDefault.getAvailablePrevNodes,
    getAvailableNextNodes: StartNodeDefault.getAvailableNextNodes,
    checkValid: StartNodeDefault.checkValid,
  },
  [NodeType.End]: {
    availablePrevNodes: [],
    availableNextNodes: [],
    getAvailablePrevNodes: EndNodeDefault.getAvailablePrevNodes,
    getAvailableNextNodes: EndNodeDefault.getAvailableNextNodes,
    checkValid: EndNodeDefault.checkValid,
  },
  [NodeType.LLM]: {
    availablePrevNodes: [],
    availableNextNodes: [],
    getAvailablePrevNodes: LLMDefault.getAvailablePrevNodes,
    getAvailableNextNodes: LLMDefault.getAvailableNextNodes,
    checkValid: LLMDefault.checkValid,
  },
  [NodeType.HTTP]: {
    availablePrevNodes: [],
    availableNextNodes: [],
    getAvailablePrevNodes: HTTPDefault.getAvailablePrevNodes,
    getAvailableNextNodes: HTTPDefault.getAvailableNextNodes,
    checkValid: HTTPDefault.checkValid,
  },
};

export const ALL_CHAT_AVAILABLE_BLOCKS = Object.keys(NODES_EXTRA_DATA).filter(
  (key) => key !== NodeType.End && key !== NodeType.Start
) as NodeType[];

export const ALL_COMPLETION_AVAILABLE_BLOCKS = Object.keys(NODES_EXTRA_DATA)
  .filter((key) => key !== NodeType.Start) as NodeType[];

export const NODES_INITIAL_DATA: Record<NodeType, CommonNodeType<any>> = {
  [NodeType.Start]: {
    type: NodeType.Start,
    title: "Start",
    desc: "",
    ...StartNodeDefault.defaultValue,
  },
  [NodeType.End]: {
    type: NodeType.End,
    title: "End",
    desc: "",
    ...EndNodeDefault.defaultValue,
  },
  [NodeType.LLM]: {
    type: NodeType.LLM,
    title: "LLM",
    desc: "",
    variables: [],
    ...LLMDefault.defaultValue,
  },
  [NodeType.HTTP]: {
    type: NodeType.HTTP,
    title: "HTTP",
    desc: "",
    ...HTTPDefault.defaultValue,
  },
};

export const NODE_WIDTH = 240;
export const X_OFFSET = 60;
export const NODE_WIDTH_X_OFFSET = NODE_WIDTH + X_OFFSET;
export const Y_OFFSET = 39;
export const MAX_TREE_DEPTH = 50;
export const START_INITIAL_POSITION = { x: 80, y: 282 };
export const AUTO_LAYOUT_OFFSET = {
  x: -42,
  y: 243,
};
export const ITERATION_NODE_Z_INDEX = 1;
export const ITERATION_CHILDREN_Z_INDEX = 1002;
export const ITERATION_PADDING = {
  top: 85,
  right: 16,
  bottom: 20,
  left: 16,
};

export const RETRIEVAL_OUTPUT_STRUCT = `{
  "content": "",
  "title": "",
  "url": "",
  "icon": "",
  "metadata": {
    "dataset_id": "",
    "dataset_name": "",
    "document_id": [],
    "document_name": "",
    "document_data_source_type": "",
    "segment_id": "",
    "segment_position": "",
    "segment_word_count": "",
    "segment_hit_count": "",
    "segment_index_node_hash": "",
    "score": ""
  }
}`;

export const SUPPORT_OUTPUT_VARS_NODE = [
  NodeType.Start,
  NodeType.LLM,
];

export const WORKFLOW_DATA_UPDATE = "WORKFLOW_DATA_UPDATE";
export const CUSTOM_NODE = "custom";
export const DSL_EXPORT_CHECK = "DSL_EXPORT_CHECK";
