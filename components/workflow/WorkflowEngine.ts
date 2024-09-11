import mitt from "mitt";
import { nanoid } from "@/utils/nanoid";
import {
  NodeRunOutput,
  NodeType,
  VariablePool,
  Workflow,
  WorkflowNode,
  WorkflowNodeExecutionStatus,
  WorkflowRunningStatus,
} from "./types";

import startTask from "@/components/workflow/nodes/start/task";
import endTask from "@/components/workflow/nodes/end/task";
import llmTask from "@/components/workflow/nodes/llm/task";
import llmTaskLocal from "@/components/workflow/nodes/llm/task_local";
import httpTask from "@/components/workflow/nodes/http/task";
import { EndNodeType } from "./nodes/end/types";
/**
 * 任务抽象接口，每个具体的 Node 在服务端执行时都需要实现该接口
 */
export interface NodeTask {
  run: (
    node: WorkflowNode,
    variablePool: VariablePool,
    emitter?: ReturnType<typeof mitt<WorkflowEvent>>,
  ) => Promise<NodeRunOutput>;
}

const nodeTaskManager: Record<string, NodeTask> = {};

export function registerNodeTask(nodeType: string, executor: NodeTask) {
  nodeTaskManager[nodeType] = executor;
}

export function getNodeTask(nodeType: string): NodeTask | undefined {
  return nodeTaskManager[nodeType];
}

registerNodeTask(NodeType.Start, startTask);
registerNodeTask(NodeType.End, endTask);

// 是否使用 LLM 本地的代理服务
// 因为 Node v18 以后，使用本地代理发送请求很困难
// 因此，将 LLM 的请求使用 Deno 实现，Deno 可以很方便地支持 HTTP(S)_PROXY 代理
if (process.env.USE_LLM_PROXT) {
  registerNodeTask(NodeType.LLM, llmTaskLocal);
} else {
  registerNodeTask(NodeType.LLM, llmTask);
}
registerNodeTask(NodeType.HTTP, httpTask);

/**
 * WorkflowEvent 用于 WorkflowEngine 在执行任务过程中描述阶段性的结果
 * 当某个 Node 开始执行或结束执行时，WorkflowEngine 发出该 event
 * HTTP Streaming 请求会捕获这些 events，然后作为响应返回给浏览器
 * React 前端通过这些 events 进行实时反馈 Workflow 的执行过程
 */
export type WorkflowEvent = {
  workflowStarted: {
    id: string;
    startedAt: Date;
    workflowId: string;
    inputs?: any;
  };
  workflowFinished: {
    id: string;
    finishedAt: Date;
    status: WorkflowRunningStatus;
    output?: any;
    error?: string;
  };
  nodeStarted: {
    id: string;
    inputs?: any;
    startedAt: Date;
  };
  nodeFinished: {
    id: string;
    status: WorkflowNodeExecutionStatus;
    finishedAt: Date;
    outputs?: any;
    error?: string;
  };
  nodeStreamOutput: {
    id: string;
    output: string;
  };
  workflowUpdate: {
    id: string;
    output: string;
  };
};

/**
 * Workflow 执行过程中的状态
 */
class WorkflowRunState {
  workflow: Workflow;
  startAt: number;
  variablePool: VariablePool;
  workflowNodeSteps: number;
  workflowNodeRuns: { nodeId: string }[];
  totalTokens: number;

  constructor(workflow: Workflow, variablePool: VariablePool) {
    this.workflow = workflow;
    this.startAt = Date.now();
    this.variablePool = variablePool;
    this.workflowNodeSteps = 0;
    this.workflowNodeRuns = [];
    this.totalTokens = 0;
  }
}

/**
 * Workflow 执行引擎，负责 Node 的调度执行，但 Node 的具体执行逻辑不在 WorflowEngine 的处理范围
 */
export class WorkflowEngine {
  private static MAX_EXECUTION_STEPS = 1000;
  private static MAX_EXECUTION_TIME = 300000; // 5 minutes

  private id: string;
  private emitter: ReturnType<typeof mitt<WorkflowEvent>>;
  private output: any;

  constructor() {
    this.id = nanoid();
    this.output = undefined;
    this.emitter = mitt<WorkflowEvent>();
  }

  async runWorkflow(workflow: Workflow): Promise<void> {
    const variablePool = this.createDefaultVariablePool();
    const workflowRunState = new WorkflowRunState(workflow, variablePool);
    this.emitter.on("nodeStreamOutput", ({ id, output }) => {
      this.onNodeStreamOutput(id, output, workflowRunState);
    });

    this.emitter.emit("workflowStarted", {
      id: this.id,
      workflowId: workflow.id,
      startedAt: new Date(),
    });

    try {
      await this.runWorkflowInternal(workflowRunState);
      this.emitter.emit("workflowFinished", {
        id: this.id,
        finishedAt: new Date(),
        status: WorkflowRunningStatus.Succeeded,
        output: this.output,
      });
    } catch (error: any) {
      this.emitter.emit("workflowFinished", {
        id: this.id,
        error: error.toString(),
        finishedAt: new Date(),
        status: WorkflowRunningStatus.Failed,
      });
    }
  }

  private async runWorkflowInternal(
    workflowRunState: WorkflowRunState,
  ): Promise<void> {
    let currentNode: WorkflowNode | null = this.getStartNode(
      workflowRunState.workflow,
    );
    if (!currentNode) {
      throw new Error("Start Node not found");
    }
    while (currentNode) {
      if (this.isExecutionLimitReached(workflowRunState)) {
        throw new Error("Execution limit reached");
      }

      await this.runWorkflowNode(currentNode, workflowRunState);

      if (currentNode.data.type === NodeType.End) {
        const outputKey = (currentNode.data as EndNodeType).output ?? "output";
        this.output = workflowRunState.variablePool.get([outputKey]);
        break;
      }

      currentNode = this.getNextNode(currentNode, workflowRunState);
    }
  }

  /**
   * 当某个 Node 进行流式输出时
   * 判断其是否是连接到 End 的节点，如果是且 End 节点的 output 为 content，则更新 this.output
   * @param id
   * @param output
   */
  onNodeStreamOutput(
    id: string,
    output: string,
    workflowRunState: WorkflowRunState,
  ) {
    const outgoingEdges = workflowRunState.workflow.edges.filter((edge) =>
      edge.source === id
    );
    if (outgoingEdges.length === 0) {
      return;
    }
    const nextNodeId = outgoingEdges[0].target;
    const node = workflowRunState.workflow.nodes.find((node) =>
      node.id === nextNodeId
    );
    if (!node || node.data.type !== NodeType.End) {
      return;
    }
    const outputKey = (node.data as EndNodeType).output ?? "output";
    if (outputKey === "content") {
      this.output = output;
      this.emitter.emit('workflowUpdate', {
        id: this.id,
        output: this.output,
      })
    }
  }

  /**
   * 运行某个 Node，会调用该 Node 的具体实现进行执行
   * @param node
   * @param workflowRunState
   */
  private async runWorkflowNode(
    node: WorkflowNode,
    workflowRunState: WorkflowRunState,
  ): Promise<void> {
    this.emitter.emit("nodeStarted", {
      id: node.id,
      startedAt: new Date(),
      inputs: workflowRunState.variablePool.getAll(),
    });

    try {
      const task = getNodeTask(node!.data.type);
      if (!task) {
        throw new Error(`No task found for node type: ${node.data.type}`);
      }

      const result = await task.run(
        node,
        workflowRunState.variablePool,
        this.emitter,
      );
      this.updateWorkflowRunState(workflowRunState, node, result);
      this.emitter.emit("nodeFinished", {
        id: node.id,
        finishedAt: new Date(),
        status: WorkflowNodeExecutionStatus.SUCCEEDED,
        outputs: workflowRunState.variablePool.getAll(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      this.emitter.emit("nodeFinished", {
        id: node.id,
        finishedAt: new Date(),
        status: WorkflowNodeExecutionStatus.FAILED,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 更新 Output 变量
   * 未来可以修改 NodeRunOutput 的结构体，以增加 token 计数的功能
   * @param workflowRunState
   * @param node
   * @param result
   */
  private updateWorkflowRunState(
    workflowRunState: WorkflowRunState,
    node: WorkflowNode,
    result: NodeRunOutput,
  ): void {
    workflowRunState.workflowNodeSteps++;
    workflowRunState.workflowNodeRuns.push({ nodeId: node.id });
    if (result) {
      Object.entries(result).forEach(([key, value]) => {
        workflowRunState.variablePool.set([node.id, key], value);
        workflowRunState.variablePool.set([key], value);
      });
    }
  }

  /**
   * 寻找开始节点，开始节点有且只有一个
   * @param workflow
   * @returns
   */
  private getStartNode(workflow: Workflow): WorkflowNode | null {
    return workflow.nodes.find((node) => node.data.type === NodeType.Start) ||
      null;
  }

  /**
   * 找下一个执行节点，目前只是寻找下一个节点，暂不考虑多个下游节点的情况
   * @param currentNode
   * @param workflowRunState
   * @returns
   */
  private getNextNode(
    currentNode: WorkflowNode,
    workflowRunState: WorkflowRunState,
  ): WorkflowNode | null {
    const outgoingEdges = workflowRunState.workflow.edges.filter((edge) =>
      edge.source === currentNode.id
    );
    if (outgoingEdges.length === 0) {
      return null;
    }
    const nextNodeId = outgoingEdges[0].target;
    return workflowRunState.workflow.nodes.find((node) =>
      node.id === nextNodeId
    ) || null;
  }

  /**
   * 判断执行是否出发最大执行时间或执行步骤的限制
   * @param workflowRunState
   * @returns
   */
  private isExecutionLimitReached(workflowRunState: WorkflowRunState): boolean {
    const elapsedTime = Date.now() - workflowRunState.startAt;
    return (
      workflowRunState.workflowNodeSteps >=
        WorkflowEngine.MAX_EXECUTION_STEPS ||
      elapsedTime >= WorkflowEngine.MAX_EXECUTION_TIME
    );
  }

  /**
   * 创建默认的变量池，每个 Node 都可能有自己的输出放入到变量池
   * @returns
   */
  private createDefaultVariablePool(): VariablePool {
    const variables: Record<string, any> = {};
    return {
      getAll: () => {
        return structuredClone(variables);
      },
      get: (key: string[]) => {
        let current = variables;
        for (const k of key) {
          if (current[k] === undefined) return undefined;
          current = current[k];
        }
        return current;
      },
      set: (key: string[], value: any) => {
        let current = variables;
        for (let i = 0; i < key.length - 1; i++) {
          if (current[key[i]] === undefined) current[key[i]] = {};
          current = current[key[i]];
        }
        current[key[key.length - 1]] = value;
      },
      remove: (key: string[]) => {
        let current = variables;
        for (let i = 0; i < key.length - 1; i++) {
          if (current[key[i]] === undefined) return;
          current = current[key[i]];
        }
        delete current[key[key.length - 1]];
      },
    };
  }

  public on<K extends keyof WorkflowEvent>(
    type: K,
    handler: (ev: WorkflowEvent[K]) => void,
  ) {
    this.emitter.on(type, handler);
  }

  public off<K extends keyof WorkflowEvent>(
    type: K,
    handler: (ev: WorkflowEvent[K]) => void,
  ) {
    this.emitter.off(type, handler);
  }
}

export default WorkflowEngine;
