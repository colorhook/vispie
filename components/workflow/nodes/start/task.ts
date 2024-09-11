import { NodeRunOutput, VariablePool, WorkflowNode } from "../../types";

async function run(
  node: WorkflowNode,
  variablePool: VariablePool,
): Promise<NodeRunOutput> {
  return {};
}

export default {
  run,
};
