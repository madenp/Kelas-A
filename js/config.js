/**
 * config.js — Konfigurasi Dashboard
 * 
 * Ganti API_URL dengan URL Web App Google Apps Script Anda.
 * Contoh: "https://script.google.com/macros/s/AKfycb.../exec"
 */

const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbyfmx48zYNLczB5dyKekswxxrfyfKFSyOvGqaeN8gAzDiOEthT-lJylT_Ll-Yg3pyk/exec",

    SHEET_NAME: "Pemeriksaan",

    COLUMNS: ["No", "Nama", "Latihan 1", "Latihan 2", "Latihan 3"],

    LATIHAN_LIST: [
        { key: "latihan1", label: "Latihan 1", col: 3 },
        { key: "latihan2", label: "Latihan 2", col: 4 },
        { key: "latihan3", label: "Latihan 3", col: 5 },
    ],

    TABS: [
        { key: "dashboard", label: "📊 Dashboard", icon: "📊" },
        { key: "latihan1", label: "📝 Latihan 1", icon: "📝" },
        { key: "latihan2", label: "📝 Latihan 2", icon: "📝" },
        { key: "latihan3", label: "📝 Latihan 3", icon: "📝" },
    ],

    STATUS_OPTIONS: [
        { value: "Meminta Pemeriksaan", label: "📋 Meminta Pemeriksaan", badge: "badge-info", icon: "📋" },
    ],

    DEMO_DATA: [
        { no: 1, nama: "Ahmad Rizky", latihan1: "Meminta Pemeriksaan", latihan2: "Meminta Pemeriksaan", latihan3: "" },
        { no: 2, nama: "Siti Nurhaliza", latihan1: "Meminta Pemeriksaan", latihan2: "", latihan3: "" },
        { no: 3, nama: "Budi Santoso", latihan1: "", latihan2: "", latihan3: "" },
        { no: 4, nama: "Dewi Lestari", latihan1: "Meminta Pemeriksaan", latihan2: "Meminta Pemeriksaan", latihan3: "Meminta Pemeriksaan" },
        { no: 5, nama: "Eko Prasetyo", latihan1: "Meminta Pemeriksaan", latihan2: "", latihan3: "" },
        { no: 6, nama: "Fitri Handayani", latihan1: "Meminta Pemeriksaan", latihan2: "Meminta Pemeriksaan", latihan3: "" },
        { no: 7, nama: "Gilang Ramadhan", latihan1: "", latihan2: "", latihan3: "" },
        { no: 8, nama: "Hana Pertiwi", latihan1: "Meminta Pemeriksaan", latihan2: "Meminta Pemeriksaan", latihan3: "Meminta Pemeriksaan" },
    ],
};
