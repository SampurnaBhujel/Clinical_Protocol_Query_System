import { useState } from 'react'
import DocumentUpload from '../components/DocumentUpload'
import DocumentList from '../components/DocumentList'
import UserList from '../components/UserList'
import EvaluationDashboard from '../components/EvaluationDashboard'
import Icon from '../components/Icon'

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('knowledge') // tabs: 'knowledge', 'users', 'telemetry'
    const [refreshDocs, setRefreshDocs] = useState(false)
    const [documentCount, setDocumentCount] = useState(0)
    const [userCount, setUserCount] = useState(0)

    function triggerRefresh() {
        setRefreshDocs(prev => !prev)
    }

    return (
        <main style={{ 
            padding: '110px 24px 40px 24px', /* Prevent header overlapping */
            overflowY: 'auto', 
            height: '100%', 
            width: '100%', 
            boxSizing: 'border-box',
            background: 'var(--bg, #f8fafc)', /* Connected to your global app canvas background */
            fontFamily: 'var(--font-sans, sans-serif)',
            transition: 'background-color 0.2s var(--ease), color 0.2s var(--ease)'
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Header System Control Plate */}
                <header style={{ 
                    padding: '24px', 
                    borderRadius: 'var(--radius-lg, 14px)', 
                    background: 'var(--surface, #ffffff)', 
                    border: '1px solid var(--border, #e2e8f0)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    gap: '20px',
                    width: '100%',
                    boxSizing: 'border-box',
                    boxShadow: 'var(--shadow)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <div>
                            <span className="engine-badge" style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: 'var(--muted, #475569)'
                            }}>
                                <Icon name="shield" size={12} aria-hidden="true" />
                                SECURE ADMINISTRATIVE MATRIX
                            </span>
                        </div>
                        <h1 style={{ 
                            fontFamily: 'var(--font-display, sans-serif)',
                            fontSize: '1.75rem', 
                            fontWeight: '700', 
                            color: 'var(--text, #0f172a)', 
                            margin: '8px 0 4px 0', 
                            lineHeight: '1.2' 
                        }}>
                            Knowledge Base Control Center
                        </h1>
                        <p style={{ fontSize: '0.925rem', color: 'var(--muted, #475569)', margin: '0', lineHeight: '1.5' }}>
                            Configure protocol document indices, inspect personnel registration matrices, and monitor deterministic evaluation parameters.
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '4px' }}>
                        <span className="engine-badge" style={{ 
                            background: 'var(--primary-soft, #f0fdfa)', 
                            color: 'var(--primary, #0d9488)', 
                            border: '1px solid var(--primary, #0d9488)', 
                            borderRadius: 'var(--radius, 8px)',
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                        }}>
                            <Icon name="activity" size={12} />
                            PIPELINE ACTIVE
                        </span>
                    </div>
                </header>

                {/* Analytical Counter Matrix Row - Balanced Dual Configuration */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', width: '100%' }} aria-label="Admin summary telemetry">
                    
                    <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 'var(--radius-lg, 14px)', display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', boxSizing: 'border-box', boxShadow: 'var(--shadow)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: 'var(--radius, 8px)', background: 'var(--surface-muted, #f1f5f9)', color: 'var(--primary, #0d9488)', flexShrink: 0 }}>
                            <Icon name="fileText" size={24} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text, #0f172a)', lineHeight: '1' }}>{documentCount}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--muted, #475569)', fontWeight: '500' }}>Indexed Protocol Vector PDFs</span>
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 'var(--radius-lg, 14px)', display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', boxSizing: 'border-box', boxShadow: 'var(--shadow)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: 'var(--radius, 8px)', background: 'var(--surface-muted, #f1f5f9)', color: 'var(--accent, #0ea5e9)', flexShrink: 0 }}>
                            <Icon name="users" size={24} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text, #0f172a)', lineHeight: '1' }}>{userCount}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--muted, #475569)', fontWeight: '500' }}>Registered Clinical Personnel</span>
                        </div>
                    </div>
                </section>

                {/* Sub-Navigation Interface Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border, #e2e8f0)', gap: '8px', width: '100%' }}>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('knowledge')}
                        style={{
                            padding: '12px 20px',
                            fontWeight: '600',
                            fontSize: '0.925rem',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'knowledge' ? '3px solid var(--primary, #0d9488)' : '3px solid transparent',
                            color: activeTab === 'knowledge' ? 'var(--primary, #0d9488)' : 'var(--muted, #475569)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s var(--ease)'
                        }}
                    >
                        <Icon name="fileText" size={16} />
                        Knowledge Base Vectors
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('users')}
                        style={{
                            padding: '12px 20px',
                            fontWeight: '600',
                            fontSize: '0.925rem',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'users' ? '3px solid var(--primary, #0d9488)' : '3px solid transparent',
                            color: activeTab === 'users' ? 'var(--primary, #0d9488)' : 'var(--muted, #475569)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s var(--ease)'
                        }}
                    >
                        <Icon name="users" size={16} />
                        User Base Matrix
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('telemetry')}
                        style={{
                            padding: '12px 20px',
                            fontWeight: '600',
                            fontSize: '0.925rem',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'telemetry' ? '3px solid var(--primary, #0d9488)' : '3px solid transparent',
                            color: activeTab === 'telemetry' ? 'var(--primary, #0d9488)' : 'var(--muted, #475569)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s var(--ease)'
                        }}
                    >
                        <Icon name="activity" size={16} />
                        RAG Validation Diagnostics
                    </button>
                </div>

                {/* Dashboard Tab Panels Layout Window */}
                <div style={{ minHeight: '450px', width: '100%' }}>
                    {activeTab === 'knowledge' && (
                        <div className="admin-reactive-override-zone" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '24px', width: '100%' }}>
                            <div style={{ background: 'var(--surface, #ffffff)', padding: '24px', borderRadius: 'var(--radius-lg, 14px)', border: '1px solid var(--border, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box', flex: '1 1 400px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border, #e2e8f0)', paddingBottom: '14px' }}>
                                    <Icon name="arrowUpRight" size={18} style={{ color: 'var(--primary, #0d9488)' }} />
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: '600', margin: '0', color: 'var(--text, #0f172a)' }}>Ingest Medical Directives</h2>
                                </div>
                                <DocumentUpload onUploadSuccess={triggerRefresh} />
                            </div>

                            <div style={{ background: 'var(--surface, #ffffff)', padding: '24px', borderRadius: 'var(--radius-lg, 14px)', border: '1px solid var(--border, #e2e8f0)', boxSizing: 'border-box', flex: '2 1 600px', width: '100%', overflowX: 'auto' }}>
                                <DocumentList
                                    refresh={refreshDocs}
                                    onDelete={triggerRefresh}
                                    onCountChange={setDocumentCount}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="admin-reactive-override-zone" style={{ background: 'var(--surface, #ffffff)', padding: '24px', borderRadius: 'var(--radius-lg, 14px)', border: '1px solid var(--border, #e2e8f0)', width: '100%', boxSizing: 'border-box' }}>
                            <UserList onCountChange={setUserCount} />
                        </div>
                    )}

                    {activeTab === 'telemetry' && (
                        <div className="admin-reactive-override-zone" style={{ background: 'var(--surface, #ffffff)', padding: '24px', borderRadius: 'var(--radius-lg, 14px)', border: '1px solid var(--border, #e2e8f0)', width: '100%', boxSizing: 'border-box' }}>
                            <EvaluationDashboard />
                        </div>
                    )}
                </div>

                {/* Operational Footer Context Block */}
                <footer style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.785rem', color: 'var(--muted, #475569)', width: '100%' }}>
                    <div>Administrative Pipeline Framework Node · Nepal Framework Sandbox</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="shield" size={12} />
                        Encrypted Ledger Access Active
                    </div>
                </footer>
            </div>
            
            {/* The Magic Override Zone: Connects child cards, tables, and layouts directly to your active CSS variables */}
            <style dangerouslySetInnerHTML={{__html: `
                .admin-reactive-override-zone div[class*="card"],
                .admin-reactive-override-zone div[class*="container"],
                .admin-reactive-override-zone .pdf-upload-card,
                .admin-reactive-override-zone table,
                .admin-reactive-override-zone .bg-dark,
                .admin-reactive-override-zone .card {
                    background: var(--surface, #ffffff) !important;
                    color: var(--text, #0f172a) !important;
                    border-color: var(--border, #e2e8f0) !important;
                }
                .admin-reactive-override-zone p, 
                .admin-reactive-override-zone span:not(.engine-badge),
                .admin-reactive-override-zone .text-muted,
                .admin-reactive-override-zone div[style*="color: rgb"],
                .admin-reactive-override-zone .muted {
                    color: var(--muted, #475569) !important;
                }
                .admin-reactive-override-zone h1,
                .admin-reactive-override-zone h2,
                .admin-reactive-override-zone h3,
                .admin-reactive-override-zone th {
                    color: var(--text, #0f172a) !important;
                    font-family: var(--font-display, sans-serif) !important;
                }
                .admin-reactive-override-zone td {
                    color: var(--text, #0f172a) !important;
                }
                .admin-reactive-override-zone div,
                .admin-reactive-override-zone tr,
                .admin-reactive-override-zone th,
                .admin-reactive-override-zone td {
                    border-color: var(--border, #e2e8f0) !important;
                }
                .admin-reactive-override-zone button[class*="btn-primary"],
                .admin-reactive-override-zone button[class*="primary"] {
                    background: var(--primary, #0d9488) !important;
                    color: #ffffff !important;
                }
            `}} />
        </main>
    )
}