import type { FC } from "react";
import React, { useCallback } from "react";
import type { LLMNodeType } from "./types";
import { type NodePanelProps } from "@/components/workflow/types";
import {
  Box,
  Callout,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useNodeUpdate } from "@/hooks/use-node-update";
import { fireHistory } from "@/atoms";

const Panel: FC<NodePanelProps<LLMNodeType>> = ({
  id,
  data,
}) => {
  const updateNode = useNodeUpdate<LLMNodeType>();

  const onModelChange = useCallback((model: string) => {
    updateNode(id, { model });
    fireHistory()
  }, [id, updateNode]);

  const onAPIKeyChange = useCallback((e) => {
    const apiKey = e.target.value;
    updateNode(id, { apiKey });
    fireHistory()
  }, [id, updateNode]);

  const onPromptChange = useCallback((e) => {
    const prompt = e.target.value;
    updateNode(id, { prompt });
    fireHistory()
  }, [id, updateNode]);

  return (
    <div className="mt-2">
      <div className="px-4 pb-4 space-y-4">
        <Box>
          <Text size="2" weight="bold">Model:</Text>
          <Select.Root value={data.model ?? 'groq'} onValueChange={onModelChange}>
            <Select.Trigger mt="2" className="w-full" variant="soft" />
            <Select.Content style={{ height: "auto" }} side="bottom">
              <Select.Item value="groq">Groq</Select.Item>
              <Select.Item value="gemini">Google Gemini</Select.Item>
              <Select.Item value="openai">OpenAI</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
        <Box>
          <Text size="2" weight="bold">API Key:</Text>
          <TextField.Root
            size="2"
            mt="2"
            placeholder="请输入 API Key"
            value={data.apiKey ?? ''}
            onChange={onAPIKeyChange}
          />
        </Box>
        <Box>
          <Text size="2" weight="bold">Prompt:</Text>
          <TextArea
            size="2"
            rows={5}
            placeholder="请输入提示词"
            value={data.prompt ?? ''}
            onChange={onPromptChange}
          />
        </Box>
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            变量使用 {`{{}}`} 包裹，例如 {`{{variable}}`}
          </Callout.Text>
        </Callout.Root>
      </div>
    </div>
  );
};

export default React.memo(Panel);
