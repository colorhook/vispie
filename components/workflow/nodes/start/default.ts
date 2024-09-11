import type { NodeDefault } from "@/components/workflow/types";
import type { StartNodeType } from "./types";
import { ALL_COMPLETION_AVAILABLE_BLOCKS } from "@/components/workflow/constants";

const nodeDefault: NodeDefault<StartNodeType> = {
  defaultValue: {},
  getAvailablePrevNodes() {
    return [];
  },
  getAvailableNextNodes() {
    const nodes = ALL_COMPLETION_AVAILABLE_BLOCKS;
    return nodes;
  },
  checkValid() {
    return {
      isValid: true,
    };
  },
};

export default nodeDefault;
