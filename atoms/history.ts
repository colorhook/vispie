import { atom, useAtomValue } from "jotai";
import { Patch, applyPatches, produceWithPatches } from "immer";
import {enablePatches} from "immer"
import { atomWithImmer, withImmer } from "jotai-immer";
import { store } from "./store";
import { workflowAtom } from "./workflow";
import { Workflow } from "@/components/workflow/types";

enablePatches()

interface HistoryInfo {
  patch: Patch,
  inverse: Patch,
}

interface HistoryState {
  undo: HistoryInfo[];
  redo: HistoryInfo[];
}

export const historyAtom = atomWithImmer<HistoryState>({
  undo: [],
  redo: []
});

export interface HistoryItem {
  workflow: Workflow
}

export const historyItemAtom = atomWithImmer<HistoryItem>({
  workflow: store.get(workflowAtom)!
});

export const fireHistoryAtom = atom(0.0);

store.sub(fireHistoryAtom, () => {
  const workflow = store.get(workflowAtom)!;
  const oldHistory = store.get(historyItemAtom)
  const [next, patch, inverse] = produceWithPatches(oldHistory, (draft) => {
    draft = { 
      workflow
    };
    return draft;
  })
  store.set(historyItemAtom, next);
  store.set(historyAtom, (draft) => {
    draft.undo.push({
      patch: patch[0]!,
      inverse: inverse[0]!,
    });
    draft.redo = [];
  })
})


let historyStopFlag = false;
export const setHistoryStopFlag = (stopFlag: boolean = true) => {
  historyStopFlag = stopFlag
}

let undoRedoStopFlag = false;
export const setUndoRedoStopFlag = (stopFlag: boolean = true) => {
  undoRedoStopFlag = stopFlag
}

export const fireHistory = (openFlag: boolean = false) => {
  if (openFlag) {
    historyStopFlag = false;
  }
  if (historyStopFlag) {
    return;
  }
  setTimeout(() => {
    store.set(fireHistoryAtom, Math.random());
  }, 20);
};

export const setHistory = (item: HistoryItem) => {
  store.set(workflowAtom, item.workflow)

  store.set(historyItemAtom, (draft) => {
    draft = item;
    return draft;
  });
}

export const hasUndo = () => {
  const history = useAtomValue(historyAtom);
  return history.undo.length > 0
}

export const hasRedo = () => {
  const history = useAtomValue(historyAtom);
  return history.redo.length > 0
}

/**
 * Undo
 * @returns 
 */
export const undoHistory = () => {
  if (undoRedoStopFlag) {
    return
  }
  const history = store.get(historyAtom);
  if (history.undo.length === 0) {
    return
  }
  const old = history.undo[history.undo.length - 1]!;
  const currentItem = store.get(historyItemAtom);
  const item = applyPatches(currentItem, [old.inverse]);
  setHistory(item);
  store.set(historyAtom, (draft) => {
    const current = draft.undo.pop();
    if (current) {
      draft.redo.push(current);
    }
  })
}

/**
 * Redo
 * @returns 
 */
export const redoHistory= () => {
  if (undoRedoStopFlag) {
    return
  }
  const history = store.get(historyAtom);
  if (history.redo.length === 0) {
    return;
  }
  const old = history.redo[history.redo.length - 1]!;
  const currentItem = store.get(historyItemAtom);
  const item = applyPatches(currentItem, [old.patch]);
  setHistory(item);
  store.set(historyAtom, (draft) => {
    const current = draft.redo.pop();
    if (current) {
      draft.undo.push(current);
    }
  });
};


export const resetHistory = () => {
  store.set(historyAtom, (draft) => {
    draft = {
      redo: [],
      undo: [],
    }
    return draft
  });
  store.set(historyItemAtom, (draft) => {
    draft = {
      workflow: store.get(workflowAtom)!
    }
    return draft
  })
  setHistoryStopFlag(false)
  setUndoRedoStopFlag(false)
}