import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import {
  LanguageRow,
  OverviewSummary,
  DebtTrendPoint,
} from "../../../shared/types/analytics.types";



interface ExportPayload {
  overview: OverviewSummary;
  trends: DebtTrendPoint[];
  languages: LanguageRow[];
  chartsContainer?: HTMLElement | null;
  filenameHint?: string;
}

const BRAND_PURPLE: [number, number, number] = [139, 92, 246];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_400: [number, number, number] = [148, 163, 184];

const drawHeader = (doc: jsPDF, repoName: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...SLATE_900);
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CodePilot · Analytics Report", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_400);
  doc.text(
    `${repoName} — generated ${format(new Date(), "PPpp")}`,
    14,
    20,
  );

  // reset for body
  doc.setTextColor(0, 0, 0);
};

const drawFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_400);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: "right" },
    );
    doc.text("CodePilot · confidential", 14, pageHeight - 8);
  }
};

const renderScorecardTable = (doc: jsPDF, overview: OverviewSummary) => {
  autoTable(doc, {
    startY: 32,
    head: [["Metric", "Value", "Notes"]],
    body: overview.scorecards.map((card) => [
      card.label,
      card.value,
      card.hint ?? "",
    ]),
    headStyles: { fillColor: BRAND_PURPLE, textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
    theme: "striped",
  });
};

const renderSeverityTable = (doc: jsPDF, overview: OverviewSummary) => {
  const startY = (doc as unknown as { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY + 8;
  autoTable(doc, {
    startY,
    head: [["Severity", "Count", "% of Total"]],
    body: overview.severityDistribution.map((slice) => [
      slice.label,
      slice.value.toString(),
      `${slice.percent.toFixed(1)}%`,
    ]),
    headStyles: { fillColor: BRAND_PURPLE, textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
    theme: "grid",
  });
};

const renderLanguagesTable = (doc: jsPDF, languages: LanguageRow[]) => {
  if (!languages.length) return;
  const startY = (doc as unknown as { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY + 8;
  autoTable(doc, {
    startY,
    head: [["Language", "Files", "LOC", "Issues", "Density /1k LOC"]],
    body: languages.map((row) => [
      row.language,
      row.files.toString(),
      row.loc.toString(),
      row.totalIssues.toString(),
      row.density.toFixed(1),
    ]),
    headStyles: { fillColor: BRAND_PURPLE, textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
    theme: "striped",
  });
};

const renderTrendsTable = (doc: jsPDF, trends: DebtTrendPoint[]) => {
  if (!trends.length) return;
  const startY = (doc as unknown as { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY + 8;
  autoTable(doc, {
    startY,
    head: [["Date", "Debt (hrs)", "Issues", "Quality Score"]],
    body: trends.map((p) => [
      p.date,
      p.debtHours.toFixed(1),
      p.issues.toString(),
      p.score.toString(),
    ]),
    headStyles: { fillColor: BRAND_PURPLE, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    theme: "grid",
  });
};

const renderChartsSnapshot = async (
  doc: jsPDF,
  container: HTMLElement,
) => {
  // Snapshot the entire charts pane into a canvas, then embed as an image.
  const canvas = await html2canvas(container, {
    backgroundColor: "#0f172a",
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const imgData = canvas.toDataURL("image/png");

  doc.addPage();
  drawHeader(doc, "Visual Snapshot");

  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - 28;
  const ratio = canvas.height / canvas.width;
  const imgHeight = usableWidth * ratio;

  doc.addImage(imgData, "PNG", 14, 32, usableWidth, imgHeight);
};

export const generateAnalyticsReport = async (
  payload: ExportPayload,
): Promise<void> => {
  const { overview, trends, languages, chartsContainer, filenameHint } =
    payload;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  drawHeader(doc, overview.repoName);
  renderScorecardTable(doc, overview);
  renderSeverityTable(doc, overview);
  renderLanguagesTable(doc, languages);
  renderTrendsTable(doc, trends);

  if (chartsContainer) {
    try {
      await renderChartsSnapshot(doc, chartsContainer);
    } catch (err) {
      // Visual snapshot is non-essential — fail soft and keep tables.
      console.warn("Chart snapshot failed; PDF will omit visuals.", err);
    }
  }

  drawFooter(doc);

  const safeName = (filenameHint ?? overview.repoName)
    .replace(/[^a-z0-9_-]+/gi, "_")
    .toLowerCase();
  const stamp = format(new Date(), "yyyyMMdd_HHmm");
  doc.save(`codepilot_${safeName}_${stamp}.pdf`);
};
