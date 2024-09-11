import React, { memo, useState } from "react";
import { Box, Spinner, Text } from "@radix-ui/themes";
import { CommonNodeType, NodeRun, NodeRunningStatus } from "../types";
import BlockIcon from "../block-icon";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import CodeEditor from "./CodeEditor";

const formatDurationWithPrecision = (endTime: string, startTime: string) => {
  const end = new Date(endTime);
  const start = new Date(startTime);

  const milliseconds = end.getTime() - start.getTime();

  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else {
    const seconds = Math.floor(milliseconds / 1000);
    const remainingMs = milliseconds % 1000;
    return `${seconds}.${remainingMs.toString().padStart(3, "0")}s`;
  }
};

interface NodeTracingProps {
  nodeRun: NodeRun;
  data: CommonNodeType;
}

/**
 * 当个节点执行细节
 * @param param0 
 * @returns 
 */
const NodeTracing: React.FC<NodeTracingProps> = ({
  nodeRun,
  data,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  let icon: React.ReactNode;
  let cost: React.ReactNode;
  if (nodeRun.status === NodeRunningStatus.Succeeded) {
    icon = <CheckCircledIcon color="green" />;
  } else if (nodeRun.status === NodeRunningStatus.Failed) {
    icon = <CrossCircledIcon color="red" />;
  } else {
    icon = <Spinner />;
  }

  if (nodeRun.finishedAt) {
    cost = (
      <span className="text-sm text-gray-400">
        {formatDurationWithPrecision(
          nodeRun.finishedAt,
          nodeRun.startedAt,
        )}
      </span>
    );
  }

  return (
    <div className="p-3 rounded-md border border-gray-100 shadow-xs transition-all hover:shadow-md bg-white">
      <div
        className="flex items-center"
        onClick={() => {
          setOpen(!open);
        }}
      >
        <BlockIcon
          className="shrink-0 mr-2"
          type={data.type}
          size="md"
        />
        <div className="grow mr-1 font-semibold truncate">
          {data.title}
        </div>
        <div className="flex items-center gap-2">
          {cost}
          {icon}
        </div>
      </div>
      {open && nodeRun.inputs && (
        <Box className="pt-2">
          <Text size="2" weight="medium">输入</Text>
          <CodeEditor value={JSON.stringify(nodeRun.inputs, null, 2)} />
        </Box>
      )}
      {open && nodeRun.error && (
        <Box className="pt-2">
          <Text size="2" weight="medium">异常</Text>
          <CodeEditor value={nodeRun.error} />
        </Box>
      )}
      {open && nodeRun.outputs && (
        <Box className="pt-2">
          <Text size="2" weight="medium">输出</Text>
          <CodeEditor value={JSON.stringify(nodeRun.outputs, null, 2)} />
        </Box>
      )}
    </div>
  );
};

export default memo(NodeTracing);
