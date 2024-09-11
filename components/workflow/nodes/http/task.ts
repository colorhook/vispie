import { replaceVariables } from "@/utils/helpers";
import { NodeRunOutput, VariablePool, WorkflowNode } from "../../types";
import { HTTPNodeType } from "./types";

async function run(
  node: WorkflowNode<HTTPNodeType>,
  variablePool: VariablePool,
): Promise<NodeRunOutput> {
  let url = node.data.url;
  if (!url) {
    throw new Error("invalid HTTP URL");
  }

  url = replaceVariables(url, variablePool);

  if (!url.startsWith("http")) {
    throw new Error("invalid HTTP URL");
  }

  const res = await fetch(url);
  const body = await res.text();

  return {
    body,
  };
}

export default {
  run,
};
