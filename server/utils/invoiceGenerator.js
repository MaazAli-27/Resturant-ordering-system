const PDFDocument = require('pdfkit');
 
const generateInvoice = (order, res) => {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true,
  });
 
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id.toString().slice(-6).toUpperCase()}.pdf`);
  doc.pipe(res);
 
  const pageWidth = doc.page.width - 80;
  const left = 40;
 
  // Format date and time
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = orderDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
 
  // ── HEADER ──────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 100).fill('#1a1a2e');
 
  // Brand name — no emoji
  doc.fillColor('#f4c542')
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('Savoria', left, 28);
 
  doc.fillColor('#aaaaaa')
    .fontSize(10)
    .font('Helvetica')
    .text('Restaurant & Dining', left, 58);
 
  // Invoice label on right
  doc.fillColor('#ffffff')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('INVOICE', 420, 28);
 
  doc.fillColor('#f4c542')
    .fontSize(10)
    .font('Helvetica')
    .text(`#${order._id.toString().slice(-6).toUpperCase()}`, 420, 54);
 
  doc.fillColor('#aaaaaa')
    .fontSize(9)
    .text(`${formattedDate}  |  ${formattedTime}`, 420, 70);
 
  // ── INFO BOX ─────────────────────────────────────────────
  let y = 115;
 
  doc.rect(left, y, pageWidth, 72).fill('#f5f5f5');
 
  // Customer info
  doc.fillColor('#888888').fontSize(8).font('Helvetica').text('CUSTOMER', left + 10, y + 10);
  doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold').text(order.customerName, left + 10, y + 22);
  doc.fillColor('#555555').fontSize(9).font('Helvetica').text(order.customerPhone, left + 10, y + 38);
  if (order.customerEmail) {
    doc.text(order.customerEmail, left + 10, y + 52);
  }
 
  // Status
  doc.fillColor('#888888').fontSize(8).font('Helvetica').text('STATUS', 320, y + 10);
  doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold').text(order.status.toUpperCase(), 320, y + 22);
 
  // Payment
  doc.fillColor('#888888').fontSize(8).font('Helvetica').text('PAYMENT', 430, y + 10);
  doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold').text(order.paymentStatus?.toUpperCase() || 'PAID', 430, y + 22);
 
  // Table number if exists
  if (order.tableNumber) {
    doc.fillColor('#888888').fontSize(8).font('Helvetica').text('TABLE', 320, y + 44);
    doc.fillColor('#1a1a2e').fontSize(10).font('Helvetica-Bold').text(order.tableNumber, 320, y + 56);
  }
 
  // ── ITEMS TABLE HEADER ───────────────────────────────────
  y += 86;
 
  doc.rect(left, y, pageWidth, 26).fill('#1a1a2e');
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
  doc.text('ITEM', left + 8, y + 9, { lineBreak: false });
  doc.text('QTY', left + 310, y + 9, { lineBreak: false });
  doc.text('UNIT PRICE', left + 355, y + 9, { lineBreak: false });
  doc.text('TOTAL', left + 440, y + 9, { lineBreak: false });
 
  y += 26;
 
  // ── ITEMS ROWS ───────────────────────────────────────────
  order.items.forEach((item, i) => {
    const rowH = 22;
    const bg = i % 2 === 0 ? '#ffffff' : '#f7f7f7';
 
    doc.rect(left, y, pageWidth, rowH).fill(bg);
 
    // Left border accent on even rows
    if (i % 2 !== 0) {
      doc.rect(left, y, 3, rowH).fill('#e8e8e8');
    }
 
    const name = item.name.length > 40 ? item.name.substring(0, 40) + '...' : item.name;
 
    doc.fillColor('#1a1a2e').fontSize(9).font('Helvetica');
    doc.text(name, left + 8, y + 7, { lineBreak: false });
    doc.text(String(item.quantity), left + 318, y + 7, { lineBreak: false });
    doc.text(`$${item.price.toFixed(2)}`, left + 355, y + 7, { lineBreak: false });
    doc.fillColor('#1a1a2e').font('Helvetica-Bold');
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, left + 440, y + 7, { lineBreak: false });
 
    y += rowH;
  });
 
  // ── DIVIDER ──────────────────────────────────────────────
  y += 14;
  doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
  y += 14;
 
  // ── TOTALS ───────────────────────────────────────────────
  const subtotal = order.totalAmount;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
 
  // Subtotal
  doc.fillColor('#666666').fontSize(10).font('Helvetica');
  doc.text('Subtotal:', left + 360, y, { lineBreak: false });
  doc.fillColor('#1a1a2e').font('Helvetica');
  doc.text(`$${subtotal.toFixed(2)}`, left + 440, y, { lineBreak: false });
  y += 20;
 
  // Tax
  doc.fillColor('#666666').fontSize(10).font('Helvetica');
  doc.text('Tax (8%):', left + 360, y, { lineBreak: false });
  doc.fillColor('#555555').font('Helvetica');
  doc.text(`$${tax.toFixed(2)}`, left + 440, y, { lineBreak: false });
  y += 20;
 
  // Total box
  doc.rect(left + 335, y, pageWidth - 335, 32).fill('#1a1a2e');
  doc.fillColor('#f4c542').fontSize(12).font('Helvetica-Bold');
  doc.text('TOTAL', left + 348, y + 10, { lineBreak: false });
  doc.text(`$${total.toFixed(2)}`, left + 435, y + 10, { lineBreak: false });
  y += 46;
 
  // ── FOOTER ───────────────────────────────────────────────
  doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor('#eeeeee').lineWidth(0.5).stroke();
  y += 12;
 
  doc.fillColor('#aaaaaa').fontSize(8).font('Helvetica');
  doc.text('Thank you for dining at Savoria! We hope to see you again soon.', left, y, { align: 'center', width: pageWidth });
  y += 14;
  doc.text(`For questions, contact us at info@savoria.com`, left, y, { align: 'center', width: pageWidth });
  y += 14;
  doc.text(`Invoice generated on ${formattedDate} at ${formattedTime}`, left, y, { align: 'center', width: pageWidth });
 
  doc.end();
};
 
module.exports = { generateInvoice };