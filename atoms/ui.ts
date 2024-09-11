import { atom } from "jotai";
import { store } from "./store";
import { NodeType, WorkflowNode } from "@/components/workflow/types";

// 当前被选中的 Node
export const selectedNodeAtom = atom<string | null>(null);

// 鼠标模式
export enum ControlMode {
  Pointer = 'pointer',
  Hand = 'hand',
}
export const controlModeAtom = atom<ControlMode>(ControlMode.Pointer);

// 当前拖动的 Node 类型
export const dragNodeTypeAtom = atom<NodeType | null>(null);

// 当前鼠标位置
export const mousePositionAtom = atom<{
  pageX: number;
  pageY: number;
  elementX: number;
  elementY: number;
}>({
  pageX: 0,
  pageY: 0,
  elementX: 0,
  elementY: 0,
});

// Workflow 是否在运行模式下，运行模式下显示运行状态
export const runningModeAtom = atom<boolean>(false);

export const resetUI = () => {
 
}