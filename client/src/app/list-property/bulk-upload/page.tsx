"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload, FileArchive } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EnterpriseInput, FormField } from "@/components/forms/EnterpriseForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import propertyService, { type BulkUploadResult } from "@/services/property.service";

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export default function BulkUploadPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const isAllowed = user && ["seller", "admin"].includes(user.role);

  const handleTemplateDownload = async () => {
    try {
      setTemplateLoading(true);
      const blob = await propertyService.downloadBulkTemplate();
      downloadBlob(blob, "credxp-property-bulk-template.xlsx");
    } catch (error) {
      showToast({ type: "error", title: "Template download failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!excelFile || !excelFile.name.toLowerCase().endsWith(".xlsx")) {
      showToast({ type: "error", title: "Excel file required", message: "Please upload a .xlsx template file." });
      return;
    }

    if (!zipFile || !zipFile.name.toLowerCase().endsWith(".zip")) {
      showToast({ type: "error", title: "Image ZIP required", message: "Please upload a .zip file with the referenced images." });
      return;
    }

    try {
      setLoading(true);
      const response = await propertyService.bulkUpload(excelFile, zipFile);
      setResult(response.data);
      showToast({
        type: response.data.failedCount ? "info" : "success",
        title: "Bulk upload complete",
        message: `${response.data.createdCount} created, ${response.data.failedCount} failed.`,
      });
    } catch (error) {
      showToast({ type: "error", title: "Bulk upload failed", message: error instanceof Error ? error.message : "Please review your files." });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-[50vh]" />;
  }

  if (!isAllowed) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <Upload className="mx-auto h-10 w-10 text-accent-500" />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Seller access required</h1>
          <p className="mt-2 text-sm text-slate-600">Login as a seller or admin to bulk upload property listings.</p>
          <Link href="/login?next=/list-property/bulk-upload" className="mt-6 inline-block">
            <Button>Login</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-10 text-white lg:py-14">
        <Container size="lg">
          <Badge variant="accent" icon={<FileSpreadsheet className="h-3 w-3" />}>Bulk Property Upload</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Upload Multiple Listings</h1>
          <p className="mt-3 max-w-2xl text-white/72">
            Download the Excel template, fill one property per row, then upload it with a ZIP containing each row&apos;s three image files.
          </p>
        </Container>
      </section>

      <Container size="lg" className="py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-950">Upload Excel and Images</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Only `.xlsx` and `.zip` files are accepted. Image filenames in `image1`, `image2`, and `image3` must match files inside the ZIP.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Excel File" helper="Use the downloaded CredXP template and keep the Properties sheet headers unchanged.">
                <EnterpriseInput
                  type="file"
                  accept=".xlsx"
                  onChange={(event) => setExcelFile(event.target.files?.[0] || null)}
                  required
                  className="pt-3 file:mr-4 file:rounded-full file:border-0 file:bg-accent-500/10 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-accent-600"
                />
              </FormField>
              <FormField label="Images ZIP" helper="Include every property image referenced in the Excel file. Folder paths are allowed; filenames are matched.">
                <EnterpriseInput
                  type="file"
                  accept=".zip"
                  onChange={(event) => setZipFile(event.target.files?.[0] || null)}
                  required
                  className="pt-3 file:mr-4 file:rounded-full file:border-0 file:bg-blue-500/10 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700"
                />
              </FormField>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" size="lg" loading={loading} icon={<Upload className="h-4 w-4" />}>
                  Upload Listings
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  loading={templateLoading}
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleTemplateDownload}
                  className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                >
                  Download Template
                </Button>
              </div>
            </form>
          </Card>

          <Card padding="lg" className="border-slate-200 bg-slate-950 text-white shadow-sm">
            <FileArchive className="h-9 w-9 text-accent-300" />
            <h2 className="mt-4 text-lg font-semibold">ZIP Matching Rules</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/70">
              <p>Every Excel row needs `image1`, `image2`, and `image3`.</p>
              <p>If Excel says `front.jpg`, the ZIP must contain a file named `front.jpg`.</p>
              <p>Valid rows are imported even if other rows fail validation.</p>
            </div>
          </Card>
        </div>

        {result && (
          <Card padding="lg" className="mt-8 border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Upload Results</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {result.totalRows} rows processed. {result.createdCount} created, {result.failedCount} failed.
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="success" className="text-emerald-700">{result.createdCount} created</Badge>
                <Badge variant={result.failedCount ? "error" : "outline"} className={result.failedCount ? "text-red-700" : "text-slate-700"}>
                  {result.failedCount} failed
                </Badge>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.5fr)] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                <span>Row</span>
                <span>Status</span>
                <span>Details</span>
              </div>
              <div className="divide-y divide-slate-200">
                {result.results.map((row) => (
                  <div key={`${row.row}-${row.propertyId || row.errors?.join("-")}`} className="grid grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.5fr)] gap-3 px-4 py-4 text-sm">
                    <span className="font-semibold text-slate-900">{row.row}</span>
                    <span className={row.success ? "inline-flex items-center gap-2 font-semibold text-emerald-700" : "inline-flex items-center gap-2 font-semibold text-red-600"}>
                      {row.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      {row.success ? "Created" : "Failed"}
                    </span>
                    <span className="text-slate-600">
                      {row.success ? row.title : row.errors?.join("; ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </Container>
    </>
  );
}
