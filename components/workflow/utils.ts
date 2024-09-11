import { getConnectedEdges, getOutgoers, Position } from "reactflow";

import { shortid } from "@/utils/nanoid";
import { cloneDeep, uniqBy } from "lodash-es";
import type { WorkflowEdge as Edge, WorkflowNode as Node } from "./types";
import { NodeType } from "./types";
import {
  CUSTOM_NODE,
  ITERATION_NODE_Z_INDEX,
  NODE_WIDTH_X_OFFSET,
  START_INITIAL_POSITION,
} from "./constants";

const WHITE = "WHITE";
const GRAY = "GRAY";
const BLACK = "BLACK";

const isCyclicUtil = (
  nodeId: string,
  color: Record<string, string>,
  adjList: Record<string, string[]>,
  stack: string[],
) => {
  color[nodeId] = GRAY;
  stack.push(nodeId);

  for (let i = 0; i < adjList[nodeId].length; ++i) {
    const childId = adjList[nodeId][i];

    if (color[childId] === GRAY) {
      stack.push(childId);
      return true;
    }
    if (
      color[childId] === WHITE && isCyclicUtil(childId, color, adjList, stack)
    ) {
      return true;
    }
  }
  color[nodeId] = BLACK;
  if (stack.length > 0 && stack[stack.length - 1] === nodeId) {
    stack.pop();
  }
  return false;
};

const getCycleEdges = (nodes: Node[], edges: Edge[]) => {
  const adjList: Record<string, string[]> = {};
  const color: Record<string, string> = {};
  const stack: string[] = [];

  for (const node of nodes) {
    color[node.id] = WHITE;
    adjList[node.id] = [];
  }

  for (const edge of edges) {
    adjList[edge.source]?.push(edge.target);
  }

  for (let i = 0; i < nodes.length; i++) {
    if (color[nodes[i].id] === WHITE) {
      isCyclicUtil(nodes[i].id, color, adjList, stack);
    }
  }

  const cycleEdges = [];
  if (stack.length > 0) {
    const cycleNodes = new Set(stack);
    for (const edge of edges) {
      if (cycleNodes.has(edge.source) && cycleNodes.has(edge.target)) {
        cycleEdges.push(edge);
      }
    }
  }

  return cycleEdges;
};

export const initialNodes = (originNodes: Node[], originEdges: Edge[]) => {
  const nodes = cloneDeep(originNodes);
  const edges = cloneDeep(originEdges);
  const firstNode = nodes[0];

  if (!firstNode?.position) {
    nodes.forEach((node, index) => {
      node.position = {
        x: START_INITIAL_POSITION.x + index * NODE_WIDTH_X_OFFSET,
        y: START_INITIAL_POSITION.y,
      };
    });
  }

  const iterationNodeMap = nodes.reduce((acc, node) => {
    if (node.parentId) {
      if (acc[node.parentId]) {
        acc[node.parentId].push(node.id);
      } else {
        acc[node.parentId] = [node.id];
      }
    }
    return acc;
  }, {} as Record<string, string[]>);

  return nodes.map((node) => {
    if (!node.type) {
      node.type = CUSTOM_NODE;
    }

    const connectedEdges = getConnectedEdges([node], edges);
    node.data._connectedSourceHandleIds = connectedEdges.filter((edge) =>
      edge.source === node.id
    ).map((edge) => edge.sourceHandle || "source");
    node.data._connectedTargetHandleIds = connectedEdges.filter((edge) =>
      edge.target === node.id
    ).map((edge) => edge.targetHandle || "target");

    return node;
  });
};

export const initialEdges = (originEdges: Edge[], originNodes: Node[]) => {
  const nodes = cloneDeep(originNodes);
  const edges = cloneDeep(originEdges);
  let selectedNode: Node | null = null;
  const nodesMap = nodes.reduce((acc, node) => {
    acc[node.id] = node;

    if (node.data?.selected) {
      selectedNode = node;
    }

    return acc;
  }, {} as Record<string, Node>);

  const cycleEdges = getCycleEdges(nodes, edges);
  return edges.filter((edge) => {
    return !cycleEdges.find((cycEdge) =>
      cycEdge.source === edge.source && cycEdge.target === edge.target
    );
  }).map((edge) => {
    edge.type = "custom";

    if (!edge.sourceHandle) {
      edge.sourceHandle = "source";
    }

    if (!edge.targetHandle) {
      edge.targetHandle = "target";
    }

    if (!edge.data?.sourceType && edge.source && nodesMap[edge.source]) {
      edge.data = {
        ...edge.data,
        sourceType: nodesMap[edge.source].data.type!,
      } as any;
    }

    if (!edge.data?.targetType && edge.target && nodesMap[edge.target]) {
      edge.data = {
        ...edge.data,
        targetType: nodesMap[edge.target].data.type!,
      } as any;
    }

    if (selectedNode) {
      edge.data = {
        ...edge.data,
        _connectedNodeIsSelected: edge.source === selectedNode.id ||
          edge.target === selectedNode.id,
      } as any;
    }

    return edge;
  });
};

type ConnectedSourceOrTargetNodesChange = {
  type: string;
  edge: Edge;
}[];
export const getNodesConnectedSourceOrTargetHandleIdsMap = (
  changes: ConnectedSourceOrTargetNodesChange,
  nodes: Node[],
) => {
  const nodesConnectedSourceOrTargetHandleIdsMap = {} as Record<string, any>;

  changes.forEach((change) => {
    const {
      edge,
      type,
    } = change;
    const sourceNode = nodes.find((node) => node.id === edge.source)!;
    if (sourceNode) {
      nodesConnectedSourceOrTargetHandleIdsMap[sourceNode.id] =
        nodesConnectedSourceOrTargetHandleIdsMap[sourceNode.id] || {
          _connectedSourceHandleIds: [
            ...(sourceNode?.data._connectedSourceHandleIds || []),
          ],
          _connectedTargetHandleIds: [
            ...(sourceNode?.data._connectedTargetHandleIds || []),
          ],
        };
    }

    const targetNode = nodes.find((node) => node.id === edge.target)!;
    if (targetNode) {
      nodesConnectedSourceOrTargetHandleIdsMap[targetNode.id] =
        nodesConnectedSourceOrTargetHandleIdsMap[targetNode.id] || {
          _connectedSourceHandleIds: [
            ...(targetNode?.data._connectedSourceHandleIds || []),
          ],
          _connectedTargetHandleIds: [
            ...(targetNode?.data._connectedTargetHandleIds || []),
          ],
        };
    }

    if (sourceNode) {
      if (type === "remove") {
        const index = nodesConnectedSourceOrTargetHandleIdsMap[sourceNode.id]
          ._connectedSourceHandleIds.findIndex((handleId: string) =>
            handleId === edge.sourceHandle
          );
        nodesConnectedSourceOrTargetHandleIdsMap[sourceNode.id]
          ._connectedSourceHandleIds.splice(index, 1);
      }

      if (type === "add") {
        nodesConnectedSourceOrTargetHandleIdsMap[sourceNode.id]
          ._connectedSourceHandleIds.push(edge.sourceHandle || "source");
      }
    }

    if (targetNode) {
      if (type === "remove") {
        const index = nodesConnectedSourceOrTargetHandleIdsMap[targetNode.id]
          ._connectedTargetHandleIds.findIndex((handleId: string) =>
            handleId === edge.targetHandle
          );
        nodesConnectedSourceOrTargetHandleIdsMap[targetNode.id]
          ._connectedTargetHandleIds.splice(index, 1);
      }

      if (type === "add") {
        nodesConnectedSourceOrTargetHandleIdsMap[targetNode.id]
          ._connectedTargetHandleIds.push(edge.targetHandle || "target");
      }
    }
  });

  return nodesConnectedSourceOrTargetHandleIdsMap;
};

/**
 * 生成新的节点
 * @param param0
 * @returns
 */
export const generateNewNode = (
  { data, position, id, zIndex, type, ...rest }: Omit<Node, "id"> & {
    id?: string;
  },
) => {
  return {
    id: id ?? shortid(),
    type: type || CUSTOM_NODE,
    data,
    position,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    zIndex: zIndex,
    ...rest,
  } as Node;
};

export const genNewNodeTitleFromOld = (oldTitle: string) => {
  const regex = /^(.+?)\s*\((\d+)\)\s*$/;
  const match = oldTitle.match(regex);

  if (match) {
    const title = match[1];
    const num = parseInt(match[2], 10);
    return `${title} (${num + 1})`;
  } else {
    return `${oldTitle} (1)`;
  }
};

export const getValidTreeNodes = (nodes: Node[], edges: Edge[]) => {
  const startNode = nodes.find((node) => node.data.type === NodeType.Start);

  if (!startNode) {
    return {
      validNodes: [],
      maxDepth: 0,
    };
  }

  const list: Node[] = [startNode];
  let maxDepth = 1;

  const traverse = (root: Node, depth: number) => {
    if (depth > maxDepth) {
      maxDepth = depth;
    }

    const outgoers = getOutgoers(root, nodes, edges);

    if (outgoers.length) {
      outgoers.forEach((outgoer) => {
        list.push(outgoer);
        traverse(outgoer, depth + 1);
      });
    } else {
      list.push(root);
    }
  };

  traverse(startNode, maxDepth);

  return {
    validNodes: uniqBy(list, "id"),
    maxDepth,
  };
};

export const changeNodesAndEdgesId = (nodes: Node[], edges: Edge[]) => {
  const idMap = nodes.reduce((acc, node) => {
    acc[node.id] = shortid();

    return acc;
  }, {} as Record<string, string>);

  const newNodes = nodes.map((node) => {
    return {
      ...node,
      id: idMap[node.id],
    };
  });

  const newEdges = edges.map((edge) => {
    return {
      ...edge,
      source: idMap[edge.source],
      target: idMap[edge.target],
    };
  });

  return [newNodes, newEdges] as [Node[], Edge[]];
};

export const isMac = () => {
  return navigator.userAgent.toUpperCase().includes("MAC");
};

const specialKeysNameMap: Record<string, string | undefined> = {
  ctrl: "⌘",
  alt: "⌥",
};

export const getKeyboardKeyNameBySystem = (key: string) => {
  if (isMac()) {
    return specialKeysNameMap[key] || key;
  }

  return key;
};

const specialKeysCodeMap: Record<string, string | undefined> = {
  ctrl: "meta",
};

export const getKeyboardKeyCodeBySystem = (key: string) => {
  if (isMac()) {
    return specialKeysCodeMap[key] || key;
  }

  return key;
};

export const getTopLeftNodePosition = (nodes: Node[]) => {
  let minX = Infinity;
  let minY = Infinity;

  nodes.forEach((node) => {
    if (node.position.x < minX) {
      minX = node.position.x;
    }

    if (node.position.y < minY) {
      minY = node.position.y;
    }
  });

  return {
    x: minX,
    y: minY,
  };
};

export const isEventTargetInputArea = (target: HTMLElement) => {
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    return true;
  }

  if (target.contentEditable === "true") {
    return true;
  }
};

export const variableTransformer = (v: string[] | string) => {
  if (typeof v === "string") {
    return v.replace(/^{{#|#}}$/g, "").split(".");
  }

  return `{{#${v.join(".")}#}}`;
};
