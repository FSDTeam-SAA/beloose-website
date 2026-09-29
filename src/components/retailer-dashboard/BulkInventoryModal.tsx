"use client";

import { useState, useRef } from "react";
import {
  Download,
  FileSpreadsheet,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  previewBulkInventory,
  validateBulkInventory,
  importBulkInventory,
  type BulkPreviewResult,
  type BulkValidateResult,
} from "@/lib/inventory";
import { toast } from "sonner";

interface Props {
  open: boolean;
  token: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const templateHeaders = [
  "UPC",
  "Quantity",
  "Price",
  "Price Per Box",
  "Humidor",
  "Wall",
  "Shelf",
  "Column",
];

const sampleRows = [
  ["0716103012345", "10", "18.50", "185.00", "Humidor Room A", "North Wall", "Shelf 1", "3"],
  ["0716103012352", "15", "22.00", "220.00", "Humidor Room A", "North Wall", "Shelf 2", "5"],
];

export default function BulkInventoryModal({
  open,
  token,
  onOpenChange,
  onSuccess,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "validating" | "ready">("upload");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<BulkPreviewResult | null>(null);
  const [validationResult, setValidationResult] = useState<BulkValidateResult | null>(null);

  const reset = () => {
    setFile(null);
    setStep("upload");
    setLoading(false);
    setPreviewData(null);
    setValidationResult(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        templateHeaders.join(","),
        ...sampleRows.map((row) => row.join(",")),
      ].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = "Retailer-Inventory-Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (selected?: File) => {
    if (!selected) return;
    setFile(selected);
    setLoading(true);
    try {
      const result = await previewBulkInventory(token, selected);
      setPreviewData(result);
      setStep("preview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse file.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!previewData?.mappedRows?.length) return;
    setLoading(true);
    setStep("validating");
    try {
      const result = await validateBulkInventory(token, previewData.mappedRows);
      setValidationResult(result);
      setStep("ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Validation failed.");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!previewData?.mappedRows?.length) return;
    setLoading(true);
    try {
      const result = await importBulkInventory(token, {
        rows: previewData.mappedRows,
      });
      toast.success(
        `Imported ${result.importedCount} inventory items successfully!`
      );
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="dashboard-copy max-h-[92vh] max-w-[620px] overflow-hidden rounded-xl border border-[#76552b] bg-[#3B2515] p-0 text-[#f4dfa8] shadow-2xl">
        <DialogHeader className="border-b border-[#76552b]/40 px-5 pb-4 pt-5">
          <DialogTitle className="font-playfair text-xl font-bold text-[#d5a744]">
            Bulk Upload Inventory
          </DialogTitle>
          <DialogDescription className="text-xs text-[#bca37b]">
            Import multiple cigar inventory items using UPC codes matching the Master Database.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-[#a98b5c] transition hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="max-h-[calc(92vh-80px)] overflow-y-auto p-5">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-[#76552b]/60 bg-[#291809] p-3.5">
                <div>
                  <p className="text-xs font-semibold text-[#f4dfa8]">
                    Retailer Inventory Template
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#bca37b]">
                    Columns: UPC, Quantity, Price, Price Per Box, Humidor, Wall, Shelf, Column
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded border border-[#d5a744] px-3 text-xs font-semibold text-[#d5a744] transition hover:bg-[#d5a744]/10"
                >
                  <Download size={14} />
                  Download CSV
                </button>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="sr-only"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />

              <button
                type="button"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#76552b] bg-[#291809]/60 px-5 text-center transition hover:border-[#d5a744] hover:bg-[#291809]"
              >
                {loading ? (
                  <span className="text-xs text-[#d5a744]">Parsing spreadsheet...</span>
                ) : file ? (
                  <>
                    <FileSpreadsheet className="mb-2 h-8 w-8 text-[#d5a744]" />
                    <span className="text-xs font-medium text-[#f4dfa8]">{file.name}</span>
                    <span className="mt-1 text-[10px] text-[#a98b5c]">Click to change file</span>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-[#d5a744]" />
                    <span className="text-xs font-semibold text-[#f4dfa8]">
                      Choose CSV or Excel Spreadsheet
                    </span>
                    <span className="mt-1 text-[10px] text-[#a98b5c]">
                      Requires: UPC, Quantity, Price, Humidor, Shelf
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === "preview" && previewData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-[#76552b] bg-[#291809] p-3 text-xs">
                <div>
                  <span className="text-[#a98b5c]">Rows Parsed: </span>
                  <span className="font-semibold text-[#d5a744]">
                    {previewData.totalRows}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1 text-[10px] text-[#bca37b] hover:text-[#d5a744]"
                >
                  <RotateCcw size={12} />
                  Choose different file
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#76552b] bg-[#211305]">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-[#170c03] text-[#d5a744]">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">UPC</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Humidor</th>
                      <th className="p-2">Shelf</th>
                      <th className="p-2">Col</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#76552b]/30">
                    {previewData.mappedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#34200e]/40">
                        <td className="p-2 text-[#a98b5c]">{idx + 1}</td>
                        <td className="p-2 font-mono text-[#f4dfa8]">{String(row.upc ?? "—")}</td>
                        <td className="p-2">{String(row.quantity ?? "")}</td>
                        <td className="p-2 font-semibold text-[#d5a744]">${String(row.price ?? "")}</td>
                        <td className="p-2 truncate max-w-28">{String(row.humidor ?? "")}</td>
                        <td className="p-2 truncate max-w-24">{String(row.shelf ?? "")}</td>
                        <td className="p-2">{String(row.column || row.shelfColumn || "1")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.mappedRows.length > 5 && (
                <p className="text-center text-[10px] text-[#a98b5c]">
                  Showing first 5 of {previewData.mappedRows.length} rows.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={reset}
                  className="h-9 rounded border border-[#76552b] px-4 text-xs text-[#bca37b] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleValidate}
                  className="flex h-9 items-center gap-1.5 rounded bg-[#d5a744] px-4 text-xs font-semibold text-[#291806] hover:bg-[#e0b653]"
                >
                  Validate Data <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === "ready" && validationResult && (() => {
            const validCount = Number(validationResult.validCount ?? validationResult.valid ?? 0);
            const invalidCount = Number(validationResult.invalidCount ?? validationResult.invalid ?? 0);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-center">
                    <div className="text-xl font-bold text-emerald-400">
                      {validCount}
                    </div>
                    <div className="text-[10px] uppercase text-emerald-300">Valid Rows</div>
                  </div>
                  <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-center">
                    <div className="text-xl font-bold text-red-400">
                      {invalidCount}
                    </div>
                    <div className="text-[10px] uppercase text-red-300">Invalid Rows</div>
                  </div>
                </div>

                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-red-500/30 bg-[#29120c] p-3 text-xs">
                    <div className="mb-2 font-semibold text-red-300 flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      Validation Errors:
                    </div>
                    <div className="space-y-1 text-[11px] text-red-200">
                      {validationResult.errors.map((err, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-mono font-bold text-red-400 shrink-0">Row {err.row}:</span>
                          <span>{err.message || err.reason || "Invalid row format"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validCount > 0 ? (
                  <div className="rounded-lg border border-[#76552b]/50 bg-[#291809] p-3 text-xs text-[#d8bc84] flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>
                      Ready to import {validCount} valid items into your store inventory.
                    </span>
                  </div>
                ) : (
                  <p className="text-center text-xs text-red-400">
                    No valid rows to import. Please correct errors and re-upload.
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="h-9 rounded border border-[#76552b] px-4 text-xs text-[#bca37b] hover:text-white"
                  >
                    Start Over
                  </button>
                  <button
                    type="button"
                    disabled={loading || validCount === 0}
                    onClick={handleImport}
                    className="flex h-9 items-center gap-1.5 rounded bg-[#d5a744] px-4 text-xs font-semibold text-[#291806] hover:bg-[#e0b653] disabled:opacity-50"
                  >
                    {loading ? "Importing..." : `Import ${validCount} Items`}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
