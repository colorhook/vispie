import type { CommonNodeType } from '@/components/workflow/types'

export type EndNodeType = CommonNodeType & {
  output: string,
  outputs: Record<string, any>,
}
