import { jsPDF } from 'jspdf';
import { AuditResult, Recommendation } from '@/lib/audit/types';

export async function generateAuditPDF(result: AuditResult, summary: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (needed: number) => {
    if (yPosition + needed > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Set default font
  doc.setFont('helvetica', 'normal');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('AI Spend Audit Report', margin, yPosition);
  yPosition += 15;

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Audit ID: ${result.id}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Generated: ${new Date(result.timestamp).toLocaleString()}`, margin, yPosition);
  yPosition += 12;

  // Quick Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Quick Summary', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const totalSavings = result.recommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0);
  const savingsPercentage =
    result.input.totalMonthlySpend > 0
      ? Math.round((totalSavings / result.input.totalMonthlySpend) * 100)
      : 0;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(76, 175, 80); // Green color for savings
  doc.text(`Total Monthly Savings: $${totalSavings}`, margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Savings Percentage: ${savingsPercentage}%`, margin, yPosition);
  yPosition += 8;
  doc.text(`Audit Input: ${result.input.totalMonthlySpend} tools, $${result.input.totalMonthlySpend}/mo spend`, margin, yPosition);
  yPosition += 12;

  // AI Summary Section
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(summary || 'Summary unavailable', maxWidth);
  summaryLines.forEach((line: string) => {
    checkPageBreak(6);
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 6;

  // Recommendations Section
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Recommendations (${result.recommendations.length})`, margin, yPosition);
  yPosition += 8;

  result.recommendations.forEach((rec: Recommendation, idx: number) => {
    checkPageBreak(25);

    // Recommendation header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(33, 150, 243); // Blue color
    doc.text(`${idx + 1}. ${rec.toolName} — ${rec.type}`, margin, yPosition);
    yPosition += 6;

    // Reason
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const reasonLines = doc.splitTextToSize(`Reason: ${rec.reason}`, maxWidth);
    reasonLines.forEach((line: string) => {
      doc.text(line, margin + 2, yPosition);
      yPosition += 5;
    });

    // Savings and confidence
    yPosition += 2;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(76, 175, 80);
    doc.text(`Savings: $${rec.estimatedSavings}/mo`, margin + 2, yPosition);
    yPosition += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Confidence: ${rec.confidence}`, margin + 2, yPosition);
    yPosition += 5;

    // Alternative if exists
    if (rec.alternative) {
      const altLines = doc.splitTextToSize(`Alternative: ${rec.alternative}`, maxWidth - 2);
      altLines.forEach((line: string) => {
        doc.text(line, margin + 2, yPosition);
        yPosition += 5;
      });
    }

    yPosition += 3;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

export async function downloadAuditPDF(result: AuditResult, summary: string) {
  try {
    const doc = await generateAuditPDF(result, summary);
    const fileName = `audit-report-${result.id}-${new Date(result.timestamp).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}
