"use client";
import * as React from "react";
import { Button, IconButton, Spinner, Tooltip } from "@radix-ui/themes";
import { Redo2, SaveIcon, Undo2 } from "lucide-react";

import {
  hasRedo,
  hasUndo,
  redoHistory,
  runningModeAtom,
  undoHistory,
  workflowAtom,
  workflowRunningAtom,
} from "@/atoms";
import { useHotkeys } from "react-hotkeys-hook";
import {
  EnvelopeOpenIcon,
  HeartFilledIcon,
  PlayIcon,
} from "@radix-ui/react-icons";
import { useAtom, useAtomValue } from "jotai";
import { useWorkflowRunUpdate } from "@/hooks/use-workflow-run";
import { loadWorkflowFromDisk, saveWorkflowToDisk } from "@/utils/workflow";

export default function EditorHeader() {
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  const [workflowRunning, setWorkflowRunning] = useAtom(workflowRunningAtom);
  const [runningMode, setRunningMode] = useAtom(runningModeAtom);
  const updateWorkflowRun = useWorkflowRunUpdate();

  const undoDisabled = !hasUndo();
  const redoDisabled = !hasRedo();

  useHotkeys("meta+z,ctrl+z", undoHistory);
  useHotkeys("meta+shift+z,ctrl+shift+z", redoHistory);

  const handleOpenWorkflow = async () => {
    const workflow = await loadWorkflowFromDisk();
    if (workflow) {
      setWorkflow(workflow);
    }
  };

  const handleSaveWorkflow = async () => {
    await saveWorkflowToDisk(workflow);
  };

  const runWorkflow = async () => {
    if (workflowRunning) {
      return;
    }
    setWorkflowRunning(true);
    setRunningMode(true);
    try {
      const response = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = 0;
        while (boundary !== -1) {
          boundary = buffer.indexOf("\n");
          if (boundary !== -1) {
            const jsonString = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 1);
            if (jsonString) {
              try {
                const json = JSON.parse(jsonString);
                if (json.type === "error") {
                  throw new Error(json.error);
                } else {
                  updateWorkflowRun(json);
                }
              } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
              }
            }
          }
        }
      }

      // 处理最后可能剩余的数据
      if (buffer.trim()) {
        try {
          const json = JSON.parse(buffer.trim());
          if (json.type === "error") {
            throw new Error(json.error);
          } else {
            updateWorkflowRun(json);
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
        }
      }
    } catch (error) {
      console.error("Error running workflow:", error);
    } finally {
      setWorkflowRunning(false);
    }
  };

  return (
    <header className="flex relative items-center w-full h-12 px-4 shrink-0 border-b bg-gray-50 border-gray-4 box-border">
      <div className="flex items-center mr-4 basis-1/5">
        <div className="relative flex flex-row justify-between py-2 align-center md:py-2">
          <div className="flex items-center">
            <HeartFilledIcon color="var(--red-9)" width={24} height={24} />
            <h2 className="font-bold text-lg pl-2">{workflow.name}</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 justify-center ">
      </div>
      <div className="flex items-center w-[344px] justify-end gap-2 ml-2">
        <div className="flex items-start gap-3 mr-2">
          <Tooltip content="Undo ⌘+Z">
            <IconButton
              variant="ghost"
              disabled={undoDisabled}
              onClick={() => {
                undoHistory();
              }}
            >
              <Undo2
                size={20}
                strokeWidth={1.5}
                color={undoDisabled ? "var(--gray-6)" : "var(--gray-9)"}
              />
            </IconButton>
          </Tooltip>
          <Tooltip content="Redo ⌘+Shift+Z">
            <IconButton
              variant="ghost"
              disabled={redoDisabled}
              onClick={() => {
                redoHistory();
              }}
            >
              <Redo2
                size={20}
                strokeWidth={1.5}
                color={redoDisabled ? "var(--gray-6)" : "var(--gray-9)"}
              />
            </IconButton>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 px-2">
          <Button
            className="ml-4"
            variant="soft"
            color="gray"
            onClick={handleOpenWorkflow}
          >
            <EnvelopeOpenIcon className="w-3.5 h-3.5" />打开
          </Button>
          <Button
            className="ml-4"
            variant="soft"
            color="gray"
            onClick={handleSaveWorkflow}
          >
            <SaveIcon size={16} strokeWidth={1.5} />保存
          </Button>
        </div>
        <Button
          color="gray"
          highContrast
          onClick={runWorkflow}
          disabled={workflowRunning}
        >
          {workflowRunning ? <Spinner /> : <PlayIcon />}
          {workflowRunning ? "Running" : "Run"}
        </Button>
      </div>
    </header>
  );
}
