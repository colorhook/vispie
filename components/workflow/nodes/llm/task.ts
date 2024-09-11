import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import mitt from "mitt";
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

  if (model === "groq") {
    const groq = new Groq({
      apiKey,
    });

    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
      stream: true,
    });

    let content = "";
    for await (const chunk of stream) {
      const item = chunk.choices[0]?.delta?.content || "";
      content += item;
      emitter.emit("nodeStreamOutput", {
        id: node.id,
        output: content,
      });
    }
    return {
      content,
    };
  } else if (model === "openai") {
    const llm = new OpenAI({
      apiKey: apiKey,
    });
    const stream = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      stream: true,
    });

    let content = "";
    for await (const chunk of stream) {
      const item = chunk.choices[0]?.delta?.content || "";
      content += item;
      emitter.emit("nodeStreamOutput", {
        id: node.id,
        output: content,
      });
    }
    return {
      content,
    };
  } else if (model === "gemini") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const llm = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await llm.generateContentStream(prompt);

    let content = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      content += chunkText;
      emitter.emit("nodeStreamOutput", {
        id: node.id,
        output: content,
      });
    }

    return {
      content,
    };
  } else {
    throw new Error("Unsupported LLM Model");
  }
}

export default {
  run,
};
