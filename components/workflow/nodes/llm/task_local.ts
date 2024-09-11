import mitt from "mitt";
// import fetch from 'node-fetch';
import { NodeRunOutput, VariablePool, WorkflowNode } from "../../types";
import { LLMNodeType } from "./types";
import { replaceVariables } from "@/utils/helpers";
import { WorkflowEvent } from "../../WorkflowEngine";

async function run(
  node: WorkflowNode<LLMNodeType>,
  variablePool: VariablePool,
  emitter: ReturnType<typeof mitt<WorkflowEvent>>,
): Promise<NodeRunOutput> {
  const model = node.data.model;
  const apiKey = node.data.apiKey;
  let prompt = node.data.prompt;

  if (!apiKey || !prompt) {
    throw new Error("parameters missing");
  }

  prompt = replaceVariables(prompt, variablePool);

  const response = await fetch(`http://127.0.0.1:8000/proxy/${model}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey, prompt }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  let content = "";

  if (response.body) {
    const reader = response.body.getReader();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += new TextDecoder().decode(value);

      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const text = line.slice(6); // Remove 'data: ' prefix
          if (text === "[DONE]") {
            // Stream finished
            break;
          }
          content += text;
          emitter.emit("nodeStreamOutput", {
            id: node.id,
            output: content,
          });
        }
      }
    }
  } else {
    content = await response.text();
  }

  return { content };
}

export default {
  run,
};
