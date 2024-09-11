import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { cors } from "hono/cors";

const app = new Hono();
app.use("/*", cors());

app.post("/proxy/:model", async (c) => {
  const model = c.req.param("model");
  const body = await c.req.json();

  if (!body) {
    return c.json({ error: "Missing request body" }, 400);
  }

  const { apiKey, prompt } = body;

  if (!apiKey || !prompt) {
    return c.json({ error: "Missing apiKey or prompt" }, 400);
  }

  
  let url: string;
  let headers: HeadersInit = { "Content-Type": "application/json" };
  let requestBody: any;

  switch (model) {
    case "groq":
      url = "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      requestBody = {
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      };
      break;
    case "openai":
      url = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      requestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      };
      break;
    case "gemini":
      url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent";
      headers["x-goog-api-key"] = apiKey;
      requestBody = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      };
      break;
    default:
      return c.json({ error: "Unsupported LLM Model" }, 400);
  }


  return streamSSE(c, async (stream) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (model === "gemini") {
          buffer += new TextDecoder().decode(value);
          const regex = /"parts":\s*(\[(?:\s*{[^}]*}\s*,?)*\s*\])/g;
          let match;
          
          while ((match = regex.exec(buffer)) !== null) {
            try {
              const parts = JSON.parse(match[1]);
              for (const part of parts) {
                if (part.text) {
                  console.log("Gemini Content:", part.text);
                  await stream.writeSSE({ data: part.text.trim() });
                }
              }
              
              // Remove processed content from buffer
              buffer = buffer.slice(match.index + match[0].length);
            } catch (e) {
              console.error("Error parsing Gemini response:", e);
            }
          }
        } else {
          buffer += new TextDecoder().decode(value);
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              if (jsonStr === "[DONE]") {
                // Stream finished
                break;
              }
              try {
                const jsonData = JSON.parse(jsonStr);
                const content = jsonData.choices?.[0]?.delta?.content || "";
                if (content) {
                  await stream.writeSSE({ data: content });
                }
              } catch (e) {
                console.error("Error parsing JSON:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      await stream.writeSSE({ data: `Error: ${error.message}` });
    }
  });
});

// 健康检查接口
app.get("/health", (c) => c.text("OK"));

Deno.serve(app.fetch);
