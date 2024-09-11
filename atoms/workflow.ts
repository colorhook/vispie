import { useMemo } from 'react';
import { atom, useAtomValue } from 'jotai';
import { NodeType, Workflow, WorkflowNode } from '@/components/workflow/types';
import { createDefaultWorkflow } from '@/utils/workflow';

import { NODES_EXTRA_DATA } from '@/components/workflow/constants';

const initialWorkflow: Workflow = createDefaultWorkflow()


/**
 * current workflow
 */
export const workflowAtom = atom<Workflow>(initialWorkflow);


/**
 * get workflow name
 * @returns 
 */
export const useWorkflowName = () => {
  return useAtomValue(workflowAtom).name;
}

/**
 * weather the workflow is running
 */
export const workflowRunningAtom = atom<boolean>(false);



export const useNodesExtraData = () => {
  return useMemo(() => {
    return Object.keys(NODES_EXTRA_DATA).reduce((acc, key) => {
      const node = NODES_EXTRA_DATA[key as NodeType];
      acc[key as NodeType] = {
        ...node,
        availablePrevNodes: node.getAvailablePrevNodes(),
        availableNextNodes: node.getAvailableNextNodes(),
      };
      return acc;
    }, {} as Record<NodeType, typeof NODES_EXTRA_DATA[NodeType] & {
      availablePrevNodes: NodeType[];
      availableNextNodes: NodeType[];
    }>);
  }, []);
};

export const useAvailableBlocks = (nodeType?: NodeType, isInIteration?: boolean) => {
  const nodesExtraData = useNodesExtraData()
  const availablePrevBlocks = useMemo(() => {
    if (!nodeType)
      return []
    return nodesExtraData[nodeType].availablePrevNodes || []
  }, [nodeType, nodesExtraData])

  const availableNextBlocks = useMemo(() => {
    if (!nodeType)
      return []
    return nodesExtraData[nodeType].availableNextNodes || []
  }, [nodeType, nodesExtraData])

  return useMemo(() => {
    return {
      availablePrevBlocks: availablePrevBlocks.filter((nType: NodeType) => {
        if (isInIteration && (nType === NodeType.End))
          return false
        return true
      }),
      availableNextBlocks: availableNextBlocks.filter((nType: NodeType) => {
        if (isInIteration && (nType === NodeType.End))
          return false
        return true
      }),
    }
  }, [isInIteration, availablePrevBlocks, availableNextBlocks])
}
