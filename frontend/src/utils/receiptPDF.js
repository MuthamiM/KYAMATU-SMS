import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Receipt-style PDF generator for Kyamatu School documents
 * Clean, minimal layout inspired by Receiptify aesthetic
 */

const RECEIPT_WIDTH = 80; // characters per line
const FONT = 'Courier';

/** Center text within the receipt width */
const center = (text, width = RECEIPT_WIDTH) => {
    const pad = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(pad) + text;
};

/** Create a divider line */
const divider = (char = '-', width = RECEIPT_WIDTH) => char.repeat(width);

/** Format a key-value row */
const kvRow = (key, value, width = RECEIPT_WIDTH) => {
    const gap = Math.max(1, width - key.length - String(value).length);
    return key + '.'.repeat(gap) + value;
};

/** Create a new receipt-style PDF document */
const createReceiptPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 297] }); // receipt-width page
    doc.setFont(FONT, 'normal');
    return doc;
};

/** Standard school header block */
const addHeader = (doc, y, title) => {
    doc.setFontSize(9);
    doc.setFont(FONT, 'bold');
    doc.text('KYAMATU PRIMARY SCHOOL', 40, y, { align: 'center' });
    y += 4;
    doc.setFontSize(6);
    doc.setFont(FONT, 'normal');
    doc.text('P.O. Box 123, Kitui County', 40, y, { align: 'center' });
    y += 3;
    doc.text('Tel: +254 700 000 000', 40, y, { align: 'center' });
    y += 4;
    doc.setFontSize(5);
    doc.text('________________________________', 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.setFont(FONT, 'bold');
    doc.text(title.toUpperCase(), 40, y, { align: 'center' });
    y += 3;
    doc.setFontSize(5);
    doc.text('________________________________', 40, y, { align: 'center' });
    y += 5;
    return y;
};

/** Add a key-value pair line */
const addLine = (doc, y, label, value, fontSize = 6) => {
    doc.setFontSize(fontSize);
    doc.setFont(FONT, 'normal');
    doc.text(label, 5, y);
    doc.setFont(FONT, 'bold');
    doc.text(String(value), 75, y, { align: 'right' });
    return y + 4;
};

/** Add a centered text line */
const addCentered = (doc, y, text, fontSize = 6, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont(FONT, bold ? 'bold' : 'normal');
    doc.text(text, 40, y, { align: 'center' });
    return y + Math.max(3.5, fontSize * 0.5);
};

/** Add a thin divider */
const addDivider = (doc, y, style = 'dashed') => {
    doc.setFontSize(5);
    doc.setFont(FONT, 'normal');
    const line = style === 'double' ? '================================' : '--------------------------------';
    doc.text(line, 40, y, { align: 'center' });
    return y + 4;
};

/** Add footer with date and document ID */
const addFooter = (doc, y, docId) => {
    y += 3;
    y = addDivider(doc, y);
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(5);
    doc.setFont(FONT, 'normal');
    doc.text(`Date: ${date}  Time: ${time}`, 40, y, { align: 'center' });
    y += 3;
    if (docId) {
        doc.text(`Doc ID: ${docId}`, 40, y, { align: 'center' });
        y += 3;
    }
    doc.text('Kyamatu School Management System', 40, y, { align: 'center' });
    y += 4;
    doc.text('*** THANK YOU ***', 40, y, { align: 'center' });
    return y + 3;
};

/** Check if we need a new page, add one if needed */
const checkPage = (doc, y, needed = 20) => {
    if (y + needed > 285) {
        doc.addPage([80, 297]);
        return 10;
    }
    return y;
};

export {
    createReceiptPDF,
    addHeader,
    addLine,
    addCentered,
    addDivider,
    addFooter,
    checkPage,
};
