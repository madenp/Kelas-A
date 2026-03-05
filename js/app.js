/**
 * app.js — Komponen Utama Dashboard
 * 
 * Menggunakan komponen dari components.js dan konfigurasi dari config.js
 * Mendukung tab navigasi: Dashboard, Latihan 1, Latihan 2, Latihan 3
 */

const { useState: useStateApp, useEffect: useEffectApp, useCallback, useMemo } = React;

function App() {
    const [data, setData] = useStateApp([]);
    const [loading, setLoading] = useStateApp(true);
    const [searchQuery, setSearchQuery] = useStateApp('');
    const [showForm, setShowForm] = useStateApp(false);
    const [editItem, setEditItem] = useStateApp(null);
    const [toasts, setToasts] = useStateApp([]);
    const [isSubmitting, setIsSubmitting] = useStateApp(false);
    const [activeTab, setActiveTab] = useStateApp('dashboard');

    // === Toast ===
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    // === Fetch Data ===
    const fetchData = useCallback(async () => {
        if (!CONFIG.API_URL) {
            setData(CONFIG.DEMO_DATA);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(CONFIG.API_URL);
            const result = await res.json();
            if (result.status === 'success') {
                setData(result.data);
            } else {
                addToast(result.message || 'Gagal memuat data', 'error');
            }
        } catch (err) {
            addToast('Gagal terhubung ke server: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffectApp(() => { fetchData(); }, [fetchData]);

    // === POST Request ===
    const postData = async (action, payload) => {
        if (!CONFIG.API_URL) return simulateCRUD(action, payload);

        const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action, data: payload })
        });
        return await res.json();
    };

    // === Simulasi CRUD (mode demo) ===
    const simulateCRUD = (action, payload) => {
        switch (action) {
            case 'edit':
                setData(prev => prev.map(d =>
                    d.no === payload.no
                        ? { ...d, latihan1: payload.latihan1, latihan2: payload.latihan2, latihan3: payload.latihan3 }
                        : d
                ));
                return { status: 'success', message: 'Data berhasil diperbarui (demo)' };
            case 'editField':
                setData(prev => prev.map(d =>
                    d.no === payload.no
                        ? { ...d, [payload.field]: payload.value }
                        : d
                ));
                return { status: 'success', message: 'Data berhasil diperbarui (demo)' };
            default:
                return { status: 'error', message: 'Action tidak dikenali' };
        }
    };

    // === Handler: Submit Edit ===
    const handleSubmit = async (formData) => {
        if (!editItem) return;
        setIsSubmitting(true);
        try {
            let result;
            if (formData.field) {
                // Single field edit (dari tab latihan)
                result = await postData('editField', {
                    no: editItem.no,
                    field: formData.field,
                    value: formData.value
                });
            } else {
                // Edit all (dari dashboard)
                result = await postData('edit', {
                    no: editItem.no,
                    latihan1: formData.latihan1,
                    latihan2: formData.latihan2,
                    latihan3: formData.latihan3
                });
            }

            if (result.status === 'success') {
                addToast(result.message, 'success');
                setShowForm(false);
                setEditItem(null);
                if (CONFIG.API_URL) fetchData();
            } else {
                addToast(result.message, 'error');
            }
        } catch (err) {
            addToast('Terjadi kesalahan: ' + err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // === Helper: get status value for current tab ===
    const getStatusForTab = (item, tab) => {
        if (tab === 'latihan1') return item.latihan1 || '';
        if (tab === 'latihan2') return item.latihan2 || '';
        if (tab === 'latihan3') return item.latihan3 || '';
        return '';
    };

    // === Filter & Stats ===
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(d =>
            String(d.no).includes(q) ||
            (d.nama && d.nama.toLowerCase().includes(q))
        );
    }, [data, searchQuery]);

    // Stats berdasarkan tab aktif
    const stats = useMemo(() => {
        const statusVal = CONFIG.STATUS_OPTIONS[0].value.toLowerCase(); // "meminta pemeriksaan"
        if (activeTab === 'dashboard') {
            const allStatuses = data.flatMap(d => [d.latihan1, d.latihan2, d.latihan3]);
            return {
                total: data.length,
                meminta: allStatuses.filter(s => s && s.toLowerCase() === statusVal).length,
                belum: allStatuses.filter(s => !s || s.toLowerCase() !== statusVal).length,
            };
        } else {
            return {
                total: data.length,
                meminta: data.filter(d => getStatusForTab(d, activeTab).toLowerCase() === statusVal).length,
                belum: data.filter(d => {
                    const v = getStatusForTab(d, activeTab);
                    return !v || v.toLowerCase() !== statusVal;
                }).length,
            };
        }
    }, [data, activeTab]);

    // === Badge Renderer ===
    const renderBadge = (status) => {
        const opt = CONFIG.STATUS_OPTIONS.find(
            o => o.value.toLowerCase() === (status || '').toLowerCase()
        );
        if (opt) return <span className={`badge ${opt.badge}`}>{opt.icon} {opt.value}</span>;
        if ((status || '').toLowerCase() === 'penilaian di tutup') {
            return <span className="badge badge-danger">🔒 Penilaian Ditutup</span>;
        }
        if ((status || '').toLowerCase() === 'sudah di nilai') {
            return <span className="badge badge-success">✅ Sudah Di Nilai</span>;
        }
        return <span className="badge badge-info">{status || '—'}</span>;
    };

    // === Tab title ===
    const tabTitle = useMemo(() => {
        if (activeTab === 'dashboard') return '📊 Ringkasan Semua Latihan';
        const lat = CONFIG.LATIHAN_LIST.find(l => l.key === activeTab);
        return lat ? `📝 Monitoring ${lat.label}` : '';
    }, [activeTab]);

    // === RENDER ===
    return (
        <div className="app-container">
            <Toast toasts={toasts} />

            {/* Header */}
            <header className="header">
                <div className="header-badge">
                    <span className="dot"></span>
                    Komputer Akuntansi
                </div>
                <h1>Dashboard Monitoring Tugas</h1>
                <p>Kelas A — Data terintegrasi dengan Google Sheets</p>
            </header>

            {/* Config Banner */}
            {!CONFIG.API_URL && (
                <div className="config-banner">
                    <span className="banner-icon">⚠️</span>
                    <div className="banner-text">
                        <strong>Mode Demo — Belum terhubung ke Google Apps Script</strong>
                        Buka file <code>js/config.js</code>, isi variabel <code>API_URL</code> dengan
                        URL Web App dari Google Apps Script Anda.
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Stat Cards */}
            <div className="stats-grid">
                <StatCard icon="📊" value={stats.total} label="Total Siswa" />
                <StatCard icon="📋" value={stats.meminta} label="Meminta Pemeriksaan" />
                <StatCard icon="⏳" value={stats.belum} label="Belum Minta" />
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Cari nama siswa..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary" onClick={fetchData} title="Refresh Data">
                    🔄 Refresh
                </button>
            </div>

            {/* Data Section Header */}
            <div className="data-section-header">
                <span className="data-section-title">{tabTitle}</span>
                <span className="data-section-count">{filteredData.length} dari {data.length} data</span>
            </div>

            {/* Data Cards */}
            {loading ? (
                <Loading />
            ) : filteredData.length === 0 ? (
                <EmptyState searchQuery={searchQuery} />
            ) : (
                <div className="data-cards-grid">
                    {filteredData.map(item => {
                        // Tentukan status class berdasarkan tab
                        const statusVal = CONFIG.STATUS_OPTIONS[0].value.toLowerCase();
                        let hasStatus;
                        if (activeTab === 'dashboard') {
                            const statuses = [item.latihan1, item.latihan2, item.latihan3];
                            const allDone = statuses.every(s => s && s.toLowerCase() === statusVal);
                            hasStatus = statuses.some(s => s && s.toLowerCase() === statusVal);
                            var statusClass = allDone ? 'status-lainnya' : hasStatus ? 'status-proses' : 'status-belum';
                        } else {
                            const val = getStatusForTab(item, activeTab);
                            var statusClass = (val && val.toLowerCase() === statusVal) ? 'status-lainnya' : 'status-belum';
                        }

                        return (
                            <div key={item.no} className={`data-card ${statusClass}`}>
                                <div className="data-card-top">
                                    <span className="data-card-number">#{item.no}</span>
                                </div>
                                <div className="data-card-body">
                                    <div className="data-card-nama">{item.nama}</div>
                                    <div className="data-card-status">
                                        {activeTab === 'dashboard' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '65px' }}>Latihan 1</span>
                                                    {renderBadge(item.latihan1)}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '65px' }}>Latihan 2</span>
                                                    {renderBadge(item.latihan2)}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '65px' }}>Latihan 3</span>
                                                    {renderBadge(item.latihan3)}
                                                </div>
                                            </div>
                                        ) : (
                                            renderBadge(getStatusForTab(item, activeTab))
                                        )}
                                    </div>
                                </div>
                                {activeTab !== 'dashboard' && (() => {
                                    const currentStatus = getStatusForTab(item, activeTab);
                                    const alreadySubmitted = currentStatus && currentStatus.toLowerCase() === statusVal;
                                    const isClosed = currentStatus && currentStatus.toLowerCase() === 'penilaian di tutup';
                                    const isGraded = currentStatus && currentStatus.toLowerCase() === 'sudah di nilai';
                                    if (isClosed) {
                                        return (
                                            <span className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>
                                                🔒 Penilaian Ditutup
                                            </span>
                                        );
                                    }
                                    if (isGraded) {
                                        return (
                                            <span className="badge badge-success" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>
                                                ✅ Sudah Di Nilai
                                            </span>
                                        );
                                    }
                                    return !alreadySubmitted ? (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            style={{ width: '100%', justifyContent: 'center' }}
                                            onClick={() => { setEditItem(item); setShowForm(true); }}
                                        >📋 Meminta Pemeriksaan</button>
                                    ) : (
                                        <span className="badge badge-info" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>
                                            ✅ Sudah Diminta
                                        </span>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Modal */}
            <FormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditItem(null); }}
                onSubmit={handleSubmit}
                editData={editItem}
                isSubmitting={isSubmitting}
                activeTab={activeTab}
            />

            {/* Footer */}
            <footer style={{
                textAlign: 'center',
                padding: '32px 0 8px',
                fontSize: '13px',
                color: 'var(--text-muted)',
            }}>
                © 2026 <a
                    href="https://instagram.com/madenp_"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}
                >@madenp_</a> — Instagram
            </footer>
        </div>
    );
}

// === Mount React App ===
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
