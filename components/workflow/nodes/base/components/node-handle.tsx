import type { MouseEvent } from 'react'
import {
  memo,
  useCallback,
  useState,
} from 'react'
import {
  Handle,
  Position,
} from 'reactflow'
import { NodeType, WorkflowNode } from '../../../types'

import {
  useAvailableBlocks,
} from '@/atoms'


type NodeHandleProps = {
  handleId: string
  handleClassName?: string
  nodeSelectorClassName?: string
} & Pick<WorkflowNode, 'id' | 'data'>

export const NodeTargetHandle = memo(({
  id,
  data,
  handleId,
  handleClassName,
  nodeSelectorClassName,
}: NodeHandleProps) => {
  const [open, setOpen] = useState(false)

  const connected = data._connectedTargetHandleIds?.includes(handleId)
  const { availablePrevBlocks } = useAvailableBlocks(data.type, data.isInIteration)
  const isConnectable = !!availablePrevBlocks.length && (
    !data.isIterationStart
  )

  const handleOpenChange = useCallback((v: boolean) => {
    setOpen(v)
  }, [])
  const handleHandleClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    if (!connected)
      setOpen(v => !v)
  }, [connected])


  return (
    <>
      <Handle
        id={handleId}
        type='target'
        position={Position.Left}
        className={`
          !w-4 !h-4 !bg-transparent !rounded-none !outline-none !border-none z-[1]
          after:absolute after:w-0.5 after:h-2 after:left-1.5 after:top-1 after:bg-[var(--accent-9)]
          hover:scale-125 transition-all
          ${!connected && 'after:opacity-0'}
          ${data.type === NodeType.Start && 'opacity-0'}
          ${handleClassName}
        `}
        isConnectable={isConnectable}
        onClick={handleHandleClick}
      >
      </Handle>
    </>
  )
})
NodeTargetHandle.displayName = 'NodeTargetHandle'

export const NodeSourceHandle = memo(({
  id,
  data,
  handleId,
  handleClassName,
  nodeSelectorClassName,
}: NodeHandleProps) => {

  const [open, setOpen] = useState(false)
  const { availableNextBlocks } = useAvailableBlocks(data.type, data.isInIteration)
  const isConnectable = !!availableNextBlocks.length

  const connected = data._connectedSourceHandleIds?.includes(handleId)
  const handleOpenChange = useCallback((v: boolean) => {
    setOpen(v)
  }, [])
  const handleHandleClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    if (!connected)
      setOpen(v => !v)
  }, [connected])


  return (
    <>
      <Handle
        id={handleId}
        type='source'
        position={Position.Right}
        className={`
          !w-4 !h-4 !bg-transparent !rounded-none !outline-none !border-none z-[1]
          after:absolute after:w-0.5 after:h-2 after:right-1.5 after:top-1 after:bg-[var(--accent-9)]
          hover:scale-125 transition-all
          ${!connected && 'after:opacity-0'}
          ${handleClassName}
        `}
        isConnectable={isConnectable}
        onClick={handleHandleClick}
      >
      </Handle>
    </>
  )
})
NodeSourceHandle.displayName = 'NodeSourceHandle'
