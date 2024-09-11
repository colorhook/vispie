import {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  Viewport,
} from "reactflow";

export enum NodeType {
  Start = "start",
  End = "end",
  LLM = "llm",
  HTTP = "http",
  // ... 其他节点类型
}

export enum WorkflowRunningStatus {
  Waiting = "waiting",
  Running = "running",
  Succeeded = "succeeded",
  Failed = "failed",
  Stopped = "stopped",
}

export enum NodeRunningStatus {
  NotStart = "not-start",
  Waiting = "waiting",
  Running = "running",
  Succeeded = "succeeded",
  Failed = "failed",
}

export type Branch = {
  id: string;
  name: string;
};

export type CommonNodeType<T = {}> = {
  _connectedSourceHandleIds?: string[];
  _connectedTargetHandleIds?: string[];
  _targetBranches?: Branch[];
  _isSingleRun?: boolean;
  _runningStatus?: NodeRunningStatus;
  _singleRunningStatus?: NodeRunningStatus;
  _isCandidate?: boolean;
  _isBundled?: boolean;
  _children?: string[];
  _isEntering?: boolean;
  _showAddVariablePopup?: boolean;
  _holdAddVariablePopup?: boolean;
  _iterationLength?: number;
  _iterationIndex?: number;
  isIterationStart?: boolean;
  isInIteration?: boolean;
  iteration_id?: string;
  selected?: boolean;
  title: string;
  desc: string;
  type: NodeType;
  width?: number;
  height?: number;
} & T;

export type CommonEdgeType = {
  _hovering?: boolean;
  _connectedNodeIsHovering?: boolean;
  _connectedNodeIsSelected?: boolean;
  _run?: boolean;
  _isBundled?: boolean;
  isInIteration?: boolean;
  iteration_id?: string;
  sourceType: NodeType;
  targetType: NodeType;
};

export type WorkflowNode<T = {}> = ReactFlowNode<CommonNodeType<T>>;
export type SelectedNode = Pick<WorkflowNode, "id" | "data">;
export type NodeProps<T = unknown> = { id: string; data: CommonNodeType<T> };
export type NodePanelProps<T> = {
  id: string;
  data: CommonNodeType<T>;
};
export type WorkflowEdge = ReactFlowEdge<CommonEdgeType>;

export type NodeDefault<T> = {
  defaultValue: Partial<T>;
  getAvailablePrevNodes: () => NodeType[];
  getAvailableNextNodes: () => NodeType[];
  checkValid: (
    payload: T,
    t: any,
    moreDataForCheckValid?: any,
  ) => { isValid: boolean; errorMessage?: string };
};

export enum WorkflowNodeExecutionStatus {
  PENDING = "pending",
  RUNNING = "running",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

export type NodeRunOutput = Record<string, any>;

export interface NodeRun {
  id: string;
  startedAt: Date;
  finishedAt: Date;
  status: NodeRunningStatus;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  metadata?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport: Viewport;
}

export interface VariablePool {
  getAll: () => any;
  get: (key: string[]) => any;
  set: (key: string[], value: any) => void;
  remove: (key: string[]) => void;
}

// 代表 Workflow 的一次执行
export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowRunningStatus;
  startedAt: Date;
  finishedAt?: Date;
  inputs?: Record<string, any>;
  output?: string | Record<string, any>;
  error?: string;
  nodes: NodeRun[];
}

export type OnSelectBlock = (type: NodeType, toolDefaultValue?: any) => void;
