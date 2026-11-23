const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * Format phone number with +91 if valid
 */
function formatPhone(raw) {
  if (!raw) return '-';
  const clean = String(raw).trim();
  if (clean === '-' || clean === '') return '-';
  return clean.startsWith('+91') ? clean : `+91 ${clean}`;
}

/**
 * Format ISO date string into DD/MM/YYYY
 */
function formatDate(dStr) {
  if (!dStr) return '-';
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
}

/**
 * Generate Excel (.xlsx) buffer with all 11 columns, auto-fit column widths,
 * Lumos primary teal #31747d, and no dual sticky panes.
 */
async function generateGuestExcel({ records = [], summary = {} }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Lumos Building Automation Pvt. Ltd.';
  workbook.created = new Date();

  // Create worksheet WITHOUT split views to prevent dual scrollable panes
  const worksheet = workbook.addWorksheet('Guest Records', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    views: [{ state: 'normal', activeCell: 'A1', showGridLines: true }]
  });

  const PRIMARY_COLOR_HEX = 'FF31747D'; // Lumos Teal (#31747d)

  // 11 Column definitions (Follow Up removed)
  const columnsDef = [
    { key: 'srNo', header: 'Sr.' },
    { key: 'guestName', header: 'Guest Name' },
    { key: 'company', header: 'Company' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'email', header: 'Email' },
    { key: 'relationship', header: 'Relationship' },
    { key: 'interests', header: 'Interests' },
    { key: 'rating', header: 'Rating' },
    { key: 'staffRating', header: 'Staff' },
    { key: 'addedBy', header: 'Added By' },
    { key: 'dateAdded', header: 'Date Added' }
  ];

  const totalCols = columnsDef.length; // 11 (Columns A to K)
  const lastColLetter = 'K';

  // 1. Company Header (Merged A1:K1)
  worksheet.mergeCells(`A1:${lastColLetter}1`);
  const compCell = worksheet.getCell('A1');
  compCell.value = 'Lumos Building Automation Pvt. Ltd.';
  compCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: PRIMARY_COLOR_HEX } };
  compCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 28;

  // 2. Report Title (Merged A2:K2)
  worksheet.mergeCells(`A2:${lastColLetter}2`);
  const titleCell = worksheet.getCell('A2');
  titleCell.value = 'GUEST RECORDS REPORT';
  titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF4A5568' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 22;

  // Row 3: Blank separator
  worksheet.getRow(3).height = 10;

  // 3. Summary Section (Rows 4, 5, 6)
  const formatSummaryLabel = (cell, text) => {
    cell.value = text;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: PRIMARY_COLOR_HEX } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  };
  const formatSummaryValue = (cell, text) => {
    cell.value = text;
    cell.font = { name: 'Arial', size: 10, bold: false, color: { argb: 'FF1A202C' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  };

  formatSummaryLabel(worksheet.getCell('A4'), 'Total Records:');
  worksheet.mergeCells('B4:D4');
  formatSummaryValue(worksheet.getCell('B4'), `${summary.totalRecords || 0}`);
  worksheet.getRow(4).height = 18;

  formatSummaryLabel(worksheet.getCell('A5'), 'Today Records:');
  worksheet.mergeCells('B5:D5');
  formatSummaryValue(worksheet.getCell('B5'), `${summary.todayRecords || 0}`);
  worksheet.getRow(5).height = 18;

  formatSummaryLabel(worksheet.getCell('A6'), 'Date:');
  worksheet.mergeCells('B6:D6');
  formatSummaryValue(worksheet.getCell('B6'), summary.dateRange || 'All Dates');
  worksheet.getRow(6).height = 18;

  // Row 7: Blank separator
  worksheet.getRow(7).height = 12;

  // 4. Section Heading: Guest Details
  worksheet.mergeCells(`A8:${lastColLetter}8`);
  const sectionCell = worksheet.getCell('A8');
  sectionCell.value = 'Guest Details';
  sectionCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF2D3748' } };
  sectionCell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(8).height = 22;

  // 5. Table Header Row (Row 9)
  const headerRow = worksheet.getRow(9);
  headerRow.values = columnsDef.map((c) => c.header);
  headerRow.height = 25;

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: PRIMARY_COLOR_HEX }
  };
  const headerFont = {
    name: 'Arial',
    size: 10.5,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };
  const borderThin = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  for (let c = 1; c <= totalCols; c++) {
    const cell = headerRow.getCell(c);
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.border = borderThin;
    cell.alignment = {
      vertical: 'middle',
      horizontal: c === 1 || c === 8 || c === 9 || c === 11 ? 'center' : 'left'
    };
  }

  // 6. Data Rows
  let currentRow = 10;
  if (records.length === 0) {
    worksheet.mergeCells(`A10:${lastColLetter}10`);
    const emptyCell = worksheet.getCell('A10');
    emptyCell.value = 'No guest records found for the selected criteria.';
    emptyCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF718096' } };
    emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
    emptyCell.border = borderThin;
    worksheet.getRow(10).height = 24;
    currentRow = 11;
  } else {
    records.forEach((row, index) => {
      const dataRow = worksheet.getRow(currentRow);

      const guestName = row.guest?.name || '-';
      const company = row.guest?.company || '-';
      const mobile = formatPhone(row.guest?.phone);
      const email = row.guest?.email || '-';
      const relationship = row.relationship || 'Visitor';
      const interests = Array.isArray(row.interests) && row.interests.length > 0
        ? row.interests.join(', ')
        : '-';
      const rating = row.feedback?.rating ? `${row.feedback.rating} ★` : 'N/A';
      const staffRating = row.feedback?.staffRating ? `${row.feedback.staffRating} ★` : 'N/A';
      const addedByName = row.createdBy?.name || 'Admin';
      const addedByRole = row.createdBy?.role ? `(${row.createdBy.role})` : '';
      const addedBy = `${addedByName} ${addedByRole}`.trim();
      const dateAdded = formatDate(row.createdAt);

      dataRow.values = [
        index + 1,
        guestName,
        company,
        mobile,
        email,
        relationship,
        interests,
        rating,
        staffRating,
        addedBy,
        dateAdded
      ];
      dataRow.height = 21;

      const isEven = index % 2 === 1;
      const rowFill = isEven ? {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
      } : undefined;

      for (let c = 1; c <= totalCols; c++) {
        const cell = dataRow.getCell(c);
        cell.font = { name: 'Arial', size: 9.5, color: { argb: 'FF2D3748' } };
        cell.border = borderThin;
        if (rowFill) cell.fill = rowFill;
        cell.alignment = {
          vertical: 'middle',
          horizontal: c === 1 || c === 8 || c === 9 || c === 11 ? 'center' : 'left'
        };
      }

      currentRow++;
    });
  }

  // Row separator before footer
  worksheet.getRow(currentRow).height = 14;
  currentRow++;

  // 7. Footer
  worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
  const footerCell = worksheet.getCell(`A${currentRow}`);
  footerCell.value = '© Lumos Building Automation Pvt. Ltd.';
  footerCell.font = { name: 'Arial', size: 9, bold: false, italic: true, color: { argb: 'FF718096' } };
  footerCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(currentRow).height = 20;

  // 8. Auto-fit column widths based on cell contents
  columnsDef.forEach((colDef, idx) => {
    const colNumber = idx + 1;
    const column = worksheet.getColumn(colNumber);

    let maxContentLen = colDef.header.length;
    column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      // Only measure data and table header rows (row 9 and below), ignore merged banners
      if (rowNumber >= 9 && rowNumber < currentRow) {
        const textVal = cell.value ? String(cell.value) : '';
        if (textVal.length > maxContentLen) {
          maxContentLen = textVal.length;
        }
      }
    });

    // Col 1 (Sr.) is always compact
    if (colNumber === 1) {
      column.width = 8;
    } else {
      // Set width with padding, bounded between 12 and 45 to keep comfortable appearance
      column.width = Math.min(Math.max(maxContentLen + 4, 12), 45);
    }
  });

  return await workbook.xlsx.writeBuffer();
}

/**
 * Generate PDF buffer for Guest Records Report
 * Strictly adheres to A4 landscape, Lumos primary teal #31747d, all 11 columns,
 * repeating headers on new pages, and footer on every page.
 */
function generateGuestPDF({ records = [], summary = {} }) {
  return new Promise((resolve, reject) => {
    // A4 Landscape: 841.89 x 595.28 points
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 36,
      bufferPages: true
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const PRIMARY_COLOR = '#31747d';
    const pageWidth = doc.page.width;   // 841.89
    const pageHeight = doc.page.height; // 595.28
    const marginLeft = 36;
    const contentWidth = pageWidth - (marginLeft * 2); // 769.89

    // Proportional column widths for all 11 columns (totaling 769.89)
    const colWidths = [
      { key: 'sr', label: 'Sr.', width: 28, align: 'center' },
      { key: 'name', label: 'Guest Name', width: 105, align: 'left' },
      { key: 'company', label: 'Company', width: 76, align: 'left' },
      { key: 'mobile', label: 'Mobile', width: 72, align: 'left' },
      { key: 'email', label: 'Email', width: 105, align: 'left' },
      { key: 'relationship', label: 'Relationship', width: 70, align: 'left' },
      { key: 'interests', label: 'Interests', width: 98, align: 'left' },
      { key: 'rating', label: 'Rating', width: 35, align: 'center' },
      { key: 'staffRating', label: 'Staff', width: 35, align: 'center' },
      { key: 'addedBy', label: 'Added By', width: 78, align: 'left' },
      { key: 'dateAdded', label: 'Date Added', width: 67.89, align: 'center' }
    ];

    const tableHeaderHeight = 22;
    const rowHeight = 20;
    const bottomSafeMargin = 45;

    // Helper: Draw Company Header & Report Title
    const drawReportHeader = () => {
      // Company Name
      doc.font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(PRIMARY_COLOR)
        .text('Lumos Building Automation Pvt. Ltd.', marginLeft, 30, {
          width: contentWidth,
          align: 'center'
        });

      // Report Title
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#4A5568')
        .text('GUEST RECORDS REPORT', marginLeft, 52, {
          width: contentWidth,
          align: 'center'
        });
    };

    // Helper: Draw Summary Section
    const drawSummarySection = () => {
      const summaryTop = 76;
      doc.rect(marginLeft, summaryTop, contentWidth, 48)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      // Accent left border in primary teal
      doc.rect(marginLeft, summaryTop, 4, 48)
        .fill(PRIMARY_COLOR);

      doc.fontSize(9).fillColor('#4A5568');

      // Col 1: Total Records
      doc.font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('Total Records:', marginLeft + 16, summaryTop + 10);
      doc.font('Helvetica').fillColor('#1A202C').text(`${summary.totalRecords || 0}`, marginLeft + 95, summaryTop + 10);

      // Col 2: Today Records
      doc.font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('Today Records:', marginLeft + 230, summaryTop + 10);
      doc.font('Helvetica').fillColor('#1A202C').text(`${summary.todayRecords || 0}`, marginLeft + 315, summaryTop + 10);

      // Col 3: Date Range
      doc.font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('Date:', marginLeft + 16, summaryTop + 28);
      doc.font('Helvetica').fillColor('#1A202C').text(summary.dateRange || 'All Dates', marginLeft + 95, summaryTop + 28);

      // Section Heading: Guest Details
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#2D3748')
        .text('Guest Details', marginLeft, 134);
    };

    // Helper: Draw Table Header Row
    const drawTableHeader = (y) => {
      doc.rect(marginLeft, y, contentWidth, tableHeaderHeight)
        .fill(PRIMARY_COLOR);

      doc.font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#FFFFFF');

      let currentX = marginLeft;
      colWidths.forEach((col) => {
        const textX = col.align === 'center' ? currentX : currentX + 4;
        const textWidth = col.align === 'center' ? col.width : col.width - 6;
        doc.text(col.label, textX, y + 6, {
          width: textWidth,
          align: col.align,
          lineBreak: false
        });
        currentX += col.width;
      });
    };

    // 1. Initial Page Render
    drawReportHeader();
    drawSummarySection();

    let currentY = 150;
    drawTableHeader(currentY);
    currentY += tableHeaderHeight;

    // 2. Render Data Rows
    if (records.length === 0) {
      doc.rect(marginLeft, currentY, contentWidth, 24).fillAndStroke('#FFFFFF', '#E2E8F0');
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#718096')
        .text('No guest records found for the selected criteria.', marginLeft, currentY + 7, {
          width: contentWidth,
          align: 'center'
        });
      currentY += 24;
    } else {
      records.forEach((row, index) => {
        // Page overflow check
        if (currentY + rowHeight > pageHeight - bottomSafeMargin) {
          doc.addPage();
          drawReportHeader();
          currentY = 82;
          drawTableHeader(currentY);
          currentY += tableHeaderHeight;
        }

        const isEven = index % 2 === 1;
        const bgFill = isEven ? '#F8FAFC' : '#FFFFFF';

        doc.rect(marginLeft, currentY, contentWidth, rowHeight).fillAndStroke(bgFill, '#E2E8F0');

        doc.font('Helvetica').fontSize(8).fillColor('#2D3748');

        const rowValues = [
          `${index + 1}`,
          row.guest?.name || '-',
          row.guest?.company || '-',
          formatPhone(row.guest?.phone),
          row.guest?.email || '-',
          row.relationship || 'Visitor',
          Array.isArray(row.interests) && row.interests.length > 0 ? row.interests.join(', ') : '-',
          row.feedback?.rating ? `${row.feedback.rating} ★` : 'N/A',
          row.feedback?.staffRating ? `${row.feedback.staffRating} ★` : 'N/A',
          row.createdBy?.name || 'Admin',
          formatDate(row.createdAt)
        ];

        let currentX = marginLeft;
        colWidths.forEach((col, cIdx) => {
          const val = rowValues[cIdx];
          const textX = col.align === 'center' ? currentX : currentX + 4;
          const textWidth = col.align === 'center' ? col.width : col.width - 6;

          doc.text(val, textX, currentY + 5.5, {
            width: textWidth,
            align: col.align,
            lineBreak: false,
            ellipsis: true
          });
          currentX += col.width;
        });

        currentY += rowHeight;
      });
    }

    // 3. Add Centered Footer & Page Numbering on Every Page
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const footerY = pageHeight - 28;

      // Thin separator line
      doc.moveTo(marginLeft, footerY - 5)
        .lineTo(marginLeft + contentWidth, footerY - 5)
        .strokeColor('#E2E8F0')
        .lineWidth(0.5)
        .stroke();

      // Centered Copyright
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#718096')
        .text('© Lumos Building Automation Pvt. Ltd.', marginLeft, footerY, {
          width: contentWidth,
          align: 'center'
        });

      // Page Number (Right-aligned)
      doc.font('Helvetica')
        .fontSize(7.5)
        .fillColor('#A0AEC0')
        .text(`Page ${i + 1} of ${range.count}`, marginLeft, footerY, {
          width: contentWidth,
          align: 'right'
        });
    }

    doc.end();
  });
}

module.exports = {
  generateGuestExcel,
  generateGuestPDF
};
