import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import type { CanonicalCertificate, CertificateTheme } from "./certificate-types";
import { CERTIFICATE_CONSTANTS } from "./certificate-types";

export interface GeneratePdfOptions {
  theme?: CertificateTheme;
}

/**
 * Generates an authoritative, print-ready PDF certificate in A4 Landscape.
 * Compatible with all standard PDF readers (Adobe Acrobat, Preview, Chrome, Edge, etc.).
 *
 * A4 dimensions in points:
 * Width:  841.89 pt (297 mm)
 * Height: 595.28 pt (210 mm)
 */
export async function generateCertificatePdf(
  cert: CanonicalCertificate,
  options: GeneratePdfOptions = {},
): Promise<Uint8Array> {
  const theme = options.theme || "cosmic_dark";
  const isDark = theme === "cosmic_dark";

  const pdfDoc = await PDFDocument.create();

  // Set standard PDF metadata
  pdfDoc.setTitle(`Certificate of Achievement - ${cert.certificateName}`);
  pdfDoc.setAuthor("Our Visible Universe Academy");
  pdfDoc.setSubject(`Cosmic Journey Certification - ${cert.achievementTitle}`);
  pdfDoc.setKeywords([
    "Astronomy",
    "Certificate",
    "Cosmic Journey",
    "Our Visible Universe",
    cert.certificateNumber,
  ]);
  pdfDoc.setProducer("Our Visible Universe PDF Certificate Engine");
  pdfDoc.setCreationDate(new Date(cert.issueDate));

  // A4 Landscape dimensions
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Embed standard fonts
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Generate QR Code as PNG data URL and embed
  const qrDataUrl = await QRCode.toDataURL(cert.verificationUrl, {
    margin: 1,
    errorCorrectionLevel: "M",
    width: 256,
    color: {
      dark: isDark ? "#ffffff" : "#0f172a",
      light: isDark ? "#0f172a" : "#ffffff",
    },
  });
  const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  // Palette definitions
  const darkBg = rgb(0.015, 0.035, 0.08); // Deep interstellar navy
  const darkBgCard = rgb(0.035, 0.065, 0.14);
  const lightBg = rgb(0.985, 0.98, 0.96); // Fine parchment
  const lightBgCard = rgb(0.95, 0.94, 0.91);

  const goldPrimary = rgb(0.85, 0.65, 0.15); // Celestial warm gold
  const goldLight = rgb(0.96, 0.82, 0.35);
  const goldMuted = rgb(0.55, 0.45, 0.18);
  const cyanAccent = rgb(0.2, 0.75, 0.9);

  const textPrimary = isDark ? rgb(0.98, 0.98, 1.0) : rgb(0.06, 0.09, 0.16);
  const textSecondary = isDark ? rgb(0.72, 0.78, 0.88) : rgb(0.25, 0.3, 0.4);
  const textMuted = isDark ? rgb(0.48, 0.54, 0.66) : rgb(0.45, 0.5, 0.58);

  // 1. Draw Page Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: isDark ? darkBg : lightBg,
  });

  // 2. Cosmic Background Graphics (Dark theme: subtle stars & celestial lines)
  if (isDark) {
    // Inner certificate card background
    page.drawRectangle({
      x: 20,
      y: 20,
      width: pageWidth - 40,
      height: pageHeight - 40,
      color: darkBgCard,
    });

    // Decorative celestial coordinates grid / watermark lines
    const gridYPositions = [120, 240, 360, 480];
    gridYPositions.forEach((gy) => {
      page.drawLine({
        start: { x: 40, y: gy },
        end: { x: pageWidth - 40, y: gy },
        color: rgb(0.08, 0.14, 0.26),
        thickness: 0.5,
      });
    });

    const gridXPositions = [180, 340, 500, 660];
    gridXPositions.forEach((gx) => {
      page.drawLine({
        start: { x: gx, y: 40 },
        end: { x: gx, y: pageHeight - 40 },
        color: rgb(0.08, 0.14, 0.26),
        thickness: 0.5,
      });
    });

    // Subtle background star points
    const starCoords = [
      [75, 520],
      [140, 480],
      [210, 540],
      [300, 500],
      [600, 510],
      [720, 530],
      [780, 470],
      [80, 160],
      [160, 110],
      [220, 180],
      [680, 140],
      [740, 170],
      [800, 110],
      [110, 320],
      [750, 330],
    ];
    starCoords.forEach(([sx, sy]) => {
      page.drawCircle({
        x: sx,
        y: sy,
        size: 1.2,
        color: rgb(0.6, 0.8, 1.0),
      });
    });
  } else {
    // Light print mode: subtle inner border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: pageWidth - 40,
      height: pageHeight - 40,
      color: lightBgCard,
    });
  }

  // 3. Elegant Double Border Framing with Corner Notches
  const outerMargin = 28;
  const innerMargin = 34;

  // Outer gold border
  page.drawRectangle({
    x: outerMargin,
    y: outerMargin,
    width: pageWidth - outerMargin * 2,
    height: pageHeight - outerMargin * 2,
    borderColor: goldPrimary,
    borderWidth: 2,
  });

  // Inner hairline border
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: pageWidth - innerMargin * 2,
    height: pageHeight - innerMargin * 2,
    borderColor: isDark ? goldMuted : goldPrimary,
    borderWidth: 0.75,
  });

  // Corner celestial accents (triangles / corner brackets)
  const cornerSize = 14;
  const corners = [
    { x: outerMargin, y: pageHeight - outerMargin, dx: 1, dy: -1 },
    { x: pageWidth - outerMargin, y: pageHeight - outerMargin, dx: -1, dy: -1 },
    { x: outerMargin, y: outerMargin, dx: 1, dy: 1 },
    { x: pageWidth - outerMargin, y: outerMargin, dx: -1, dy: 1 },
  ];
  corners.forEach(({ x, y, dx, dy }) => {
    page.drawLine({
      start: { x, y: y + dy * cornerSize },
      end: { x: x + dx * cornerSize, y },
      color: goldPrimary,
      thickness: 1.5,
    });
  });

  // 4. Header Section: Brand & Seal
  const headerY = pageHeight - 75;

  // Organization Title
  const brandText = "OUR VISIBLE UNIVERSE ACADEMY";
  const brandWidth = helveticaBold.widthOfTextAtSize(brandText, 12);
  page.drawText(brandText, {
    x: (pageWidth - brandWidth) / 2,
    y: headerY,
    size: 12,
    font: helveticaBold,
    color: goldPrimary,
  });

  // Top sub-header emblem line
  page.drawLine({
    start: { x: 180, y: headerY - 10 },
    end: { x: pageWidth / 2 - 15, y: headerY - 10 },
    color: goldMuted,
    thickness: 0.75,
  });

  page.drawLine({
    start: { x: pageWidth / 2 + 15, y: headerY - 10 },
    end: { x: pageWidth - 180, y: headerY - 10 },
    color: goldMuted,
    thickness: 0.75,
  });

  // Center vector celestial star emblem
  const starCenterX = pageWidth / 2;
  const starCenterY = headerY - 10;
  // Vertical ray
  page.drawLine({
    start: { x: starCenterX, y: starCenterY - 6 },
    end: { x: starCenterX, y: starCenterY + 6 },
    color: goldLight,
    thickness: 1.25,
  });
  // Horizontal ray
  page.drawLine({
    start: { x: starCenterX - 6, y: starCenterY },
    end: { x: starCenterX + 6, y: starCenterY },
    color: goldLight,
    thickness: 1.25,
  });
  // Center small core dot
  page.drawCircle({
    x: starCenterX,
    y: starCenterY,
    size: 1.5,
    color: goldLight,
  });

  // 5. Certificate Category & Title
  const titleY = headerY - 45;
  const certTitle = "CERTIFICATE OF ACHIEVEMENT";
  const titleWidth = timesBold.widthOfTextAtSize(certTitle, 26);
  page.drawText(certTitle, {
    x: (pageWidth - titleWidth) / 2,
    y: titleY,
    size: 26,
    font: timesBold,
    color: textPrimary,
  });

  // Presentation line
  const presentedText = "THIS IS PROUDLY PRESENTED TO";
  const presentedWidth = helvetica.widthOfTextAtSize(presentedText, 10);
  page.drawText(presentedText, {
    x: (pageWidth - presentedWidth) / 2,
    y: titleY - 26,
    size: 10,
    font: helvetica,
    color: textMuted,
  });

  // 6. Recipient Display Name
  const nameY = titleY - 70;
  const recipientName = cert.certificateName || cert.displayName || "Cosmic Explorer";
  const nameSize = recipientName.length > 25 ? 26 : 32;
  const nameWidth = timesBold.widthOfTextAtSize(recipientName, nameSize);
  page.drawText(recipientName, {
    x: (pageWidth - nameWidth) / 2,
    y: nameY,
    size: nameSize,
    font: timesBold,
    color: isDark ? goldLight : rgb(0.7, 0.5, 0.05),
  });

  // Underline beneath recipient name
  const nameLineHalfWidth = Math.max(nameWidth / 2 + 30, 160);
  page.drawLine({
    start: { x: pageWidth / 2 - nameLineHalfWidth, y: nameY - 8 },
    end: { x: pageWidth / 2 + nameLineHalfWidth, y: nameY - 8 },
    color: goldPrimary,
    thickness: 1.25,
  });

  // Achievement Badge Pill
  const achieveText = "CERTIFIED COSMIC EXPLORER";
  const achieveWidth = helveticaBold.widthOfTextAtSize(achieveText, 11);
  page.drawText(achieveText, {
    x: (pageWidth - achieveWidth) / 2,
    y: nameY - 30,
    size: 11,
    font: helveticaBold,
    color: cyanAccent,
  });

  // 7. Official Certification Text
  const bodyY = nameY - 60;
  const bodyLine1 =
    "This certificate recognizes the successful completion of Cosmic Journey and achievement";
  const bodyLine2 =
    "of the required standard in its astronomy learning program and final assessment.";
  const b1Width = timesRoman.widthOfTextAtSize(bodyLine1, 12);
  const b2Width = timesRoman.widthOfTextAtSize(bodyLine2, 12);

  page.drawText(bodyLine1, {
    x: (pageWidth - b1Width) / 2,
    y: bodyY,
    size: 12,
    font: timesRoman,
    color: textSecondary,
  });
  page.drawText(bodyLine2, {
    x: (pageWidth - b2Width) / 2,
    y: bodyY - 18,
    size: 12,
    font: timesRoman,
    color: textSecondary,
  });

  // 8. Bottom Information Columns & Verification Footer
  const footerBaseY = 70;

  // Dividing rule above metadata footer
  page.drawLine({
    start: { x: 55, y: footerBaseY + 115 },
    end: { x: pageWidth - 55, y: footerBaseY + 115 },
    color: isDark ? rgb(0.15, 0.22, 0.36) : rgb(0.8, 0.8, 0.85),
    thickness: 0.75,
  });

  // COLUMN 1: Academic Record & Evaluation
  const col1X = 60;
  page.drawText("PROGRAM RECORD", {
    x: col1X,
    y: footerBaseY + 95,
    size: 8.5,
    font: helveticaBold,
    color: goldPrimary,
  });

  const recordLines = [
    { label: "Curriculum:", val: `${cert.courseTitle} (24 Modules / 6 Stages)` },
    { label: "Level Achieved:", val: cert.learningLevelLabel },
    {
      label: "Assessment Score:",
      val: `${cert.finalScorePercentage.toFixed(1)}% (Passing Standard: >= 80.0%)`,
    },
    { label: "Course Version:", val: `v${cert.courseVersion}` },
    { label: "Date of Issuance:", val: cert.issueDateFormatted },
  ];

  recordLines.forEach((item, idx) => {
    const itemY = footerBaseY + 76 - idx * 14;
    page.drawText(item.label, {
      x: col1X,
      y: itemY,
      size: 8,
      font: helveticaBold,
      color: textMuted,
    });
    page.drawText(item.val, {
      x: col1X + 90,
      y: itemY,
      size: 8,
      font: helvetica,
      color: textPrimary,
    });
  });

  // COLUMN 2: Verification Center & Seal
  const col2X = 350;
  page.drawText("AUTHORITATIVE VERIFICATION", {
    x: col2X,
    y: footerBaseY + 95,
    size: 8.5,
    font: helveticaBold,
    color: goldPrimary,
  });

  page.drawText("Unique Certificate ID:", {
    x: col2X,
    y: footerBaseY + 76,
    size: 8,
    font: helveticaBold,
    color: textMuted,
  });
  page.drawText(cert.certificateNumber, {
    x: col2X,
    y: footerBaseY + 62,
    size: 9.5,
    font: courier,
    color: isDark ? goldLight : rgb(0.5, 0.35, 0.05),
  });

  page.drawText("Student Identifier:", {
    x: col2X,
    y: footerBaseY + 46,
    size: 8,
    font: helveticaBold,
    color: textMuted,
  });
  page.drawText(cert.studentPublicId, {
    x: col2X + 95,
    y: footerBaseY + 46,
    size: 8,
    font: courier,
    color: textPrimary,
  });

  page.drawText("Cryptographic Hash:", {
    x: col2X,
    y: footerBaseY + 30,
    size: 8,
    font: helveticaBold,
    color: textMuted,
  });
  const truncatedHash = cert.verificationHash.slice(0, 24) + "...";
  page.drawText(truncatedHash, {
    x: col2X,
    y: footerBaseY + 18,
    size: 7,
    font: courier,
    color: textMuted,
  });

  // COLUMN 3: QR Code & Verification Scan
  const qrSize = 75;
  const qrX = pageWidth - outerMargin - qrSize - 35;
  const qrY = footerBaseY + 22;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // QR Code border
  page.drawRectangle({
    x: qrX - 2,
    y: qrY - 2,
    width: qrSize + 4,
    height: qrSize + 4,
    borderColor: goldPrimary,
    borderWidth: 0.75,
  });

  const scanText = "SCAN TO VERIFY";
  const scanWidth = helveticaBold.widthOfTextAtSize(scanText, 7.5);
  page.drawText(scanText, {
    x: qrX + (qrSize - scanWidth) / 2,
    y: qrY + qrSize + 6,
    size: 7.5,
    font: helveticaBold,
    color: goldPrimary,
  });

  const urlText = "ourvisibleuniverse.in/verify";
  const urlWidth = helvetica.widthOfTextAtSize(urlText, 7);
  page.drawText(urlText, {
    x: qrX + (qrSize - urlWidth) / 2,
    y: qrY - 12,
    size: 7,
    font: helvetica,
    color: textMuted,
  });

  // 9. Mandatory Non-Accreditation & Educational Disclaimer (Bottom Margin)
  const disclaimerText = CERTIFICATE_CONSTANTS.DISCLAIMER;
  const discWidth = helvetica.widthOfTextAtSize(disclaimerText, 6.5);
  page.drawText(disclaimerText, {
    x: (pageWidth - discWidth) / 2,
    y: 16,
    size: 6.5,
    font: helvetica,
    color: textMuted,
  });

  // Serialize and return binary PDF bytes
  return await pdfDoc.save();
}
