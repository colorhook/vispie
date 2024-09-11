import type { FC } from 'react'
import React from 'react'
import type { LLMNodeType } from './types'
import type { NodeProps } from '@/components/workflow/types'


const Node: FC<NodeProps<LLMNodeType>> = ({
  data,
}) => {
  const { provider, name: modelId } = data.model || {}
  const hasSetModel = provider && modelId

  if (!hasSetModel)
    return null

  return (
    <div className='mb-1 px-3 py-1'>
      
    </div>
  )
}

export default React.memo(Node)
