"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Eye,
  UserCheck
} from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "staff" | "students";
  onSuccess: () => void;
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    importedCount: number;
    mappedInchargeCount?: number;
    errors?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    processFile(droppedFile);
  };

  const processFile = async (f: File) => {
    setFile(f);
    setError(null);
    setResult(null);

    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        setError("The uploaded file does not contain any data rows.");
        return;
      }

      setHeaders(Object.keys(rows[0] || {}));
      setTotalRows(rows.length);
      setPreviewRows(rows.slice(0, 3));
    } catch (err: any) {
      setError("Failed to read file: " + err.message);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = type === "staff" ? "/api/admin/import-staff" : "/api/admin/import-students";
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to upload to Supabase");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewRows([]);
    setTotalRows(0);
    setHeaders([]);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Import {type === "staff" ? "Staff (Faculty)" : "Students"} from Excel
              </h2>
              <p className="text-xs text-blue-200">
                Directly uploads and maps to Supabase database
              </p>
            </div>
          </div>
          <button
            onClick={() => { reset(); onClose(); }}
            className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Instructions Banner */}
          <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-xs text-sky-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-[#0284c7]">
              <span>ℹ️</span> 
              {type === "staff" ? "Staff Table Guidelines:" : "Students Table Guidelines:"}
            </p>
            {type === "staff" ? (
              <p className="text-sky-700">
                Required columns: <span className="font-mono font-bold">Name, Staff Code, Department, Designation, Email, Phone, Profile, Gender, room_location</span>.
                Profile paths like <span className="font-mono">uploads/1769...JPG</span> will automatically be prefixed with <span className="font-mono">https://ims.ritchennai.edu.in/</span>.
              </p>
            ) : (
              <p className="text-sky-700">
                Required columns: <span className="font-mono font-bold">Name, Register No, Email, Phone, Class, Semester, Section, Course, Department, Batch, Class Incharge, Staff Code, Hosteler, Profile, Gender</span>.
                The system will automatically link <span className="font-bold">Staff Code</span> to the corresponding Faculty in Supabase.
              </p>
            )}
          </div>

          {/* Drag & Drop Zone */}
          {!result && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-[#0284c7] hover:bg-sky-50/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white flex items-center justify-center transition-colors mb-3">
                <Upload className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : "Click to select or drag & drop Excel / CSV file"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports .xlsx, .xls, .csv files
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-700 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-bold">Import Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {file && previewRows.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#0284c7]" />
                  Preview: Found {totalRows} rows
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Change file
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">#</th>
                      {headers.slice(0, 5).map((h) => (
                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                        {headers.slice(0, 5).map((h) => (
                          <td key={h} className="p-2 max-w-[150px] truncate text-slate-700">
                            {String(row[h] || "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-900">
                  Import Completed Successfully!
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Successfully imported <span className="font-bold">{result.importedCount}</span> records directly into Supabase.
                </p>
                {result.mappedInchargeCount !== undefined && (
                  <p className="text-xs font-bold text-blue-700 mt-1">
                    🔗 {result.mappedInchargeCount} students automatically linked with Class Incharges!
                  </p>
                )}
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="text-left text-xs bg-white rounded-lg p-3 border border-emerald-200 text-amber-700 max-h-32 overflow-y-auto">
                  <p className="font-bold mb-1">Warnings ({result.errors.length}):</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => { reset(); onClose(); }}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-all"
              >
                Done
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {!result && (
          <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex items-center gap-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing to Supabase...</span>
                </>
              ) : (
                <>
                  <span>Upload &amp; Save to Supabase</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

