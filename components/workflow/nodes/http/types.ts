import type { CommonNodeType } from '@/components/workflow/types'


export type HTTPNodeType = CommonNodeType & {
  url: string,
  method: string,
}
