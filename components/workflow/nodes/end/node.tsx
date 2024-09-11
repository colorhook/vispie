import type { FC } from 'react'
import React from 'react'
import type { EndNodeType } from './types'
import { NodeProps } from '@/components/workflow/types'

const Node: FC<NodeProps<EndNodeType>> = ({
  id,
  data,
}) => {
  return (
    <div className='mb-1 px-3 py-1 text-xs text-gray-600'>
      Output: <span className='font-semibold'>{data.output}</span>
    </div>
  )
}

export default React.memo(Node)