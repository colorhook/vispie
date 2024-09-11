import { type FC, useCallback } from "react";
import React from "react";

import type { EndNodeType } from "./types";

import { type NodePanelProps } from "@/components/workflow/types";
import { Box, Callout, Text, TextField } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useNodeUpdate } from "@/hooks/use-node-update";
import { fireHistory } from "@/atoms";

const Panel: FC<NodePanelProps<EndNodeType>> = ({
  id,
  data,
}) => {
  const updateNode = useNodeUpdate<EndNodeType>();

  const onTextChange = useCallback((e) => {
    const output: string = e.target.value;
    updateNode(id, {
      output,
    });
    fireHistory()
  }, [id, updateNode]);

  return (
    <div className="mt-2">
      <div className="px-4 pb-4 space-y-4">
        <Box>
          <Text size="2" weight="bold">Output variable name:</Text>
          <TextField.Root
            size="2"
            mt="2"
            placeholder="输出的变量名"
            value={data.output ?? ''}
            onChange={onTextChange}
          />
        </Box>
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            默认使用 content 作为输出变量名，这是 LLM
            节点的默认输出，如果上游节点是 HTTP 节点，可以将其改为 body
          </Callout.Text>
        </Callout.Root>
      </div>
    </div>
  );
};

export default React.memo(Panel);
