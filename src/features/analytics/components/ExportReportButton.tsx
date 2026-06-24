import React, { useState } from "react";
import { generateAnalyticsReport } from "../utils/pdfExporter";
import {
  DebtTrendPoint,
  LanguageRow,
  OverviewSummary,
} from "../../../shared/types/analytics.types";

interface Props {
  overview: OverviewSummary | undefined;
  trends: DebtTrendPoint[] | undefined;
  languages: LanguageRow[] | undefined;
  chartsRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportReportButton: React.FC<Props> = ({
  overview,
  trends,
  languages,
  chartsRef,
}) => {
  const [busy, setBusy] = useState(false);

  const disabled = !overview || busy;

  const handleClick = async () => {
    if (!overview) return;
    setBusy(true);
    try {
      await generateAnalyticsReport({
        overview,
        trends: trends ?? [],
        languages: languages ?? [],
        chartsContainer: chartsRef.current,
        filenameHint: overview.repoName,
      });
    } catch (err) {
      console.error("PDF export failed", err);
      // eslint-disable-next-line no-alert
      alert("Sorry, the PDF export failed. Check the console for details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-100 transition-colors hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "Compiling…" : "Export PDF Report"}
    </button>
  );
};
