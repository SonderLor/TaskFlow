import React, { useState } from 'react';
import ReactMde from 'react-mde';
import 'react-mde/lib/styles/css/react-mde-all.css';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder }) => {
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

  return (
    <div className="markdown-editor">
      <ReactMde
        value={value}
        onChange={onChange}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={markdown =>
          Promise.resolve(<MarkdownRenderer content={markdown} />)
        }
        childProps={{
          writeButton: {
            tabIndex: -1
          },
          textArea: {
            placeholder: placeholder || "Write your description in Markdown..."
          }
        }}
        minEditorHeight={200}
        heightUnits="px"
      />
      <div className="mt-2 text-muted small">
        <em>Support for Markdown: **bold**, *italic*, `code`, [links](url), ![images](url), etc.</em>
      </div>
    </div>
  );
};

export default MarkdownEditor;
