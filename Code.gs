/**
 * Google Apps Script - Backend untuk Dashboard Monitoring Tugas Pemeriksaan
 * 
 * Sheet: "Pemeriksaan"
 * Kolom: No | Nama | Latihan 1 | Latihan 2 | Latihan 3
 * Data dimulai dari baris ke-2 (baris 1 = header)
 * 
 * CARA DEPLOY:
 * 1. Buka Google Sheets → Extensions → Apps Script
 * 2. Copy-paste seluruh kode ini ke editor
 * 3. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL Web App → paste ke index.html (variabel API_URL)
 */

const SHEET_NAME = "Pemeriksaan";
const NUM_COLS = 5; // No, Nama, Latihan 1, Latihan 2, Latihan 3

/**
 * Handler GET - Mengambil semua data dari sheet
 * Response format: { status: "success", data: [...] }
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createJsonResponse({ status: "error", message: "Sheet '" + SHEET_NAME + "' tidak ditemukan" });
    }
    
    const lastRow = sheet.getLastRow();
    
    // Jika hanya ada header atau kosong
    if (lastRow < 2) {
      return createJsonResponse({ status: "success", data: [] });
    }
    
    // Ambil data dari baris 2 sampai terakhir (5 kolom)
    const dataRange = sheet.getRange(2, 1, lastRow - 1, NUM_COLS);
    const values = dataRange.getValues();
    
    // Konversi ke array of objects
    const data = values
      .filter(row => row[0] !== "" || row[1] !== "")
      .map(row => ({
        no: row[0],
        nama: row[1],
        latihan1: row[2] || "",
        latihan2: row[3] || "",
        latihan3: row[4] || ""
      }));
    
    return createJsonResponse({ status: "success", data: data });
    
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Handler POST - Operasi CRUD
 * Request body format:
 *   { action: "edit", data: { no, latihan1, latihan2, latihan3 } }
 *   { action: "editField", data: { no, field: "latihan1"|"latihan2"|"latihan3", value: "Selesai" } }
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createJsonResponse({ status: "error", message: "Sheet '" + SHEET_NAME + "' tidak ditemukan" });
    }
    
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const payload = request.data;
    
    let result;
    
    switch (action) {
      case "edit":
        result = editData(sheet, payload);
        break;
      case "editField":
        result = editField(sheet, payload);
        break;
      default:
        result = { status: "error", message: "Action '" + action + "' tidak dikenali" };
    }
    
    return createJsonResponse(result);
    
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Edit semua field latihan berdasarkan No
 */
function editData(sheet, payload) {
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    return { status: "error", message: "Tidak ada data untuk diedit" };
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, NUM_COLS).getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == payload.no) {
      const rowIndex = i + 2;
      sheet.getRange(rowIndex, 3).setValue(payload.latihan1 || "");
      sheet.getRange(rowIndex, 4).setValue(payload.latihan2 || "");
      sheet.getRange(rowIndex, 5).setValue(payload.latihan3 || "");
      return { status: "success", message: "Data berhasil diperbarui" };
    }
  }
  
  return { status: "error", message: "Data dengan No " + payload.no + " tidak ditemukan" };
}

/**
 * Edit satu field latihan tertentu berdasarkan No
 * payload: { no, field: "latihan1"|"latihan2"|"latihan3", value: "Selesai" }
 */
function editField(sheet, payload) {
  const fieldMap = { latihan1: 3, latihan2: 4, latihan3: 5 };
  const col = fieldMap[payload.field];
  
  if (!col) {
    return { status: "error", message: "Field '" + payload.field + "' tidak valid" };
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { status: "error", message: "Tidak ada data untuk diedit" };
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == payload.no) {
      const rowIndex = i + 2;
      sheet.getRange(rowIndex, col).setValue(payload.value || "");
      return { status: "success", message: "Data berhasil diperbarui" };
    }
  }
  
  return { status: "error", message: "Data dengan No " + payload.no + " tidak ditemukan" };
}

/**
 * Helper: Buat response JSON dengan CORS headers
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
