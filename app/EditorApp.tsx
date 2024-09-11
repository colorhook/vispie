"use client";
import { Provider } from "jotai";
import { store } from "@/atoms";
import EditorHeader from "./EditorHeader";
import WorkflowEditor from "@/components/workflow";

export const EditorApp = () => {
  return (
    <Provider store={store}>
      <div className="flex flex-col w-full h-full relative">
        <EditorHeader />
        <WorkflowEditor />
      </div>
    </Provider>
  );
};
