export * from "./store"
export * from "./ui"
export * from "./workflow"
export * from "./workflowRun"
export * from "./history"

import { resetUI } from "./ui";
import { resetHistory } from "./history";

export const resetStore = () => {
  resetUI()
  resetHistory()
}