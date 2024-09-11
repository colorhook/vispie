import { memo, useCallback, useState } from "react";
import type { EdgeProps } from "reactflow";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Position,
} from "reactflow";

import { ITERATION_CHILDREN_Z_INDEX } from "./constants";
import { cn } from "@/utils";

const CustomEdge = ({
  id,
  data,
  source,
  sourceHandleId,
  target,
  targetHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
}: EdgeProps) => {
  const [
    edgePath,
    labelX,
    labelY,
  ] = getBezierPath({
    sourceX: sourceX - 8,
    sourceY,
    sourcePosition: Position.Right,
    targetX: targetX + 8,
    targetY,
    targetPosition: Position.Left,
    curvature: 0.16,
  });
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback((v: boolean) => {
    setOpen(v);
  }, []);


  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: (selected || data?._connectedNodeIsHovering || data?._run)
            ? "#2970FF"
            : "#D0D5DD",
          strokeWidth: 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className={cn(
            "nopan nodrag hover:scale-125",
            data?._hovering ? "block" : "hidden",
            open && "!block",
            data.isInIteration && `z-[${ITERATION_CHILDREN_Z_INDEX}]`,
          )}
          style={{
            position: "absolute",
            transform:
              `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
        >
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(CustomEdge);
