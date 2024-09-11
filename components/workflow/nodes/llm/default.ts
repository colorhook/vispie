import { NodeType, NodeDefault } from '../../types'
import type { LLMNodeType } from './types'
import {  ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/components/workflow/constants'

const nodeDefault: NodeDefault<LLMNodeType> = {
  defaultValue: {
    model: 'groq',
    apiKey: '',
    prompt: ''
  },
  getAvailablePrevNodes() {
    const nodes = ALL_COMPLETION_AVAILABLE_BLOCKS.filter(type => type !== NodeType.End)
    return nodes
  },
  getAvailableNextNodes() {
    const nodes = ALL_COMPLETION_AVAILABLE_BLOCKS
    return nodes
  },
  checkValid(payload: LLMNodeType, t: any) {
    let errorMessages = ''
    if (!errorMessages && !payload.model) {
      errorMessages = 'model provider missing';
    }
      

    if (!errorMessages && !payload.apiKey) {
      errorMessages = 'API Key missing'
    }

    if (!errorMessages && !payload.prompt) {
      errorMessages = 'prompt missing'
    }

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages,
    }
  },
}

export default nodeDefault
