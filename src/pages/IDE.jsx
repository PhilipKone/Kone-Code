import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFolder, FaCode, FaCog, FaChevronLeft, FaPlay, FaSave, FaPlus, FaUserCircle, FaPython, FaJs, FaHtml5, FaCss3Alt, FaBook, FaQuestionCircle, FaCommentAlt, FaEnvelope, FaGraduationCap, FaFolderPlus, FaChevronDown, FaChevronRight, FaTrash, FaExclamationTriangle, FaMobileAlt, FaFolderOpen, FaFileCode } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthInterceptModal from '../components/AuthInterceptModal';
import InstallPWAModal from '../components/InstallPWAModal';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, where, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { logActivity } from '../firebase/utils';
import ProductTour from '../components/ProductTour';
// import { FileIcon } from '@react-symbols/icons';

const IDE = () => {
    const { currentUser, loading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [language, setLanguage] = useState('html');
    const [code, setCode] = useState('<!-- Welcome to Kone Code IDE -->\n<h1>Hello, Kone Code!</h1>\n<p>Write your HTML/CSS/JS here.</p>\n<style>\n  body { font-family: system-ui; text-align: center; margin-top: 50px; color: white; background: #0d1117 }\n</style>');
    const [output, setOutput] = useState('');
    const [title, setTitle] = useState('Untitled Project');
    const [projects, setProjects] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [mobileTab, setMobileTab] = useState('editor'); // 'explorer' | 'editor' | 'preview'
    const [activeFolder, setActiveFolder] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(() => {
        const saved = localStorage.getItem('kone_code_expanded_folders');
        if (saved) {
            try {
                return new Set(JSON.parse(saved));
            } catch (e) {
                return new Set(['My Projects']);
            }
        }
        return new Set(['My Projects']);
    });
    const [confirmDelete, setConfirmDelete] = useState({ visible: false, type: null, target: null });
    const [isExecuting, setIsExecuting] = useState(false);
    const [pyodideInstance, setPyodideInstance] = useState(null);
    const [terminal, setTerminal] = useState(null);
    const terminalRef = React.useRef(null);
    const fitAddonRef = React.useRef(null);
    const inputBufferRef = React.useRef("");
    const isInputWaitingRef = React.useRef(false);
    const inputResolveRef = React.useRef(null);
    const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth < 768 ? 160 : 250);
    const [horizontalSplit, setHorizontalSplit] = useState(50); // percentage for code vs preview
    const [verticalSplit, setVerticalSplit] = useState(70); // percentage for editor vs terminal
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
    const [isResizingVertical, setIsResizingVertical] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, type: null, target: null });
    const [createFolderModal, setCreateFolderModal] = useState({ visible: false, name: '' });
    const [createProjectModal, setCreateProjectModal] = useState({ visible: false, name: '', language: 'html' });
    const [renameModal, setRenameModal] = useState({ visible: false, type: null, target: null, name: '' });
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    
    // File System Access State
    const [directoryHandle, setDirectoryHandle] = useState(null);
    const [localFiles, setLocalFiles] = useState([]); // Flat or nested list of local files
    const [activeFileHandle, setActiveFileHandle] = useState(null);
    const [isLocalMode, setIsLocalMode] = useState(false);

    // Keyboard Shortcuts (Ctrl+S for Save)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [code, isLocalMode, activeFileHandle, currentUser]); // Re-bind when state that handleSave needs changes

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setMobileTab('editor'); // Reset to default when going to desktop
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Refs for direct DOM manipulation to achieve zero-lag resizing
    const sidebarRef = React.useRef(null);
    const parentContainerRef = React.useRef(null); // Container for the entire split view
    const leftColumnRef = React.useRef(null);
    const rightColumnRef = React.useRef(null);
    const editorPaneRef = React.useRef(null);
    const terminalPaneRef = React.useRef(null);
    const previewPaneRef = React.useRef(null);
    const dragStartRect = React.useRef(null); // To store stable coordinates during a drag

    const location = useLocation();

    // Trigger auth modal if not logged in and not explicitly a guest
    useEffect(() => {
        if (!loading && !currentUser) {
            const isGuest = sessionStorage.getItem('kone_code_guest');
            if (isGuest !== 'true') {
                setShowAuthModal(true);
            }
        }
    }, [currentUser, loading]);
    
    // Log IDE Entry
    useEffect(() => {
        logActivity(currentUser, 'IDE Entered', { mode: currentUser ? 'loggedIn' : 'guest' });
    }, [currentUser]);

    // Check for first-time tour
    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('kone_code_tour_completed');
        if (!hasCompletedTour && !showAuthModal) {
            // Small delay to ensure UI is rendered and stable
            const timer = setTimeout(() => {
                setIsTourOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showAuthModal]);

    // Mouse handlers for resizing
    const rafId = React.useRef(null);
    const lastSidebarWidth = React.useRef(sidebarWidth);
    const lastHorizontalSplit = React.useRef(horizontalSplit);
    const lastVerticalSplit = React.useRef(verticalSplit);
    const lastFitTime = React.useRef(0);
    const helpMenuRef = React.useRef(null);
    const contextMenuRef = React.useRef(null);

    // Persist expanded folders to localStorage
    useEffect(() => {
        localStorage.setItem('kone_code_expanded_folders', JSON.stringify(Array.from(expandedFolders)));
    }, [expandedFolders]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (helpMenuRef.current && !helpMenuRef.current.contains(event.target)) {
                setIsHelpOpen(false);
            }
            if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu({ ...contextMenu, visible: false });
            }
        };
        if (isHelpOpen || contextMenu.visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isHelpOpen, contextMenu.visible]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizingSidebar && !isResizingHorizontal && !isResizingVertical) return;

            e.preventDefault();

            if (rafId.current) cancelAnimationFrame(rafId.current);

            rafId.current = requestAnimationFrame(() => {
                if (isResizingSidebar) {
                    const newWidth = Math.max(40, Math.min(600, e.clientX - 50));
                    lastSidebarWidth.current = newWidth;
                    if (sidebarRef.current) {
                        sidebarRef.current.style.width = `${newWidth}px`;
                        sidebarRef.current.style.minWidth = `${newWidth}px`;
                        sidebarRef.current.style.maxWidth = `${newWidth}px`;
                    }
                }

                if (isResizingHorizontal && dragStartRect.current) {
                    const rect = dragStartRect.current;
                    const pixelPos = e.clientX - rect.left;
                    const pixelWidth = Math.max(60, Math.min(rect.width - 60, pixelPos));
                    const newSplit = (pixelWidth / rect.width) * 100;
                    lastHorizontalSplit.current = newSplit;

                    if (leftColumnRef.current) {
                        leftColumnRef.current.style.width = `${pixelWidth}px`;
                        leftColumnRef.current.style.maxWidth = `${pixelWidth}px`;
                    }
                }

                if (isResizingVertical && dragStartRect.current) {
                    const rect = dragStartRect.current;
                    const pixelPos = e.clientY - rect.top;
                    // Subtract 6px for the gutter from available height
                    const availableHeight = rect.height - 6;
                    const pixelHeight = Math.max(60, Math.min(availableHeight - 60, pixelPos));
                    const newSplit = (pixelHeight / availableHeight) * 100;
                    lastVerticalSplit.current = newSplit;

                    if (editorPaneRef.current) {
                        editorPaneRef.current.style.height = `${pixelHeight}px`;
                        editorPaneRef.current.style.maxHeight = `${pixelHeight}px`;
                    }
                }

                // Immediate refit for terminal during drag (throttled to ~15fps for maximum smoothness)
                if (fitAddonRef.current) {
                    const now = Date.now();
                    if (now - lastFitTime.current > 66) {
                        fitAddonRef.current.fit();
                        lastFitTime.current = now;
                    }
                }
            });
        };

        const handleMouseUp = () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);

            // Sync final state to React
            setSidebarWidth(lastSidebarWidth.current);
            setHorizontalSplit(lastHorizontalSplit.current);
            setVerticalSplit(lastVerticalSplit.current);

            // SEAMLESS HANDOFF: Drive fixed percentages to DOM before React re-render
            // Clear minWidth/maxWidth on sidebar so React style takes over cleanly
            if (sidebarRef.current) {
                sidebarRef.current.style.minWidth = '';
                sidebarRef.current.style.maxWidth = '';
            }
            if (leftColumnRef.current) {
                leftColumnRef.current.style.width = `${lastHorizontalSplit.current}%`;
                leftColumnRef.current.style.maxWidth = '';
            }
            if (editorPaneRef.current) {
                editorPaneRef.current.style.height = `${lastVerticalSplit.current}%`;
                editorPaneRef.current.style.maxHeight = '';
            }

            // RELAX TRAIL PANELS: Let them flex naturally to fill the space
            if (previewPaneRef.current) {
                previewPaneRef.current.style.width = '';
                previewPaneRef.current.style.maxWidth = '';
            }
            if (terminalPaneRef.current) {
                terminalPaneRef.current.style.height = '';
            }

            setIsResizingSidebar(false);
            setIsResizingHorizontal(false);
            setIsResizingVertical(false);
            dragStartRect.current = null; // Reset stable rect
            document.body.style.cursor = 'default';

            // Ensure terminal and editor layout are perfect at the end
            setTimeout(() => {
                if (fitAddonRef.current) fitAddonRef.current.fit();
            }, 50);
        };

        if (isResizingSidebar || isResizingHorizontal || isResizingVertical) {
            document.body.style.userSelect = 'none';
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingSidebar, isResizingHorizontal, isResizingVertical]);

    // Initialize Terminal
    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new Terminal({
            cursorBlink: false,
            fontSize: 14,
            fontFamily: "'Fira Code', Consolas, monospace",
            theme: {
                background: '#1e1e1e',
                foreground: '#cccccc',
                selectionBackground: '#3399ff',
                cursor: '#ffffff'
            },
            convertEol: true,
            scrollback: 1000,
            wordSeparator: ' ',
            disableStdin: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        term.writeln("\x1b[32mKone Code Terminal Initialized.\x1b[0m");
        term.writeln("Ready for execution...");

        term.onData(data => {
            if (isInputWaitingRef.current) {
                // Re-enable stdin when waiting for input()
                term.options.disableStdin = false;
                // handle input during code execution
                if (data === "\r") { // Enter
                    term.write("\r\n");
                    const input = inputBufferRef.current;
                    inputBufferRef.current = "";
                    isInputWaitingRef.current = false;
                    term.options.disableStdin = true;
                    if (inputResolveRef.current) inputResolveRef.current(input);
                } else if (data === "\x7f") { // Backspace
                    if (inputBufferRef.current.length > 0) {
                        inputBufferRef.current = inputBufferRef.current.slice(0, -1);
                        term.write("\b \b");
                    }
                } else {
                    inputBufferRef.current += data;
                    term.write(data);
                }
            }
        });

        setTerminal(term);
        fitAddonRef.current = fitAddon;

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            term.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Final fit-on-mount helper (not needed during active drag since handleMouseMove handles it)
    useEffect(() => {
        if (fitAddonRef.current && !isResizingSidebar && !isResizingHorizontal && !isResizingVertical) {
            fitAddonRef.current.fit();
        }
    }, [horizontalSplit, verticalSplit, sidebarWidth]);

    useEffect(() => {
        fetchData();
        const params = new URLSearchParams(location.search);
        const urlCode = params.get('code');
        const urlLang = params.get('lang');
        const templateId = params.get('templateId');

        if (urlCode && urlLang) {
            try {
                setCode(decodeURIComponent(urlCode));
                setLanguage(urlLang);
                setTitle('Run from Documentation');
            } catch (e) {
                console.error("Failed to decode code snippet from URL:", e);
            }
        } else if (templateId && templates.length > 0) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setCode(template.code);
                setLanguage(template.language);
                setTitle(`${template.title} (Tutorial)`);
                setOutput('');
            }
        }
    }, [location.search, templates]);

    const fetchData = async () => {
        try {
            if (!currentUser) {
                // For guests: Still show the templates, but clear user projects
                const templatesSnapshot = await getDocs(query(collection(db, 'kone_code_templates'), orderBy('createdAt', 'desc')));
                setTemplates(templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setProjects([]);
                return;
            }

            // Fetch user-owned projects OR legacy projects (for migration grace period)
            // Note: In a production system, we'd ideally run a one-time migration to assign legacy projects
            const q = query(
                collection(db, 'kone_code_projects'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );
            const projectsSnapshot = await getDocs(q);
            setProjects(projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch admin templates
            const templatesSnapshot = await getDocs(query(collection(db, 'kone_code_templates'), orderBy('createdAt', 'desc')));
            setTemplates(templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching IDE data:", error);
        }
    };

    // --- File System Access Functions ---
    
    const handleOpenLocalFolder = async () => {
        try {
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
            setDirectoryHandle(handle);
            setIsLocalMode(true);
            await scanLocalDirectory(handle);
            setExpandedFolders(prev => new Set([...prev, handle.name]));
            setActiveFolder(handle.name);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("File System Access Error:", err);
                alert("Failed to open local folder. Make sure your browser supports the File System Access API (Chrome/Edge recommended).");
            }
        }
    };

    const scanLocalDirectory = async (dirHandle) => {
        const files = [];
        async function read(handle, path = "") {
            const entries = [];
            for await (const entry of handle.values()) {
                const entryPath = path ? `${path}/${entry.name}` : entry.name;
                if (entry.kind === 'directory') {
                    // Directories will be expanded on click in the UI
                    entries.push({
                        name: entry.name,
                        kind: 'directory',
                        handle: entry,
                        path: entryPath,
                        children: [] // Placeholder
                    });
                } else {
                    entries.push({
                        name: entry.name,
                        kind: 'file',
                        handle: entry,
                        path: entryPath
                    });
                }
            }
            return entries;
        }
        
        const folderContents = await read(dirHandle);
        setLocalFiles(folderContents);
    };

    const loadLocalFile = async (fileHandle) => {
        try {
            // Verify permission
            const permission = await fileHandle.queryPermission({ mode: 'readwrite' });
            if (permission !== 'granted') {
                const request = await fileHandle.requestPermission({ mode: 'readwrite' });
                if (request !== 'granted') return;
            }

            const file = await fileHandle.getFile();
            const content = await file.text();
            
            // Auto-detect language by extension
            const ext = file.name.split('.').pop().toLowerCase();
            let lang = 'html';
            if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) lang = 'javascript-node';
            if (['py'].includes(ext)) lang = 'python';
            if (['css'].includes(ext)) lang = 'css';
            if (['lua'].includes(ext)) lang = 'lua';
            if (['html', 'htm'].includes(ext)) lang = 'html';

            setCode(content);
            setLanguage(lang);
            setTitle(file.name.replace(/\.[^/.]+$/, "")); 
            setActiveFileHandle(fileHandle);
            setIsLocalMode(true);
            setOutput(''); 

            if (isMobile) setMobileTab('editor');
        } catch (err) {
            console.error("Error loading local file:", err);
            alert("Could not read file: " + err.message);
        }
    };

    const saveLocalFile = async () => {
        if (!activeFileHandle) return;
        
        try {
            const permission = await activeFileHandle.queryPermission({ mode: 'readwrite' });
            if (permission !== 'granted') {
                const request = await activeFileHandle.requestPermission({ mode: 'readwrite' });
                if (request !== 'granted') return;
            }

            const writable = await activeFileHandle.createWritable();
            await writable.write(code);
            await writable.close();
            console.log("File saved locally:", activeFileHandle.name);
        } catch (err) {
            console.error("Error saving local file:", err);
            alert("Failed to save to local file: " + err.message);
        }
    };

    const handleRun = async () => {
        logActivity(currentUser, 'Code Run', { language, isLocal: isLocalMode });
        if (language === 'html' || language === 'javascript' || language === 'css') {
            const htmlStructure = language === 'html' ? code :
                `<html><style>body{color:white; font-family: sans-serif;}</style><body><script>${code}</script></body></html>`;
            setOutput(htmlStructure);
            if (isMobile) setMobileTab('preview');
        } else if (language === 'python') {
            // Execute natively via WebAssembly
            executePython();
            if (isMobile) setMobileTab('editor');
        } else if (language === 'javascript-node') {
            // Execute natively with a console interceptor
            executeJavaScriptConsole();
            if (isMobile) setMobileTab('editor');
        } else if (language === 'lua') {
            // Execute natively via WebAssembly (Fengari)
            executeLua();
            if (isMobile) setMobileTab('editor');
        } else {
            setOutput(`<html><style>body{color:#f85149; background:#0d1117; font-family: monospace; padding: 20px;}</style><body><p>Error: Execution for ${language} is not supported yet.</p></body></html>`);
        }
    };

    const executePython = async () => {
        if (!terminal) return;
        setIsExecuting(true);
        terminal.clear();
        terminal.writeln("\x1b[34m[Kone Code] Executing Python (Pyodide WASM)...\x1b[0m");

        try {
            let py = pyodideInstance;

            if (!py) {
                if (!window.loadPyodide) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                py = await window.loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
                });
                setPyodideInstance(py);
            }

            // Set up xterm.js stdout/stderr redirection
            // Use writeln() per line — it always appends \r\n, ensuring each print() is on its own line
            py.setStdout({
                batched: (str) => {
                    // Trim trailing newline (Python print adds one; writeln adds another)
                    const trimmed = str.endsWith('\n') ? str.slice(0, -1) : str;
                    // Handle multi-line output (e.g., multi-line strings)
                    trimmed.split('\n').forEach(line => terminal.writeln(line));
                }
            });
            py.setStderr({
                batched: (str) => {
                    const trimmed = str.endsWith('\n') ? str.slice(0, -1) : str;
                    trimmed.split('\n').forEach(line => terminal.writeln('\x1b[31m' + line + '\x1b[0m'));
                }
            });

            // Set up stdin for interactive input()
            py.setStdin({
                stdin: () => {
                    isInputWaitingRef.current = true;
                    return new Promise((resolve) => {
                        inputResolveRef.current = resolve;
                    });
                }
            });

            try {
                // Wrap code so the last expression's value is printed (REPL-style)
                const wrappedCode = `
import sys as _sys
_result = None
try:
    # Try to compile as an expression to get its value
    import ast as _ast
    _tree = _ast.parse(${JSON.stringify(code)}, mode='exec')
    if _tree.body and isinstance(_tree.body[-1], _ast.Expr):
        _expr = _ast.Expression(body=_tree.body[-1].value)
        exec(compile(_ast.Module(body=_tree.body[:-1], type_ignores=[]), '<input>', 'exec'))
        _result = eval(compile(_expr, '<input>', 'eval'))
        if _result is not None:
            print(repr(_result))
    else:
        exec(${JSON.stringify(code)})
except Exception as _e:
    raise _e
`;
                await py.runPythonAsync(wrappedCode);
                terminal.writeln("\x1b[32m\r\n[Program Finished - Exited with code 0]\x1b[0m");
            } catch (err) {
                terminal.writeln("\x1b[31m\r\n[Execution Error]\x1b[0m");
                terminal.writeln("\x1b[31m" + err.toString() + "\x1b[0m");
            }

        } catch (error) {
            console.error("Execution error:", error);
            terminal.writeln("\x1b[31mFailed to execute Python WASM.\x1b[0m");
            terminal.writeln("\x1b[31m" + error.message + "\x1b[0m");
        } finally {
            setIsExecuting(false);
        }
    };

    const executeJavaScriptConsole = async () => {
        if (!terminal) return;
        setIsExecuting(true);
        terminal.clear();
        terminal.writeln("\x1b[34m[Kone Code] Executing JavaScript locally...\x1b[0m");

        setTimeout(() => {
            try {
                const originalConsoleLog = console.log;
                const originalConsoleError = console.error;

                // Override console momentarily to write to xterm.js
                console.log = (...args) => {
                    const formatted = args.map(a =>
                        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                    ).join(' ') + '\r\n';
                    terminal.write(formatted);
                    originalConsoleLog(...args);
                };
                console.error = (...args) => {
                    const formatted = "\x1b[31m" + args.map(a =>
                        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                    ).join(' ') + "\x1b[0m\r\n";
                    terminal.write(formatted);
                    originalConsoleError(...args);
                };

                // Dynamic Function execution
                const safeExecute = new Function('console', `
                    try {
                        ${code}
                    } catch(e) {
                        throw e;
                    }
                `);

                safeExecute(console);

                // Restore original console
                console.log = originalConsoleLog;
                console.error = originalConsoleError;

                terminal.writeln("\x1b[32m\r\n[Program Finished]\x1b[0m");
            } catch (err) {
                terminal.writeln("\x1b[31m\r\n[Runtime Error]\x1b[0m");
                terminal.writeln("\x1b[31m" + err.toString() + "\x1b[0m");
            } finally {
                setIsExecuting(false);
            }
        }, 100);
    };

    const executeLua = async () => {
        if (!terminal) return;
        setIsExecuting(true);
        terminal.clear();
        terminal.writeln("\x1b[34m[Kone Code] Executing Lua (Fengari WASM)...\x1b[0m");

        setTimeout(async () => {
            try {
                const hasFengari = window.fengari || (window.exports && window.exports.fengari) || (window.module && window.module.exports);

                if (!hasFengari) {
                    await new Promise((resolve, reject) => {
                        if (typeof window.define === 'function' && window.define.amd && window.require) {
                            window.require(['https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js'], (fengariExports) => {
                                window.fengari = fengariExports;
                                resolve();
                            });
                        } else {
                            const script = document.createElement('script');
                            script.src = 'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js';
                            script.onload = resolve;
                            script.onerror = reject;
                            document.head.appendChild(script);
                        }
                    });
                }

                const fengariObj = window.fengari || (window.exports && window.exports.fengari) || (window.module && window.module.exports);
                if (!fengariObj || !fengariObj.load) throw new Error("Fengari object not found.");

                // Intercept Lua print() by defining it in the Lua state to call JS
                // We'll use a global JS function that terminal writes
                window.executeLuaLog = (str) => {
                    terminal.write(String(str).replace(/\n/g, '\r\n') + '\r\n');
                };

                const luaBridge = `
                    local js = require "js"
                    print = function(...)
                        local args = {...}
                        local str = ""
                        for i, v in ipairs(args) do
                            str = str .. tostring(v) .. (i < #args and "\\t" or "")
                        end
                        js.global:executeLuaLog(str)
                    end
                `;

                try {
                    fengariObj.load(luaBridge)(); // Initialize bridge
                    fengariObj.load(code)();    // Run user code
                    terminal.writeln("\x1b[32m\r\n[Program Finished]\x1b[0m");
                } catch (err) {
                    terminal.writeln("\x1b[31m\r\n[Runtime Error]\x1b[0m");
                    terminal.writeln("\x1b[31m" + err.toString() + "\x1b[0m");
                }
            } catch (error) {
                console.error("Execution error:", error);
                terminal.writeln("\x1b[31mFailed to execute Lua WASM.\x1b[0m");
                terminal.writeln("\x1b[31m" + error.message + "\x1b[0m");
            } finally {
                setIsExecuting(false);
            }
        }, 100);
    };

    const confirmCreateProject = () => {
        const projectName = createProjectModal.name.trim() || 'Untitled Project';
        const projectLang = createProjectModal.language;
        
        setTitle(projectName);
        setLanguage(projectLang);
        setCode(projectLang === 'html' ? '<h1>' + projectName + '</h1>' : '');
        setOutput('');
        
        // Auto-expand current active folder or "My Projects"
        const targetFolder = activeFolder || 'My Projects';
        setExpandedFolders(prev => new Set([...prev, targetFolder]));
        
        setCreateProjectModal({ visible: false, name: '', language: 'html' });
    };

    const handleCreateFolder = () => {
        setCreateFolderModal({ visible: true, name: '' });
    };

    const confirmCreateFolder = () => {
        const folderName = createFolderModal.name;
        if (folderName && folderName.trim()) {
            setExpandedFolders(prev => new Set([...prev, folderName.trim()]));
            setActiveFolder(folderName.trim());
        }
        setCreateFolderModal({ visible: false, name: '' });
    };

    const toggleFolder = (folderName) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderName)) next.delete(folderName);
            else next.add(folderName);
            return next;
        });
    };

    const handleSave = async () => {
        logActivity(currentUser, 'Project Save Attempt', { isLocal: isLocalMode });
        if (isLocalMode && activeFileHandle) {
            await saveLocalFile();
            return;
        }

        if (!currentUser) {
            alert("🔒 Sign In Required: Cloud saving is a member-only feature. Please sign in to save your work.");
            setShowAuthModal(true);
            return;
        }

        try {
            await addDoc(collection(db, 'kone_code_projects'), {
                title: title,
                language: language,
                code: code,
                folder: activeFolder || 'My Projects',
                userId: currentUser.uid,
                ownerEmail: currentUser.email, // For admin diagnostics
                createdAt: serverTimestamp()
            });
            alert("Project saved securely to your private Kone Code Sandbox!");
            fetchData();
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Failed to save project.");
        }
    };

    const handleContextMenu = (e, type, target) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            type,
            target
        });
    };

    const handleDelete = async () => {
        if (!contextMenu.target) return;
        setConfirmDelete({ 
            visible: true, 
            type: contextMenu.type, 
            target: contextMenu.target 
        });
        setContextMenu({ ...contextMenu, visible: false });
    };

    const confirmRenameAction = async () => {
        const { type, target, name } = renameModal;
        if (!target || !name.trim()) return;

        try {
            if (type === 'file') {
                await updateDoc(doc(db, 'kone_code_projects', target.id), {
                    title: name.trim(),
                    updatedAt: serverTimestamp()
                });
                
                // If it's the currently open file, update the title state
                const currentFileId = projects.find(p => p.title === title && p.language === language)?.id;
                if (currentFileId === target.id) {
                    setTitle(name.trim());
                }
            } else {
                // Folder rename: Batch update all projects in this folder
                const q = query(collection(db, 'kone_code_projects'), where('folder', '==', target));
                const snapshot = await getDocs(q);
                
                const batch = writeBatch(db);
                snapshot.docs.forEach((d) => {
                    batch.update(d.ref, { folder: name.trim() });
                });
                await batch.commit();

                // Update expanded folders and active folder
                setExpandedFolders(prev => {
                    const next = new Set(prev);
                    if (next.has(target)) {
                        next.delete(target);
                        next.add(name.trim());
                    }
                    return next;
                });

                if (activeFolder === target) {
                    setActiveFolder(name.trim());
                }
            }
            
            fetchData();
        } catch (error) {
            console.error("Error renaming:", error);
            alert("Failed to rename: " + error.message);
        } finally {
            setRenameModal({ visible: false, type: null, target: null, name: '' });
        }
    };

    const confirmDeleteAction = async () => {
        const { type, target } = confirmDelete;
        if (!target) return;

        try {
            if (type === 'file') {
                await deleteDoc(doc(db, 'kone_code_projects', target.id));
            } else {
                // Folder deletion: Get all projects in this folder
                const q = query(collection(db, 'kone_code_projects'), where('folder', '==', target));
                const snapshot = await getDocs(q);
                
                const batch = writeBatch(db);
                snapshot.docs.forEach((d) => {
                    batch.delete(d.ref);
                });
                await batch.commit();

                // Reset activeFolder if it was the one deleted
                if (activeFolder === target) {
                    setActiveFolder('My Projects');
                }

                // Also remove from expandedFolders if it was empty/manual
                setExpandedFolders(prev => {
                    const next = new Set(prev);
                    next.delete(target);
                    return next;
                });
            }
            
            fetchData();
        } catch (error) {
            console.error("Error deleting:", error);
            if (error.code === 'permission-denied') {
                alert("Security Error: Permission denied. Please check your Firebase Firestore rules or log in.");
            } else {
                alert("Failed to delete: " + error.message);
            }
        } finally {
            setConfirmDelete({ visible: false, type: null, target: null });
        }
    };

    const loadSnippet = (snippetCode, snippetLang, snippetTitle) => {
        setCode(snippetCode);
        setLanguage(snippetLang);
        setTitle(snippetTitle);
        setOutput(''); // Clear preview
    };

    const getLanguageExtension = (lang) => {
        if (lang === 'html') return '.html';
        if (lang === 'javascript' || lang === 'javascript-node') return '.js';
        if (lang === 'css') return '.css';
        if (lang === 'python') return '.py';
        if (lang === 'lua') return '.lua';
        return '.txt';
    };

    const getLanguageIcon = (lang) => {
        if (lang === 'python') return <FaPython color="#3776AB" />;
        if (lang === 'javascript' || lang === 'javascript-node') return <FaJs color="#F7DF1E" />;
        if (lang === 'html') return <FaHtml5 color="#E34F26" />;
        if (lang === 'css') return <FaCss3Alt color="#1572B6" />;
        return <FaCode color="#cccccc" />;
    };

    const getMobileIcon = (tab) => {
        if (tab === 'explorer') return <FaFolder size={18} />;
        if (tab === 'editor') return <FaCode size={18} />;
        if (tab === 'preview') return <FaPlay size={18} />;
        return <FaCode size={18} />;
    };

    return (
        <div className="d-flex h-100 w-100 overflow-hidden" style={{ height: '100vh', width: '100vw', backgroundColor: '#1e1e1e', color: '#cccccc', position: 'fixed', top: 0, left: 0, flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            <AnimatePresence>
                <AuthInterceptModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onContinueAsGuest={() => {
                        sessionStorage.setItem('kone_code_guest', 'true');
                        setShowAuthModal(false);
                    }}
                />
            </AnimatePresence>
            {/* Sidebar - Activity Bar (VS Code Style) */}
            <div className="activity-bar flex-column align-items-center border-end" style={{ width: '50px', backgroundColor: '#333333', borderColor: '#252526', zIndex: 10 }}>
                <Link to="/" className="w-100 py-3 d-flex justify-content-center text-secondary hover-text-white" title="Home">
                    <FaChevronLeft size={18} />
                </Link>
                <div id="explorer-tab" className="w-100 py-3 d-flex justify-content-center cursor-pointer" title="Explorer" style={{ borderLeft: '2px solid #007acc', backgroundColor: '#252526' }}>
                    <FaFolder size={20} color="#ffffff" />
                </div>
                <div className="mt-auto w-100 py-3 d-flex justify-content-center text-secondary hover-text-white cursor-pointer" title="Get the App" onClick={() => setShowInstallModal(true)}>
                    <FaMobileAlt size={20} />
                </div>
                <div className="w-100 py-3 d-flex justify-content-center text-secondary hover-text-white cursor-pointer" title="Settings">
                    <FaCog size={20} />
                </div>
            </div>

            {/* Sidebar - Explorer Panel (Resizable) */}
            <div ref={sidebarRef} className={`explorer-panel ${isMobile && mobileTab !== 'explorer' ? 'd-none' : 'd-flex'} flex-column border-end position-relative`} style={{ width: isMobile ? '100vw' : `${sidebarWidth}px`, backgroundColor: '#252526', borderColor: '#1e1e1e', height: isMobile ? 'auto' : '100%', flexShrink: 0 }}>
                <div className="p-2 px-md-3 d-flex align-items-center justify-content-between fw-bold border-bottom" style={{ fontSize: '13px', height: '35px', borderColor: '#1e1e1e', fontFamily: 'var(--font-heading)', paddingLeft: isMobile ? '15px' : '15px' }}>
                    <span className="text-secondary">Explorer</span>
                    <div className="d-flex gap-2 align-items-center flex-shrink-0">
                        <button
                            title="Install PWA"
                            onClick={() => setShowInstallModal(true)}
                            className="p-1 hover-text-white"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#858585',
                                cursor: 'pointer',
                                display: isMobile ? 'flex' : 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.15s'
                            }}
                        >
                            <FaMobileAlt size={12} />
                        </button>
                        <button
                            title="New File"
                            onClick={() => setCreateProjectModal({ visible: true, name: '', language: 'html' })}
                            className="p-1 hover-text-white"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#858585',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.15s'
                            }}
                        >
                            <FaPlus size={12} />
                        </button>
                        <button
                            title="New Folder"
                            onClick={handleCreateFolder}
                            className="p-1 hover-text-white"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#858585',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.15s'
                            }}
                        >
                            <FaFolderPlus size={13} />
                        </button>
                        {directoryHandle ? (
                            <button
                                title="Close Local Workspace"
                                onClick={() => {
                                    setDirectoryHandle(null);
                                    setLocalFiles([]);
                                    setActiveFileHandle(null);
                                    setIsLocalMode(false);
                                }}
                                className="p-1 text-danger hover-text-white"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.15s'
                                }}
                            >
                                <FaTrash size={12} />
                            </button>
                        ) : (
                            <button
                                title="Open Local Folder"
                                onClick={handleOpenLocalFolder}
                                className="p-1 hover-text-white"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#858585',
                                    cursor: 'pointer',
                                    display: isMobile ? 'none' : 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.15s'
                                }}
                            >
                                <FaFolderOpen size={13} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-grow-1 overflow-auto py-2 px-0" style={{ overflowX: 'auto' }}>
                    
                    {/* Local Workspace Section */}
                    {directoryHandle && (
                        <div className="mb-4">
                            <div className="text-secondary fw-bold mb-1 px-3 d-flex align-items-center justify-content-between" style={{ fontSize: '11px', opacity: 0.7, whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)' }}>
                                <span>Local Workspace</span>
                                <span className="badge bg-success px-1" style={{ fontSize: '8px', opacity: 0.8 }}>{directoryHandle.name}</span>
                            </div>
                            
                            {localFiles.map(file => (
                                <div
                                    key={`local-${file.path}`}
                                    onClick={() => file.kind === 'file' ? loadLocalFile(file.handle) : null}
                                    className={`d-flex align-items-center gap-2 py-1 px-3 text-white cursor-pointer hover-bg-light-opacity w-100 overflow-hidden ${activeFileHandle === file.handle ? 'bg-primary bg-opacity-10' : ''}`}
                                    style={{ fontSize: '13px' }}
                                >
                                    <div className="flex-shrink-0" style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {file.kind === 'directory' ? <FaFolder color="#858585" /> : (
                                            activeFileHandle === file.handle ? <FaFileCode color="#007acc" /> : getLanguageIcon(file.name.split('.').pop())
                                        )}
                                    </div>
                                    <div className="text-truncate flex-grow-1 d-flex align-items-center gap-1">
                                        <span style={{ opacity: activeFileHandle === file.handle ? 1 : 0.85 }}>{file.name}</span>
                                    </div>
                                </div>
                            ))}
                            {localFiles.length === 0 && (
                                <div className="px-3 py-1 text-secondary opacity-50" style={{ fontSize: '11px' }}>Scanning...</div>
                            )}
                        </div>
                    )}

                    <div className="text-secondary fw-bold mb-1 px-3" style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'var(--font-heading)' }}>Starter Templates</div>
                    {templates.map(tmp => (
                        <div
                            key={`tmp-${tmp.id}`}
                            onClick={() => {
                                loadSnippet(tmp.code, tmp.language, tmp.title);
                                setIsLocalMode(false);
                                setActiveFileHandle(null);
                            }}
                            className="d-flex align-items-center gap-2 py-1 px-3 text-white cursor-pointer hover-bg-light-opacity w-100 overflow-hidden"
                            style={{ fontSize: '13px' }}
                        >
                            <div className="flex-shrink-0" style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {getLanguageIcon(tmp.language)}
                            </div>
                            <div className="text-truncate flex-grow-1 d-flex align-items-center gap-1">
                                <span style={{ opacity: 0.85 }}>{tmp.title}</span>
                                <span style={{ opacity: 0.3, fontSize: '11px' }}>{getLanguageExtension(tmp.language)}</span>
                            </div>
                        </div>
                    ))}

                    <div className="text-secondary fw-bold mb-1 mt-4 px-3 d-flex align-items-center justify-content-between" style={{ fontSize: '11px', opacity: 0.7, whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)' }}>
                        <span>Community Saves</span>
                        {activeFolder && <span className="badge bg-primary px-1" style={{ fontSize: '8px' }}>{activeFolder}</span>}
                    </div>

                    {/* Grouped Folders */}
                    {Array.from(new Set([
                        ...expandedFolders,
                        ...(projects || []).map(p => (p && p.folder) || 'My Projects')
                    ])).sort().map(folderName => {
                        const folderProjects = (projects || []).filter(p => p && ((p.folder || 'My Projects') === folderName));
                        // If folder name matches My Projects, we want it expanded by default if it's the only one or if user hasn't toggled it
                        const isExpanded = expandedFolders.has(folderName);
                        const isActive = activeFolder === folderName;

                        return (
                            <div key={`folder-${folderName}`} className="mb-0">
                                <div 
                                    onClick={() => { toggleFolder(folderName); setActiveFolder(folderName); }}
                                    onContextMenu={(e) => handleContextMenu(e, 'folder', folderName)}
                                    className={`d-flex align-items-center gap-1 py-1 px-2 cursor-pointer hover-bg-light-opacity ${isActive ? 'bg-primary bg-opacity-10' : ''}`}
                                    style={{ fontSize: '12px', color: isActive ? '#fff' : '#858585' }}
                                >
                                    <div className="flex-shrink-0" style={{ width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isExpanded ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
                                    </div>
                                    <FaFolder size={14} color={isActive ? '#007acc' : '#858585'} className="flex-shrink-0" />
                                    <span className="text-truncate flex-grow-1 ms-1" style={{ fontWeight: isActive ? 600 : 400 }}>{folderName}</span>
                                </div>

                                {isExpanded && (
                                    <div className="ms-2 border-start border-secondary border-opacity-10">
                                        {folderProjects.map(proj => (
                                            <div
                                                key={`proj-${proj.id}`}
                                                onClick={() => {
                                                    loadSnippet(proj.code, proj.language, proj.title);
                                                    setIsLocalMode(false);
                                                    setActiveFileHandle(null);
                                                }}
                                                onContextMenu={(e) => handleContextMenu(e, 'file', proj)}
                                                className="d-flex align-items-center gap-2 py-1 px-3 text-secondary cursor-pointer hover-bg-light-opacity w-100 overflow-hidden"
                                                style={{ fontSize: '13px' }}
                                            >
                                                <div className="flex-shrink-0" style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {getLanguageIcon(proj.language)}
                                                </div>
                                                <div className="text-truncate flex-grow-1 d-flex align-items-center gap-1">
                                                    <span>{proj.title}</span>
                                                    <span style={{ opacity: 0.3, fontSize: '11px' }}>{getLanguageExtension(proj.language)}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {folderProjects.length === 0 && (
                                            <div className="ps-4 py-1 text-secondary opacity-50" style={{ fontSize: '11px' }}>Empty Folder</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Resize Gutter */}
            <div
                onMouseDown={() => { setIsResizingSidebar(true); document.body.style.cursor = 'ew-resize'; }}
                style={{ width: '4px', cursor: 'ew-resize', backgroundColor: '#1e1e1e', zIndex: 10, position: 'relative', margin: '0 -2px' }}
                className="gutter-hover d-none d-md-block"
            />

            {/* Main Content Area */}
            <div className={`flex-grow-1 d-flex flex-column overflow-hidden ${isMobile && mobileTab === 'explorer' ? 'd-none' : ''}`} style={{ minWidth: 0, height: '100%', flexGrow: 1 }}>
                {/* Top Action Bar (Professional fixed height) */}
                <div className="d-flex justify-content-between align-items-center border-bottom px-2" style={{ backgroundColor: '#2d2d2d', borderColor: '#1e1e1e', height: isMobile ? 'auto' : '40px', minHeight: '40px', flexWrap: 'nowrap', padding: '5px 0', overflowX: isMobile ? 'auto' : 'visible' }}>
                    <div className="d-flex align-items-center h-100 gap-0 flex-shrink-0">
                        {/* File Tab */}
                        <div className="d-flex align-items-center gap-2 px-2 px-md-3 h-100" style={{ backgroundColor: '#1e1e1e', borderTop: '2px solid #007acc', minWidth: isMobile ? '80px' : '150px', cursor: 'default' }}>
                            <div className="flex-shrink-0" style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {getLanguageIcon(language)}
                            </div>
                            <div className="d-flex align-items-center gap-1 overflow-hidden" style={{ maxWidth: isMobile ? '80px' : '300px' }}>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-transparent border-0 p-0 m-0 fw-normal"
                                    style={{
                                        outline: 'none',
                                        fontSize: '12px',
                                        width: `${Math.max(30, title.length * 7)}px`,
                                        maxWidth: isMobile ? '60px' : '220px',
                                        caretColor: '#007acc',
                                        color: '#ffffff',
                                        backgroundColor: 'transparent'
                                    }}
                                />
                                {!isMobile && <span style={{ opacity: 0.3, fontSize: '11px' }}>{getLanguageExtension(language)}</span>}
                            </div>
                        </div>

                        <div className="ms-1 ms-md-3">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="rounded px-1 px-md-2 py-0"
                                style={{ outline: 'none', border: '1px solid #3c3c3c', fontSize: '10px', backgroundColor: '#3c3c3c', color: '#cccccc', height: '22px' }}
                            >
                                <option value="html">HTML</option>
                                <option value="javascript">JavaScript (Web)</option>
                                <option value="javascript-node">Node.js (Console)</option>
                                <option value="css">CSS</option>
                                <option value="python">Python</option>
                                <option value="lua">Lua</option>
                            </select>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 gap-md-2">
                        <button id="run-button" onClick={handleRun} disabled={isExecuting} className="btn btn-success d-flex align-items-center gap-1 border-0" style={{ fontSize: '10px', height: '24px', padding: '0 8px', backgroundColor: '#28a745' }}>
                            {isExecuting ? <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }}></span> : <FaPlay size={9} />}
                            {isExecuting ? 'Running' : 'Run'}
                        </button>
                        <button onClick={handleSave} className="btn btn-primary d-flex align-items-center gap-1 border-0" style={{ fontSize: '10px', height: '24px', padding: '0 8px', backgroundColor: '#007acc' }}>
                            <FaSave size={9} /> Save
                        </button>


                        <div className="vr bg-white opacity-10 mx-1" style={{ height: '16px' }}></div>

                        {/* Help Menu Trigger */}
                        <div className="position-relative" ref={helpMenuRef}>
                            <button 
                                id="help-button"
                                onClick={() => setIsHelpOpen(!isHelpOpen)}
                                className="btn btn-link text-secondary hover-text-white p-0 d-flex align-items-center p-1"
                                title="Help & Resources"
                                style={{ textDecoration: 'none' }}
                            >
                                <FaQuestionCircle size={18} color={isHelpOpen ? "#ffffff" : "inherit"} />
                            </button>

                            {/* Help Popover */}
                            <AnimatePresence>
                                {isHelpOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className={`${isMobile ? '' : 'position-absolute'} shadow-lg border`}
                                        style={isMobile ? {
                                            position: 'fixed',
                                            right: '10px',
                                            top: '50px',
                                            width: '200px',
                                            backgroundColor: '#252526',
                                            borderColor: '#454545',
                                            zIndex: 2000,
                                            borderRadius: '8px',
                                            padding: '8px 0',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                                        } : {
                                            right: '0',
                                            top: '100%',
                                            marginTop: '10px',
                                            width: '180px',
                                            backgroundColor: '#252526',
                                            borderColor: '#454545',
                                            zIndex: 1000,
                                            borderRadius: '4px',
                                            padding: '8px 0',
                                            transformOrigin: 'top right'
                                        }}
                                    >
                                        <div className="px-3 py-1 text-secondary fw-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>HELP & RESOURCES</div>
                                        <a 
                                            href="https://consult.koneacademy.io/#/docs?category=code" 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="d-flex align-items-center gap-2 px-3 py-2 text-white hover-bg-light-opacity text-decoration-none" style={{ fontSize: '13px' }}
                                        >
                                            <FaBook size={14} className="text-primary" /> Documentation
                                        </a>
                                        <a href="https://consult.koneacademy.io/#/contact" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-2 px-3 py-2 text-white hover-bg-light-opacity text-decoration-none" style={{ fontSize: '13px' }}>
                                            <FaCommentAlt size={14} className="text-info" /> Feedback
                                        </a>
                                        <a href="https://PhilipKone.github.io/Kone-Consult/#/training" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-2 px-3 py-2 text-white hover-bg-light-opacity text-decoration-none" style={{ fontSize: '13px' }}>
                                            <FaGraduationCap size={14} className="text-warning" /> Training Hub
                                        </a>
                                        <a href="https://PhilipKone.github.io/Kone-Consult/#/contact" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-2 px-3 py-2 text-white hover-bg-light-opacity text-decoration-none" style={{ fontSize: '13px' }}>
                                            <FaEnvelope size={14} className="text-success" /> Contact Us
                                        </a>
                                        <div 
                                            onClick={() => { setIsTourOpen(true); setIsHelpOpen(false); }}
                                            className="d-flex align-items-center gap-2 px-3 py-2 text-white hover-bg-light-opacity cursor-pointer" 
                                            style={{ fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                                        >
                                            <FaPlay size={12} className="text-primary" /> Take a Tour
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {currentUser ? (
                            <a href="https://PhilipKone.github.io/Kone-Consult/#/profile" className="text-secondary hover-text-white d-flex align-items-center ms-1">
                                <FaUserCircle size={18} />
                            </a>
                        ) : (
                            <a href="https://PhilipKone.github.io/Kone-Consult/#/login" className="btn btn-primary border-0 ms-1" style={{ fontSize: '11px', height: '24px', padding: '0 10px', backgroundColor: '#007acc' }}>
                                Login
                            </a>
                        )}
                    </div>
                </div>

                {/* Split View Components */}
                <div ref={parentContainerRef} className="flex-grow-1 d-flex flex-column flex-md-row overflow-hidden position-relative" style={{ minHeight: 0, flexGrow: 1, flexDirection: isMobile ? 'column' : 'row' }}>

                    {/* Left Column (Resizable Horizontal) */}
                    <div ref={leftColumnRef} style={{ width: isMobile ? '100%' : `${horizontalSplit}%`, position: 'relative', height: isMobile && mobileTab === 'editor' ? '100%' : isMobile ? '0%' : '100%', display: isMobile && mobileTab !== 'editor' ? 'none' : 'flex', minHeight: 0, flexShrink: 0, flexGrow: 0 }} className="flex-column border-end border-dark overflow-hidden">

                        {/* Editor (Resizable Vertical) */}
                        <div id="monaco-editor" ref={editorPaneRef} style={{ height: `${verticalSplit}%`, position: 'relative', minHeight: '100px', flexShrink: 0 }}>
                            <Editor
                                height="100%"
                                width="100%"
                                language={language}
                                value={code}
                                onChange={(val) => setCode(val)}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: "'Fira Code', Consolas, monospace",
                                    padding: { top: 10 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    wordWrap: "on"
                                }}
                            />
                        </div>

                        {/* Vertical Resize Gutter */}
                        <div
                            onMouseDown={() => {
                                setIsResizingVertical(true);
                                if (leftColumnRef.current) {
                                    dragStartRect.current = leftColumnRef.current.getBoundingClientRect();
                                }
                                document.body.style.cursor = 'ns-resize';
                            }}
                            style={{
                                height: '6px',
                                margin: '-1px 0',
                                cursor: 'ns-resize',
                                backgroundColor: isResizingVertical ? '#007acc' : '#1e1e1e',
                                zIndex: 10,
                                position: 'relative',
                                flexShrink: 0
                            }}
                            className="gutter-hover-v"
                        />

                        {/* Console / Terminal Pane */}
                        <div ref={terminalPaneRef} className="flex-grow-1 d-flex flex-column" style={{ backgroundColor: '#1e1e1e', minHeight: '40px', flexShrink: 0 }}>
                            <div className="d-flex align-items-center border-bottom border-dark" style={{ height: '30px', padding: '0 12px', backgroundColor: '#252526', fontSize: '12px', fontWeight: 600, color: '#858585', fontFamily: 'var(--font-heading)' }}>
                                Terminal
                            </div>
                            <div className="flex-grow-1 position-relative" style={{ backgroundColor: '#1e1e1e', overflow: 'hidden', padding: '8px 12px' }}>
                                <div ref={terminalRef} style={{ width: '100%', height: '100%' }}>
                                    {/* xterm.js mounts here */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Resize Gutter */}
                    <div
                        onMouseDown={() => {
                            setIsResizingHorizontal(true);
                            if (parentContainerRef.current) {
                                dragStartRect.current = parentContainerRef.current.getBoundingClientRect();
                            }
                            document.body.style.cursor = 'ew-resize';
                        }}
                        style={{
                            width: '6px',
                            margin: '0 -1px',
                            cursor: 'ew-resize',
                            backgroundColor: (isResizingHorizontal || isResizingSidebar) ? '#007acc' : '#1e1e1e',
                            zIndex: 10,
                            position: 'relative'
                        }}
                        className="gutter-hover"
                    />

                    {/* Right Column: Visual Preview */}
                    <div ref={previewPaneRef} className={`${isMobile && mobileTab !== 'preview' ? 'd-none' : 'd-flex'} flex-grow-1 flex-column overflow-hidden`} style={{ backgroundColor: '#1e1e1e', height: '100%', flexShrink: 0, flexGrow: 1 }}>
                        <div className="px-3 d-flex align-items-center border-bottom border-dark" style={{ height: '30px', backgroundColor: '#252526', fontSize: '12px', fontWeight: 600, color: '#858585', fontFamily: 'var(--font-heading)' }}>
                            Visual Preview
                        </div>
                        <div className="flex-grow-1 position-relative bg-white">
                            {output && (language === 'html' || language === 'css' || language === 'javascript') ? (
                                <iframe
                                    title="live-preview"
                                    srcDoc={output}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    sandbox="allow-scripts allow-modals"
                                />
                            ) : (
                                <div className="d-flex flex-column h-100 w-100 align-items-center justify-content-center" style={{ backgroundColor: '#1e1e1e' }}>
                                    <div className={`opacity-30 ${window.innerWidth < 768 ? 'd-none' : ''}`}>
                                        <p className="small text-secondary fw-light" style={{ fontFamily: 'var(--font-heading)' }}>Web Preview</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Tab Navigation (Persistent at bottom) */}
            <div className="mobile-nav border-top flex-shrink-0" style={{ height: 'calc(55px + env(safe-area-inset-bottom, 0px))', backgroundColor: '#2d2d2d', borderColor: '#1e1e1e', position: 'relative', zIndex: 100, display: isMobile ? 'flex' : 'none', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                {['explorer', 'editor', 'preview'].map(tab => (
                    <div 
                        key={tab}
                        onClick={() => setMobileTab(tab)}
                        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center cursor-pointer"
                        style={{ 
                            color: mobileTab === tab ? '#007acc' : '#858585',
                            borderTop: mobileTab === tab ? '2px solid #007acc' : 'none',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            height: '55px' // Keep icons centered in the visible part
                        }}
                    >
                        {getMobileIcon(tab)}
                        <span className="mt-1 fw-bold" style={{ fontSize: '9px' }}>{tab}</span>
                    </div>
                ))}
            </div>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div 
                    ref={contextMenuRef}
                    style={{ 
                        position: 'fixed', 
                        top: contextMenu.y, 
                        left: contextMenu.x, 
                        zIndex: 10000,
                        minWidth: '150px',
                        backgroundColor: 'rgba(37, 37, 38, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                        padding: '4px 0'
                    }}
                >
                    <div 
                        onClick={() => {
                            const { type, target } = contextMenu;
                            setRenameModal({ 
                                visible: true, 
                                type, 
                                target, 
                                name: type === 'folder' ? target : target.title 
                            });
                            setContextMenu({ ...contextMenu, visible: false });
                        }}
                        className="context-menu-item d-flex align-items-center gap-2 px-3 py-2 cursor-pointer border-bottom border-light border-opacity-10"
                        style={{ fontSize: '12px', color: '#cccccc' }}
                    >
                        <FaCode size={10} />
                        <span>Rename {contextMenu.type === 'folder' ? 'Folder' : 'File'}</span>
                    </div>
                    <div 
                        onClick={handleDelete}
                        className="context-menu-item d-flex align-items-center gap-2 px-3 py-2 cursor-pointer"
                        style={{ fontSize: '12px', color: '#ff4d4d' }}
                    >
                        <FaTrash size={10} />
                        <span>Delete {contextMenu.type === 'folder' ? 'Folder' : 'File'}</span>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete.visible && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed-top" // Use d-flex in style to avoid bootstrap conflicts
                        style={{ 
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 30000, 
                            backgroundColor: 'rgba(0,0,0,0.85)', 
                            backdropFilter: 'blur(8px)' 
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-dark p-4 rounded-4 border border-light border-opacity-10 text-center shadow-lg"
                            style={{ maxWidth: '400px', width: '90%', backgroundColor: '#252526' }}
                        >
                            <div className="bg-danger bg-opacity-20 text-danger p-3 rounded-circle d-inline-block mb-3">
                                <FaExclamationTriangle size={32} />
                            </div>
                            <h5 className="text-white mb-2" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>Confirm Delete</h5>
                            <p className="text-secondary mb-4" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                                {confirmDelete.type === 'folder' 
                                    ? `Are you sure you want to delete the folder "${confirmDelete.target}" and ALL projects inside it? This cannot be undone.`
                                    : `Are you sure you want to delete "${confirmDelete.target?.title}"? This cannot be undone.`}
                            </p>
                            <div className="d-flex gap-2">
                                <button 
                                    onClick={() => setConfirmDelete({ visible: false, type: null, target: null })}
                                    className="btn btn-outline-secondary flex-grow-1 border-0 hover-bg-light-opacity"
                                    style={{ fontSize: '14px', height: '42px', color: '#858585' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDeleteAction}
                                    className="btn btn-danger flex-grow-1 shadow-sm"
                                    style={{ fontSize: '14px', height: '42px', fontWeight: 600, borderRadius: '8px' }}
                                >
                                    Delete Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Create Folder Modal */}
            <AnimatePresence>
                {createFolderModal.visible && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 30000, 
                            backgroundColor: 'rgba(0,0,0,0.85)', 
                            backdropFilter: 'blur(8px)' 
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-dark p-4 rounded-4 border border-light border-opacity-10 shadow-lg"
                            style={{ maxWidth: '400px', width: '90%', backgroundColor: '#252526' }}
                        >
                            <div className="bg-primary bg-opacity-20 text-primary p-3 rounded-circle d-inline-block mb-3">
                                <FaFolderPlus size={32} />
                            </div>
                            <h5 className="text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>New Folder</h5>
                            <p className="text-secondary mb-4" style={{ fontSize: '13px' }}>Create a new organizational category for your projects.</p>
                            
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Folder name..."
                                value={createFolderModal.name}
                                onChange={(e) => setCreateFolderModal({...createFolderModal, name: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && confirmCreateFolder()}
                                className="form-control bg-dark border-secondary border-opacity-20 text-white mb-4"
                                style={{ height: '45px', fontSize: '14px', outline: 'none', boxShadow: 'none' }}
                            />

                            <div className="d-flex gap-2">
                                <button 
                                    onClick={() => setCreateFolderModal({ visible: false, name: '' })}
                                    className="btn btn-outline-secondary flex-grow-1 border-0 hover-bg-light-opacity"
                                    style={{ fontSize: '14px', height: '42px', color: '#858585' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmCreateFolder}
                                    className="btn btn-primary flex-grow-1 shadow-sm"
                                    style={{ fontSize: '14px', height: '42px', fontWeight: 600, borderRadius: '8px' }}
                                >
                                    Create Folder
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Rename Modal */}
            <AnimatePresence>
                {renameModal.visible && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 30000, 
                            backgroundColor: 'rgba(0,0,0,0.85)', 
                            backdropFilter: 'blur(8px)' 
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-dark p-4 rounded-4 border border-light border-opacity-10 shadow-lg"
                            style={{ maxWidth: '400px', width: '90%', backgroundColor: '#252526' }}
                        >
                            <div className="bg-primary bg-opacity-20 text-primary p-3 rounded-circle d-inline-block mb-3">
                                <FaCode size={32} />
                            </div>
                            <h5 className="text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Rename {renameModal.type === 'folder' ? 'Folder' : 'File'}</h5>
                            <p className="text-secondary mb-4" style={{ fontSize: '13px' }}>Enter a new name for your {renameModal.type === 'folder' ? 'folder' : 'project'}.</p>
                            
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Enter name..."
                                value={renameModal.name}
                                onChange={(e) => setRenameModal({...renameModal, name: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && confirmRenameAction()}
                                className="form-control bg-dark border-secondary border-opacity-20 text-white mb-4"
                                style={{ height: '45px', fontSize: '14px', outline: 'none', boxShadow: 'none' }}
                            />

                            <div className="d-flex gap-2">
                                <button 
                                    onClick={() => setRenameModal({ visible: false, type: null, target: null, name: '' })}
                                    className="btn btn-outline-secondary flex-grow-1 border-0 hover-bg-light-opacity"
                                    style={{ fontSize: '14px', height: '42px', color: '#858585' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmRenameAction}
                                    className="btn btn-primary flex-grow-1 shadow-sm"
                                    style={{ fontSize: '14px', height: '42px', fontWeight: 600, borderRadius: '8px' }}
                                >
                                    Confirm Rename
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Resize Overlay (Prevents iframe from stealing pointer events during drag) */}
            {(isResizingSidebar || isResizingHorizontal || isResizingVertical) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, cursor: isResizingVertical ? 'ns-resize' : 'ew-resize' }} />
            )}

            <style>{`
                .hover-bg-light-opacity:hover { background-color: rgba(255,255,255,0.05); }
                .gutter-hover:hover { background-color: #007acc !important; transition: background 0.2s; }
                .gutter-hover-v:hover { background-color: #007acc !important; transition: background 0.2s; }
                .ls-1 { letter-spacing: 0.05em; }
                .context-menu-item:hover { background-color: rgba(255,255,255,0.1); }
                
                @media (max-width: 767px) {
                    .activity-bar { display: none !important; }
                    .mobile-nav { display: flex !important; }
                    .desktop-only { display: none !important; }
                    .explorer-panel { width: 100vw !important; }
                }
                @media (min-width: 768px) {
                    .activity-bar { display: flex !important; }
                    .mobile-nav { display: none !important; }
                    .desktop-only { display: block !important; }
                }
            `}</style>
            {/* Custom Create Project Modal */}
            <AnimatePresence>
                {createProjectModal.visible && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 30000, 
                            backgroundColor: 'rgba(0,0,0,0.85)', 
                            backdropFilter: 'blur(8px)' 
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-dark p-4 rounded-4 border border-light border-opacity-10 shadow-lg"
                            style={{ maxWidth: '400px', width: '95%', backgroundColor: '#252526' }}
                        >
                            <div className="bg-success bg-opacity-20 text-success p-3 rounded-circle d-inline-block mb-3">
                                <FaPlus size={32} />
                            </div>
                            <h5 className="text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>New Project</h5>
                            <p className="text-secondary mb-4" style={{ fontSize: '13px' }}>Choose a name and language for your new creation.</p>
                            
                            <div className="mb-3">
                                <label className="text-secondary small d-block mb-2">Project Name</label>
                                <input 
                                    autoFocus
                                    type="text"
                                    placeholder="e.g., My Awesome Site"
                                    value={createProjectModal.name}
                                    onChange={(e) => setCreateProjectModal({...createProjectModal, name: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && confirmCreateProject()}
                                    className="form-control bg-dark border-secondary border-opacity-20 text-white"
                                    style={{ height: '45px', fontSize: '14px', outline: 'none', boxShadow: 'none' }}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-secondary small d-block mb-2">Primary Language</label>
                                <select 
                                    value={createProjectModal.language}
                                    onChange={(e) => setCreateProjectModal({...createProjectModal, language: e.target.value})}
                                    className="form-select bg-dark border-secondary border-opacity-20 text-white"
                                    style={{ height: '45px', fontSize: '14px', outline: 'none', boxShadow: 'none' }}
                                >
                                    <option value="html">HTML5 / Web</option>
                                    <option value="javascript">JavaScript / Node</option>
                                    <option value="python">Python 3</option>
                                    <option value="css">Vanilla CSS</option>
                                    <option value="lua">Lua Scripting</option>
                                </select>
                            </div>

                            <div className="d-flex gap-2">
                                <button 
                                    onClick={() => setCreateProjectModal({ visible: false, name: '', language: 'html' })}
                                    className="btn btn-outline-secondary flex-grow-1 border-0 hover-bg-light-opacity"
                                    style={{ fontSize: '14px', height: '42px', color: '#858585' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmCreateProject}
                                    className="btn btn-success flex-grow-1 shadow-sm"
                                    style={{ fontSize: '14px', height: '42px', fontWeight: 600, borderRadius: '8px' }}
                                >
                                    Create Project
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <InstallPWAModal 
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
            />

            <ProductTour 
                isOpen={isTourOpen} 
                onClose={() => {
                    setIsTourOpen(false);
                    localStorage.setItem('kone_code_tour_completed', 'true');
                }} 
            />
        </div>
    );
};

export default IDE;
