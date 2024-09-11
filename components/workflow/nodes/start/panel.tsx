import type { FC } from "react";
import React from "react";

import type { StartNodeType } from "./types";

import type { NodePanelProps } from "@/components/workflow/types";
import { Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

const Panel: FC<NodePanelProps<StartNodeType>> = ({
  id,
  data,
}) => {
  return (
    <div className="mt-2">
      <div className="px-4 pb-2 space-y-4">
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            开始节点
          </Callout.Text>
        </Callout.Root>
      </div>
    </div>
  );
};

export default React.memo(Panel);
