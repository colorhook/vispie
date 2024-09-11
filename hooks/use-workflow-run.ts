import React, { useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {  workflowRunAtom } from "@/atoms";
import { WorkflowEvent } from "@/components/workflow/WorkflowEngine";
import { NodeRun, NodeRunningStatus, WorkflowRun, WorkflowRunningStatus } from "@/components/workflow/types";

// 获取 WorkflowRun
export const useWorkflowRun = () => {
  return useAtomValue(workflowRunAtom)
}

// 重置 WorkflowRun
export const useWorkflowRunReset = () => {
  const setWorkflowRun = useSetAtom(workflowRunAtom)
  return useCallback(() => {
    setWorkflowRun(null)
  }, [setWorkflowRun]);
}

// 获取 WorkflowRun 的 output
export const useWorkflowRunOutput = ():  any => {
  const workflowRun = useAtomValue(workflowRunAtom)
  return workflowRun?.output;
}

// 获取 WorkflowRun 的 status
export const useWorkflowRunStatus = ():  WorkflowRunningStatus => {
  const workflowRun = useAtomValue(workflowRunAtom)
  return workflowRun?.status ?? WorkflowRunningStatus.Waiting
}

// 获取 WorkflowRun 的 nodes 运行详情
export const useWorkflowRunNodes = ():  NodeRun[] => {
  const workflowRun = useAtomValue(workflowRunAtom)
  if (workflowRun) {
    return workflowRun.nodes;
  }
  return []
}

type UpdateEvent<T extends keyof WorkflowEvent> = {
  type: T;
  data: WorkflowEvent[T];
}

// 使用 WorkflowEvent 更新 WorkflowRun
export const useWorkflowRunUpdate = () => {
  const [workflowRun, setWorkflowRun] = useAtom(workflowRunAtom)
  return useCallback(({ type, data }: UpdateEvent<keyof WorkflowEvent>) => {
    switch (type) {
      case 'workflowStarted':
        setWorkflowRun({
          ...data,
          status: WorkflowRunningStatus.Running,
          nodes: [],
        } as WorkflowRun)
        break;
      case 'workflowUpdate':
        setWorkflowRun((prev) => ({
          ...prev,
          ...data
        } as WorkflowRun));
        break;
      case 'workflowFinished':
        setWorkflowRun((prev) => ({
          ...prev,
          ...data
        } as WorkflowRun));
        break;
      case 'nodeStarted':
        const newNode = {
          ...data,
          status: NodeRunningStatus.Running,
        };
        setWorkflowRun((prev) => ({
          ...prev,
          nodes: [...prev!.nodes, newNode],
        } as WorkflowRun));
        break;
      case 'nodeFinished':
        setWorkflowRun((prev) => ({
          ...prev,
          nodes: prev!.nodes.map((node) => node.id === data.id ? { 
            ...node,
            ...data
          } : node)
        } as WorkflowRun));
        break;
      default:
        break;
    }
  }, [setWorkflowRun])
}