import React, { useCallback } from "react";
import { nanoid } from "nanoid";
import { useAtom, useAtomValue } from "jotai";
import { mousePositionAtom, workflowAtom } from "@/atoms";
import { CommonNodeType, NodeType, WorkflowEdge, WorkflowNode } from "@/components/workflow/types";
import { generateNewNode } from "@/components/workflow/utils";
import { NODES_INITIAL_DATA } from "@/components/workflow/constants";

/**
 * Adds a new node to the workflow.
 * @returns the new node
 */
export const useNodeAdd = () => {
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  const mousePosition = useAtomValue(mousePositionAtom)
  return useCallback(
    (
      nodeType: NodeType,
      toolDefaultValue?: Record<string, any>,
      prevNodeId?: string,
    ): WorkflowNode => {
      const nodesWithSameType = workflow.nodes.filter((node) =>
        node.data.type === nodeType
      );
      const defaults = NODES_INITIAL_DATA[nodeType];
      const title = nodesWithSameType.length > 0
        ? `${defaults.title} ${nodesWithSameType.length + 1}`
        : defaults.title;
      const newNode = generateNewNode({
        data: {
          ...defaults,
          title,
          ...(toolDefaultValue || {}),
          selected: true,
          _showAddVariablePopup: false,
          _holdAddVariablePopup: false,
        },
        position: {
          x: (mousePosition.elementX - workflow.viewport.x) / workflow.viewport.zoom,
          y: (mousePosition.elementY - workflow.viewport.y) / workflow.viewport.zoom,
        }
      });

      setWorkflow((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));

      return newNode;
    },
    [workflow.nodes, workflow.viewport, setWorkflow, mousePosition],
  );
};

/**
 * Updates a node in the workflow.
 * @returns the updated workflow
 */
export const useNodeUpdate= <T = any>() => {
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  return useCallback(
    (
      nodeId: string,
      data: Partial<CommonNodeType<T>>,
    ) => {
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) => node.id === nodeId ? { 
          ...node,
          data: {
            ...node.data,
            ...data
          }
        } : node)
      }))
    },
    [workflow.nodes, setWorkflow],
  );
};

/**
 * Removes a node from the workflow.
 * @returns the updated workflow
 */
export const useNodeRemove = () => {
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  return useCallback(
    (nodeId: string) => {
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((node) => node.id !== nodeId),
        edges: prev.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      }))
    },
    [workflow.nodes, workflow.edges, setWorkflow],
  );
}

/**
 * Updates an edge in the workflow.
 * @returns the updated workflow
 */
export const useEdgeUpdate = () => {
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  return useCallback(
    (edgeId: string, data: WorkflowEdge['data']) => {
      setWorkflow((prev) => ({
        ...prev,
        edges: prev.edges.map((edge) => edge.id === edgeId ? { ...edge, data } : edge)
      }))
    },
    [workflow.edges, setWorkflow],
  );  
}

/**
 * Removes an edge from the workflow.
 * @returns the updated workflow
 */
export const useEdgeRemove = () => {
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  return useCallback(
    (edgeId: string) => {
      setWorkflow((prev) => ({
        ...prev,
        edges: prev.edges.filter((edge) => edge.id !== edgeId)
      }))
    },
    [workflow.edges, setWorkflow],
  );
}

/**
 * Connects two nodes with an edge.
 * @returns the new edge
 */
export const useEdgeConnect = () => {
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  return useCallback(
    (source: string, target: string) => {
      const sourceType = workflow.nodes.find(node => node.id === source)!.data.type;
      const targetType = workflow.nodes.find(node => node.id === target)!.data.type;
      const newEdge: WorkflowEdge = {
        id: nanoid(),
        type: 'custom',
        source, 
        target,
        data: {
          sourceType,
          targetType,
        }
      }
      setWorkflow((prev) => ({
        ...prev,
        edges: [...prev.edges, newEdge]
      }))
      return newEdge;
    },
    [workflow.nodes, workflow.edges, setWorkflow],
  );
}