import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ file, onChange }) => {
    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    function handleEditorChange(value, event) {
        if (onChange) {
            onChange(value);
        }
    }

    // Fallback if no file is selected (shouldn't happen in normal flow but good for safety)
    if (!file) {
        return <div style={{ color: '#fff', padding: '20px' }}>No file selected</div>;
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Editor
                key={file.name} // Force re-render/re-init when file changes to ensure new content is loaded cleanly
                path={file.name} // Helps Monaco identify the file type and context
                height="100%"
                defaultLanguage={file.language}
                defaultValue={file.value}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
