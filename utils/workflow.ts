import { toast } from 'sonner';
import { nanoid, shortid } from './nanoid';
import { Workflow, WorkflowNode, WorkflowEdge, NodeType } from '@/components/workflow/types';

/**
 * 创建默认 Workflow
 * @returns 
 */
const createDefaultWorkflow = (): Workflow => {
  const startNode: WorkflowNode = {
    id: shortid(),
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { 
      title: 'Start',
      type: 'start', 
    },
  };

  const llmNode: WorkflowNode = {
    id: shortid(),
    type: 'custom',
    position: { x: 300, y: 200 },
    data: {
      type: 'llm',
      title: 'LLM',
      model: 'groq',
      apiKey: '',
      prompt: '',
    },
  };

  const endNode: WorkflowNode = {
    id: shortid(),
    type: 'custom',
    position: { x: 500, y: 300 },
    data: { 
      type: 'end',
      output: 'content',
      title: 'End',
    },
  };

  const startToLlmEdge: WorkflowEdge = {
    id: shortid(),
    source: startNode.id,
    target: llmNode.id,
    type: 'default',
  };

  const llmToEndEdge: WorkflowEdge = {
    id: shortid(),
    source: llmNode.id,
    target: endNode.id,
    type: 'custom',
    data: {
      sourceType: 'llm',
      targetType: 'end',
    }
  };

  return {
    id: nanoid(),
    name: 'New Workflow',
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [startNode, llmNode, endNode],
    edges: [startToLlmEdge, llmToEndEdge],
  };
};


/**
 * 保存 Workflow 到本地磁盘
 * @param workflow 
 * @returns 
 */
const saveWorkflowToDisk = async (workflow: Workflow) => {
  if (typeof window.showSaveFilePicker !== 'function') {
    toast.warning('该浏览器不支持 FileSystem API')
    return;
  }
  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `${workflow.name}.json`,
      types: [{
        description: 'JSON File',
        accept: { 'application/json': ['.json'] },
      }],
    });

    // 创建可写流
    const writable = await fileHandle.createWritable();

    // 将工作流转换为 JSON 并写入文件
    await writable.write(JSON.stringify(workflow, null, 2));

    // 关闭流
    await writable.close();

  } catch (error) {
  }
}

/**
 * 从 JSON 文件加载 Workflow
 * @returns 
 */
const loadWorkflowFromDisk = async (): Promise<Workflow | null> => {
  if (typeof window.showOpenFilePicker !== 'function') {
    toast.warning('该浏览器不支持 FileSystem API')
    return null
  }
  try {
    // 请求用户选择要加载的文件
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON File',
        accept: { 'application/json': ['.json'] },
      }],
    });

    // 获取文件内容
    const file = await fileHandle.getFile();
    const content = await file.text();

    // 解析 JSON 并返回工作流
    const workflow: Workflow = JSON.parse(content);
    return workflow;
  } catch (error) {
    return null;
  }
}


export { 
  createDefaultWorkflow,
  saveWorkflowToDisk,
  loadWorkflowFromDisk
};