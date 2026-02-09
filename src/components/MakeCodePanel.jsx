import React from 'react';

function MakeCodePanel({
    showCodePreview,
    setShowCodePreview,
    firmwareCode,
    directSync,
    downloadCode
}) {
    return (
        <div className="col-bottom">
            <section className="panel editor-panel">
                <div className="editor-toolbar">
                    <div className="editor-title-group">
                        <span className="editor-subtitle">Logic Configuration</span>
                        <div className="editor-info"><strong>MakeCode Workspace</strong></div>
                    </div>
                    <div className="toolbar-btns">
                        <button onClick={() => setShowCodePreview(!showCodePreview)} className="btn-outline">
                            {showCodePreview ? 'Hide' : 'Preview'}
                        </button>
                        <button onClick={directSync} className="btn-connect" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Sync</button>
                        <button onClick={downloadCode} className="copy-badge" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid #d2d2d7', color: 'var(--text-primary)' }}>📥 Save</button>
                    </div>
                </div>

                <div className="editor-workspace" style={{ height: '800px' }}>
                    {showCodePreview && (
                        <div className="code-preview">
                            <div className="preview-header">Current Script:</div>
                            <pre><code>{firmwareCode}</code></pre>
                        </div>
                    )}
                    <div className="iframe-box">
                        <iframe
                            id="makecode-frame"
                            src="https://makecode.microbit.org/#pub:_RsCVsEF3M0Hg"
                            allow="usb; bluetooth"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-popups-to-escape-sandbox"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default MakeCodePanel;

