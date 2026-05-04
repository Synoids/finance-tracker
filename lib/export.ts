import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from './types';
import { formatDate, formatCurrency } from './utils';

export const exportTransactionsToPDF = (
  transactions: Transaction[], 
  userEmail: string | undefined,
  periodLabel: string = 'Laporan Transaksi'
) => {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  // Calculate Summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // 1. Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text('FinanceFlow', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Dicetak pada: ${dateStr}`, 14, 28);
  if (userEmail) doc.text(`Pengguna: ${userEmail}`, 14, 33);

  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(14, 38, 196, 38);

  // 2. Summary Section
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(periodLabel, 14, 48);

  // Global Summary Table
  autoTable(doc, {
    startY: 53,
    head: [['Pemasukan', 'Pengeluaran', 'Selisih Bersih']],
    body: [[
      formatCurrency(totalIncome),
      formatCurrency(totalExpense),
      formatCurrency(netBalance)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: 30, halign: 'center', fontSize: 10 },
    columnStyles: {
      0: { halign: 'center', textColor: [34, 197, 94], fontStyle: 'bold' },
      1: { halign: 'center', textColor: [239, 68, 68], fontStyle: 'bold' },
      2: { halign: 'center', fontStyle: 'bold' }
    }
  });

  // 3. Category Summary (New!)
  const catTotals: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const categoryData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => [cat, formatCurrency(amount), ((amount / totalExpense) * 100).toFixed(1) + '%']);

  if (categoryData.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Analisis Visual Pengeluaran', 14, (doc as any).lastAutoTable.finalY + 15);
    
    let chartY = (doc as any).lastAutoTable.finalY + 22;
    const barMaxWidth = 100;
    const barHeight = 6;
    
    // Get the max amount for scaling the bars
    const maxAmount = Math.max(...Object.values(catTotals));

    Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 categories
      .forEach(([cat, amount], index) => {
        const barWidth = (amount / maxAmount) * barMaxWidth;
        const percentage = ((amount / totalExpense) * 100).toFixed(1) + '%';
        
        // Category Label
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`${cat} (${percentage})`, 14, chartY);
        
        // Background Bar
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(14, chartY + 2, barMaxWidth, barHeight, 1, 1, 'F');
        
        // Value Bar (Indigo Color)
        doc.setFillColor(79, 70, 229);
        doc.roundedRect(14, chartY + 2, barWidth, barHeight, 1, 1, 'F');
        
        // Amount Text
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(formatCurrency(amount), 14 + barMaxWidth + 5, chartY + 6);
        
        chartY += 15;
      });

    // Move next table down
    (doc as any).lastAutoTable.finalY = chartY + 5;
  }

  // 4. Detailed Transactions Table
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Detail Transaksi', 14, (doc as any).lastAutoTable.finalY + 10);

  const tableData = transactions.map(t => [
    formatDate(t.date),
    t.category,
    t.description || '-',
    t.type === 'income' ? 'Masuk' : 'Keluar',
    formatCurrency(t.amount)
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['Tanggal', 'Kategori', 'Deskripsi', 'Tipe', 'Jumlah']],
    body: tableData,
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // 4. Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Laporan ini digenerate secara otomatis oleh FinanceFlow AI. Halaman ${i} dari ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`Laporan_Keuangan_${now.getTime()}.pdf`);
};
