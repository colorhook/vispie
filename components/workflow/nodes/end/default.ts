import { NodeType } from '../../types'
import type { NodeDefault } from '../../types'
import { type EndNodeType } from './types'
import { ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/components/workflow/constants'

const nodeDefault: NodeDefault<EndNodeType> = {
  defaultValue: {
    output: 'content',
    outputs: [],
  },
  getAvailablePrevNodes() {
    const nodes = ALL_COMPLETION_AVAILABLE_BLOCKS.filter(type => type !== NodeType.End)
    return nodes
  },
  getAvailableNextNodes() {
    return []
  },
  checkValid(payload: EndNodeType) {
    let isValid = true
    let errorMessages = ''
    if (payload.type) {
      isValid = true
      errorMessages = ''
    }
    return {
      isValid,
      errorMessage: errorMessages,
    }
  },
}

export default nodeDefault
