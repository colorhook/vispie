import { NodeType } from "../../types";
import type { NodeDefault } from "../../types";
import type { HTTPNodeType } from "./types";
import { ALL_COMPLETION_AVAILABLE_BLOCKS } from "@/components/workflow/constants";

const nodeDefault: NodeDefault<HTTPNodeType> = {
  defaultValue: {
    url: "https://s.jina.ai/Dify",
    method: "GET",
  },
  getAvailablePrevNodes() {
    const nodes = ALL_COMPLETION_AVAILABLE_BLOCKS.filter((type) =>
      type !== NodeType.End
    );
    return nodes;
  },
  getAvailableNextNodes() {
    const nodes = ALL_COMPLETION_AVAILABLE_BLOCKS;
    return nodes;
  },
  checkValid(payload: HTTPNodeType) {
    let isValid = true;
    let errorMessages = "";
    if (!payload.url || !payload.url.startsWith("http")) {
      isValid = false;
      errorMessages = "invalid URL";
    }
    return {
      isValid,
      errorMessage: errorMessages,
    };
  },
};

export default nodeDefault;
