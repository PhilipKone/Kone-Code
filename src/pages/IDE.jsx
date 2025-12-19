import React from 'react';
import Editor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { FaFolder, FaCode, FaTerminal, FaPlay, FaCog, FaChevronLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const IDE = () => {
    // Basic Layout Structure
    return (
        <div className="d-flex h-100 w-100 bg-secondary overflow-hidden" style={{ height: '100vh', backgroundColor: '#0d1117' }}>
            {/* Sidebar - Activity Bar */}
            <div className="d-flex flex-column align-items-center py-3 border-end border-secondary" style={{ width: '50px', backgroundColor: '#0a0c10', borderColor: '#30363d' }}>
                <Link to="/" className="mb-4 text-secondary hover-text-white" title="Home">
                    <FaChevronLeft size={20} />
                </Link>
                <div className="mb-4 text-accent cursor-pointer" title="Explorer">
                    <FaFolder size={24} />
                </div>
                <div className="mb-4 text-secondary cursor-pointer hover-text-white" title="Source Control">
                    <FaCode size={24} />
                </div>
                <div className="mt-auto mb-3 text-secondary cursor-pointer hover-text-white" title="Settings">
                    <FaCog size={24} />
                </div>
            </div>

            {/* Sidebar - Explorer Panel */}
            <div className="d-none d-md-flex flex-column border-end border-secondary p-0" style={{ width: '250px', backgroundColor: '#0d1117', borderColor: '#30363d' }}>
                <div className="p-2 px-3 text-uppercase text-secondary fw-bold small ls-1 border-bottom border-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    Explorer
                </div>
                <div className="p-2">
                    <div className="d-flex align-items-center gap-2 p-1 text-white rounded hover-bg-light cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#F7DF1E' }}>JS</span> <span>main.js</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 d-flex flex-column">
                {/* Editor Tabs */}
                <div className="d-flex bg-primary border-bottom border-secondary" style={{ backgroundColor: '#0a0c10', borderColor: '#30363d' }}>
                    <div className="d-flex align-items-center gap-2 px-3 py-2 border-top border-accent bg-secondary text-white small cursor-pointer" style={{ borderTopWidth: '2px', backgroundColor: '#161b22' }}>
                        <span style={{ color: '#F7DF1E' }}>JS</span> main.js <FaTimes className="ms-2 text-secondary" size={12} />
                    </div>
                </div>

                {/* Split View: Editor & Terminal */}
                <div className="flex-grow-1 d-flex flex-column" style={{ position: 'relative' }}>

                    {/* Monaco Editor Container */}
                    <div className="flex-grow-1">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            defaultValue="// Welcome to Kone Code IDE\n\nfunction main() {\n  console.log('Hello, World!');\n}\n\nmain();"
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'Fira Code', Consolas, monospace",
                                padding: { top: 20 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true
                            }}
                        />
                    </div>

                    {/* Terminal Panel */}
                    <div className="border-top border-secondary bg-primary" style={{ height: '200px', backgroundColor: '#0a0c10', borderColor: '#30363d' }}>
                        <div className="d-flex justify-content-between align-items-center px-3 py-1 border-bottom border-secondary" style={{ borderColor: '#30363d' }}>
                            <div className="d-flex gap-3 text-uppercase small fw-bold text-secondary" style={{ fontSize: '0.7rem' }}>
                                <span className="text-accent border-bottom border-accent pb-1">Terminal</span>
                                <span>Output</span>
                                <span>Problems</span>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm text-success p-0 border-0 bg-transparent">
                                    <FaPlay size={12} /> Run
                                </button>
                                <button className="btn btn-sm text-secondary p-0 border-0 bg-transparent">
                                    <FaTerminal size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="p-2 font-monospace text-secondary small" style={{ fontFamily: 'Consolas, monospace' }}>
                            <span className="text-success">➜</span> <span className="text-info">~/project</span> node main.js
                            <br />
                            Hello, World!
                            <br />
                            <span className="text-success">➜</span> <span className="text-info">~/project</span> <span className="text-white">_</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDE;
