```javascript
import React from 'react';

const Sidebar = ({ files, activeFileName, onSelectFile, onCreateFile }) => {
  return (
    <div style={{
      width: '250px',
      height: '100%',
      backgroundColor: '#252526',
      color: '#cccccc',
      padding: '10px',
      boxSizing: 'border-box',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Explorer</h3>
        <button 
          onClick={onCreateFile}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#ccc', 
            cursor: 'pointer', 
            fontSize: '1.2rem',
            padding: '0 5px'
          }}
          title="New File"
        >
          +
        </button>
      </div>
      
      <div style={{ marginTop: '5px' }}>
        {Object.keys(files).map((fileName) => (
          <div
            key={fileName}
            onClick={() => onSelectFile(fileName)}
            style={{
              padding: '6px 10px',
              cursor: 'pointer',
              backgroundColor: activeFileName === fileName ? '#37373d' : 'transparent',
              color: activeFileName === fileName ? '#ffffff' : '#cccccc',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.9rem'
            }}
          >
            <span style={{ marginRight: '8px' }}>
              {fileName.endsWith('.js') ? '📄' : 
               fileName.endsWith('.css') ? '🎨' : 
               fileName.endsWith('.html') ? '🌐' : '📝'}
            </span>
            {fileName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
```
