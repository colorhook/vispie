"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  EdgeChange,
  NodeChange,
  ReactFlowProvider,
  Viewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { useAtom, useSetAtom } from "jotai";
import { dragNodeTypeAtom, fireHistory, mousePositionAtom, workflowAtom } from "@/atoms";
import WorkflowControls from "./ui/WorkflowControls";
import { CUSTOM_NODE } from "./constants";
import CustomNode from "./nodes";
import CustomEdge from "./CustomEdge";
import { initialEdges, initialNodes } from "./utils";

import { useNodesSelect } from "@/hooks/use-node-select";
import WorkflowPanel from "./ui/WorkflowPanel";
import { OverlayNode } from "./ui/NodeSelector";
import { useNodeAdd } from "@/hooks/use-node-update";
import { useEventListener } from "ahooks";

const nodeTypes = {
  [CUSTOM_NODE]: CustomNode,
};
const edgeTypes = {
  [CUSTOM_NODE]: CustomEdge,
};

function ReactFlowWrapper({ children }) {
  const { setNodeRef } = useDroppable({
    id: "droppable-area",
  });

  return <div ref={setNodeRef}>{children}</div>;
}

const Workflow: React.FC = () => {
  const workflowContainerRef = useRef<HTMLDivElement>(null);
  const [workflow, setWorkflow] = useAtom(workflowAtom);
  const setMousePosition = useSetAtom(mousePositionAtom);
  const [dragNodeType, setDragNodeType] = useAtom(dragNodeTypeAtom);
  const { handleNodeClick } = useNodesSelect();
  const addNode = useNodeAdd();

  const nodesData = useMemo(() => {
    if (workflow) {
      return initialNodes(workflow.nodes, workflow.edges);
    }

    return [];
  }, [workflow]);

  const edgesData = useMemo(() => {
    if (workflow) {
      return initialEdges(workflow.edges, workflow.nodes);
    }

    return [];
  }, [workflow]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: applyNodeChanges(changes, prev.nodes),
    }));
  }, [setWorkflow]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setWorkflow((prev) => ({
      ...prev,
      edges: applyEdgeChanges(changes, prev.edges),
    }));
  }, [setWorkflow]);

  const onConnect = useCallback((connection: Connection) => {
    setWorkflow((prev) => ({
      ...prev,
      edges: addEdge(connection, prev.edges),
    }));
  }, [setWorkflow]);

  const onMoveEnd = useCallback((event: any, viewport: Viewport) => {
    setWorkflow((prev) => ({
      ...prev,
      viewport,
    }));
  }, [setWorkflow]);

  const handleDragStart = (event) => {
    setDragNodeType(event.active.data.current.type);
  };

  const handleDragEnd = (event) => {
    const node = addNode(dragNodeType!);
    setDragNodeType(null);
  };

  const handleNodeDragStop = () => {
    fireHistory()
  }

  useEventListener("mousemove", (e) => {
    const containerClientRect = workflowContainerRef.current
      ?.getBoundingClientRect();

    if (containerClientRect) {
      setMousePosition({
        pageX: e.clientX,
        pageY: e.clientY,
        elementX: e.clientX - containerClientRect.left,
        elementY: e.clientY - containerClientRect.top,
      });
    }
  });

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <ReactFlowWrapper>
        <div
          ref={workflowContainerRef}
          className="relative w-full"
          style={{ height: `calc(100vh - 48px)` }}
        >
          <WorkflowControls />
          <WorkflowPanel />
          <DragOverlay>
            {dragNodeType ? <OverlayNode type={dragNodeType} /> : null}
          </DragOverlay>
          <ReactFlow
            nodes={nodesData}
            edges={edgesData}
            // onNodeDragStart={handleNodeDragStart}
            // onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            // onNodeMouseEnter={handleNodeEnter}
            // onNodeMouseLeave={handleNodeLeave}
            onNodeClick={handleNodeClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onMoveEnd={onMoveEnd}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={workflow.viewport}
            minZoom={0.25}
            style={{
              background: "#f1f2f3",
            }}
          >
            <Background
              gap={[14, 14]}
              size={2}
              color="#E4E5E7"
            />
          </ReactFlow>
        </div>
      </ReactFlowWrapper>
    </DndContext>
  );
};

const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <Workflow />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;
