import { type FC, useCallback } from "react";
import React from "react";

import type { HTTPNodeType } from "./types";

import { type NodePanelProps } from "@/components/workflow/types";
import { Box, Callout, Text, TextField } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useNodeUpdate } from "@/hooks/use-node-update";
import { fireHistory } from "@/atoms";

const Panel: FC<NodePanelProps<HTTPNodeType>> = ({
  id,
  data,
}) => {
  const updateNode = useNodeUpdate<HTTPNodeType>();

  const onTextChange = useCallback((e) => {
    const url: string = e.target.value;
    updateNode(id, {
      url,
    });
    fireHistory()
  }, [id, updateNode]);

  return (
    <div className="mt-2">
      <div className="px-4 pb-4 space-y-4">
        <Box>
          <Text size="2" weight="bold">URL:</Text>
          <TextField.Root
            size="2"
            mt="2"
            placeholder="URL"
            value={data.url ?? ""}
            onChange={onTextChange}
          />
        </Box>
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            测试用，只支持 HTTP GET 请求
          </Callout.Text>
        </Callout.Root>
      </div>
    </div>
  );
};

export default React.memo(Panel);
