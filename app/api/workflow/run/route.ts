import { NextRequest } from "next/server";
import WorkflowEngine from "@/components/workflow/WorkflowEngine";

export async function POST(req: NextRequest) {
  const workflow = await req.json();

  // Validate the workflow data
  if (!workflow || !workflow.nodes || !workflow.edges) {
    return new Response(JSON.stringify({ error: "Invalid workflow data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const engine = new WorkflowEngine();

  // Create a ReadableStream for the response
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(
          JSON.stringify({
            type: event,
            data,
          }) + "\n",
        ));
      };

      engine.on(
        "workflowStarted",
        (event) => sendEvent("workflowStarted", event),
      );
      engine.on("workflowFinished", (event) => {
        sendEvent("workflowFinished", event);
        controller.close();
      });
      engine.on("nodeStarted", (event) => sendEvent("nodeStarted", event));
      engine.on("nodeFinished", (event) => sendEvent("nodeFinished", event));
      engine.on(
        "workflowUpdate",
        (event) => sendEvent("workflowUpdate", event),
      );

      // Start the workflow execution
      engine.runWorkflow(workflow).catch((error) => {
        sendEvent("error", {
          error: error.message,
        });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
