/**
 * components.js — Komponen UI Reusable
 * 
 * Komponen: Toast, Loading, EmptyState, StatCard, TabNav, FormModal, ConfirmDialog
 */

const { useState, useEffect } = React;

// ===== Toast Notification =====
function Toast({ toasts }) {
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ===== Loading Spinner =====
function Loading() {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <span className="loading-text">Memuat data...</span>
        </div>
    );
}

// ===== Empty State =====
function EmptyState({ searchQuery }) {
    return (
        <div className="empty-state">
            <div className="empty-icon">{searchQuery ? '🔍' : '📋'}</div>
            <h3>{searchQuery ? 'Tidak ada hasil' : 'Belum ada data'}</h3>
            <p>
                {searchQuery
                    ? `Tidak ditemukan data untuk "${searchQuery}"`
                    : 'Data belum tersedia'}
            </p>
        </div>
    );
}

// ===== Stat Card =====
function StatCard({ icon, value, label }) {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

// ===== Tab Navigation =====
function TabNav({ activeTab, onTabChange }) {
    return (
        <div className="tab-nav">
            {CONFIG.TABS.map(tab => (
                <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// ===== Modal Form (Edit status latihan) =====
function FormModal({ isOpen, onClose, onSubmit, editData, isSubmitting, activeTab }) {

    if (!isOpen) return null;

    const statusValue = CONFIG.STATUS_OPTIONS[0].value; // "Meminta Pemeriksaan"

    const handleSubmit = () => {
        // Jika di tab latihan tertentu, kirim hanya field tersebut
        if (activeTab === 'latihan1' || activeTab === 'latihan2' || activeTab === 'latihan3') {
            onSubmit({ field: activeTab, value: statusValue });
        } else {
            // Dashboard: set semua
            onSubmit({ latihan1: statusValue, latihan2: statusValue, latihan3: statusValue });
        }
    };

    const isSingleField = activeTab === 'latihan1' || activeTab === 'latihan2' || activeTab === 'latihan3';
    const latihanLabel = isSingleField ? CONFIG.LATIHAN_LIST.find(l => l.key === activeTab)?.label : 'Semua Latihan';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>📋 {editData ? editData.nama : ''}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <p className="confirm-text">
                        Ajukan <strong>Meminta Pemeriksaan</strong> untuk <strong>{latihanLabel}</strong>?
                    </p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Batal
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? '⏳ Mengirim...' : '📋 Meminta Pemeriksaan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ===== Confirm Delete Dialog =====
function ConfirmDialog({ isOpen, onClose, onConfirm, item, isSubmitting }) {
    if (!isOpen || !item) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🗑️ Konfirmasi Hapus</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <p className="confirm-text">
                        Apakah Anda yakin ingin menghapus data:<br />
                        <strong>No {item.no} — {item.nama}</strong>
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? '⏳ Menghapus...' : '🗑️ Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}
