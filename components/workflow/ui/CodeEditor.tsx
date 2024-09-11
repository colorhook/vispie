import React, { memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

/**
 * JSON 展示组件
 * @param param0 
 * @returns 
 */
const CodeEditor: React.FC<{value: string}> = ({ value }) => {
  return (
    <CodeMirror
      value={value}
      extensions={[jsonLang()]}
      theme={oneDark}
      readOnly
      height='100px'
      className='rounded-lg overflow-hidden'
      style={{marginTop: 2, fontSize: 11, width: '100%' }}
    />
  );
};

export default memo(CodeEditor);