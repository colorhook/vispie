import { memo } from "react";
import { MiniMap } from "reactflow";
import ZoomInOut from "./ZoomInOut";
import NodeSelector from "./NodeSelector";

const WorkflowControls: React.FC = () => {
  return (
    <>
      <MiniMap
        style={{
          width: 102,
          height: 72,
        }}
        className="!absolute !left-4 !bottom-14 z-[9] !m-0 !w-[102px] !h-[72px] !border-[0.5px] !border-black/8 !rounded-lg !shadow-lg"
      />
      <div className="flex items-center mt-1 gap-2 absolute left-4 bottom-4 z-[9]">
        <ZoomInOut />
        <NodeSelector/>
      </div>
    </>
  );
};

export default memo(WorkflowControls);
