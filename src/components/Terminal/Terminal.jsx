import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const Terminal = forwardRef((props, ref) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Initialize xterm
    xtermRef.current = new XTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
      }
    });

    fitAddonRef.current = new FitAddon();
    xtermRef.current.loadAddon(fitAddonRef.current);

    xtermRef.current.open(terminalRef.current);
    fitAddonRef.current.fit();

    xtermRef.current.writeln('\x1b[1;32mWelcome to Kone Code Terminal\x1b[0m');
    xtermRef.current.writeln('Type logic, see magic.\r\n');

    // Handle resizing
    const handleResize = () => fitAddonRef.current.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      xtermRef.current.dispose();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    write: (text) => {
      if (xtermRef.current) {
        xtermRef.current.writeln(text);
      }
    },
    clear: () => {
      if (xtermRef.current) {
        xtermRef.current.clear();
      }
    }
  }));

  return (
    <div
      ref={terminalRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e1e1e',
        padding: '10px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    />
  );
});

export default Terminal;
