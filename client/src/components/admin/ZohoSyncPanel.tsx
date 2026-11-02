"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";
import adminService, { type ZohoImportSummary, type ZohoSyncStatus } from "@/services/admin.service";
import { formatRelativeTime } from "@/utils/format";

/** Admin card: Zoho CRM sync setup, last import, and an "Import from Zoho" button. */
export default function ZohoSyncPanel({ onImported }: { onImported?: () => void }) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<ZohoSyncStatus | null>(null);
  const [result, setResult] = useState<ZohoImportSummary | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getZohoStatus()
      .then(({ data }) => {
        if (cancelled) return;
        setStatus(data);
        setResult(data.lastImport);
      })
      .catch(() => {
        // Older backend without the status route: hide the panel.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) return null;

  const handleImport = async () => {
    setImporting(true);
    try {
      const { data } = await adminService.importFromZoho();
      setResult(data);
      showToast({
        type: data.failed.length ? "info" : "success",
        title: "Zoho import finished",
        message: `${data.created} new, ${data.updated} updated${data.failed.length ? `, ${data.failed.length} failed` : ""}`,
      });
      onImported?.();
    } catch (error) {
      showToast({ type: "error", title: "Zoho import failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card padding="md" className="border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">Zoho CRM sync</h3>
            <Badge variant={status.webhookConfigured ? "success" : "warning"} size="sm">
              Auto-sync {status.webhookConfigured ? "on" : "off"}
            </Badge>
            <Badge variant={status.apiConfigured ? "success" : "warning"} size="sm">
              Import {status.apiConfigured ? "ready" : "not set up"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Listings come from the Zoho <span className="font-medium">{status.module}</span> module.
            {status.scheduleMinutes ? ` A full import also runs every ${status.scheduleMinutes} minutes.` : ""}
          </p>
          {!status.apiConfigured && (
            <p className="mt-1 text-xs text-amber-700">
              Add ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN on the server to enable importing.
            </p>
          )}
        </div>
        <Button
          size="sm"
          icon={<RefreshCw className={`h-4 w-4 ${importing ? "animate-spin" : ""}`} />}
          disabled={!status.apiConfigured || importing || status.importRunning}
          onClick={() => void handleImport()}
        >
          {importing ? "Importing…" : "Import from Zoho"}
        </Button>
      </div>

      {result && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            {result.failed.length ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            Last import {result.finishedAt ? formatRelativeTime(result.finishedAt).toLowerCase() : ""}: {result.total} records,{" "}
            {result.created} new, {result.updated} updated, {result.hidden} hidden (not published in Zoho)
            {result.failed.length ? `, ${result.failed.length} failed` : ""}
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {result.failed.slice(0, 10).map((item) => (
                <li key={item.zohoId || item.name}>
                  {item.name || `Record ${item.zohoId}`}: {item.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
