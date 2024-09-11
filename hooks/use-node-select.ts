import React, { useCallback, useMemo } from "react"
import { NodeMouseHandler } from "reactflow"
import { selectedNodeAtom } from "@/atoms/ui"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { workflowAtom } from "@/atoms"

export const useNodesSelect = () => {
  const [selectedNode, setSelectedNode] = useAtom(selectedNodeAtom)
  
  
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNode(nodeId)
  }, [setSelectedNode])

  const handleNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    handleNodeSelect(node.id)
  }, [handleNodeSelect])

  return {
    selectedNode,
    handleNodeSelect,
    handleNodeClick,
  }
}


/**
 * 获取当前选中的 WorkflowNode
 * @returns 
 */
export const useSelectedNode = () => {
  const selectedNode = useAtomValue(selectedNodeAtom)
  const workflow = useAtomValue(workflowAtom)
  
  return useMemo(() => {
    if (!selectedNode) return null
    return workflow.nodes.find(node => node.id === selectedNode)
  }, [workflow.nodes, selectedNode])
}