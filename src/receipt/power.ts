import { NextFunction, Request, Response } from "express";
import PDFDocument, { lineJoin, options } from "pdfkit";
import path from "path";
import QRCode from "qrcode";
const data = {
  token: { value: "1234 4546 0878 3345 5567", name: "Token" },
  transactionReference: {
    value: "166857598842",
    name: "Transaction Reference",
  },
  numberOfUnits: { value: 11.3, name: "Number of Units" },
  dateOfIssue: { value: "2022-11-16 06:19:52", name: "Date of Issue" },
  meterNumber: { value: "45701585817", name: "Meter Number" },
  meterName: { value: "Ochai Samuel", name: "Meter Name" },
  address: {
    value: "B30, Kafe Garden Estate, Und St. Gwarinpa 2",
    name: "Address",
  },
  paymentType: { value: "WALLET", name: "Payment Type" },
  receiptNumber: { value: "PBOFOOHZQPMJIIESJ", name: "Receipt Number" },
  totalAmount: { value: 900.0, name: "Total Amount", currency: "\u20A6" },
  serviceCharge: { value: 100.0, name: "Service Charge", currency: "\u20A6" },
  vat: { value: 47.0, name: "VAT", currency: "\u20A6" },
  debt: { value: 0.0, name: "Debt", currency: "\u20A6" },
};
const powerReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doc = new PDFDocument({
      info: {
        Title: "Power Receipt",
        Author: "Telah",
        Subject: "Power Receipt",
        Creator: "Power Receipt",
        Producer: "Power Receipt",
        CreationDate: new Date(),
        ModDate: new Date(),
      },
      displayTitle: true,

      bufferPages: true,
      permissions: {
        modifying: false,
        copying: false,
      },
    });
    let boldFont: string = "Times-Bold";
    let regularFont: string = "Times";
    let italicFont: string = "Times-Bold";
    const footerText: string =
      "This is an electronic receipt of a transaction and does not require any signature. The. authenticity of transaction can be confirmed with TELAH. For any other assistance, Kindly reach a support personnel on 0912361148 or email support@telah.ng";

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        "Content-Length": pdfData.length,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=Receipt-${data.transactionReference.value}.pdf`,
      });
      res.end(pdfData);
    });
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const pageMarginTop = doc.page.margins.top;
    const pageMarginLeft = doc.page.margins.left;
    const pageMarginRight = doc.page.margins.right;
    const pageMarginBottom = doc.page.margins.bottom;
    const pageMarginX = doc.page.margins.left + doc.page.margins.right;
    const codeText = `https://telah.ng/receipt/power/${data.transactionReference}`;
    const barcode = await QRCode.toDataURL(codeText);
    console.log(codeText);
    const logoWidth = 150;
    const logoHeight = 80;
    const fontSize = 12;
    const fontPath = path.join("build", "fonts", "Rubik", "static");

    const Font = {
      Regular: "Regular",
      Bold: "Bold",
      Italic: "Italic",
      BoldItalic: "BoldItalic",
    };

    doc.registerFont("Regular", path.join(fontPath, "Rubik-Regular.ttf"));
    doc.registerFont("Bold", path.join(fontPath, "Rubik-Bold.ttf"));
    doc.registerFont("Italic", path.join(fontPath, "Rubik-Italic.ttf"));
    doc.registerFont("BoldItalic", path.join(fontPath, "Rubik-BoldItalic.ttf"));

    doc
      .image(
        "build/imgs/logo.png",
        (pageWidth - logoWidth) / 2,
        pageMarginTop - 50,
        {
          width: logoWidth,
          height: logoHeight,
        }
      )
      .moveDown(3)
      .font(Font.Regular)

      .fontSize(18)
      .text("Transaction Receipt".toUpperCase(), {
        align: "center",
        baseline: "middle",
      })
      .fontSize(fontSize)
      .moveDown(0.9)
      .roundedRect((pageWidth - 300) / 2, doc.y, 300, 50, 5)
      .stroke()
      .rect((pageWidth - 50) / 2, doc.y - 10, 50, 20)
      .fillAndStroke("white", "white")
      .fillAndStroke("black", "black")
      .text("Token".toUpperCase(), { align: "center", baseline: "middle" })
      .moveDown(1)
      .fontSize(18)
      .fill("#263564")
      .text(data.token.value, {
        align: "center",
        baseline: "middle",
      })
      .fill("black")
      .fontSize(fontSize)
      .moveDown(1);
    for (let key in data) {
      if (key === "token") continue;
      const item: DataItem = data[key as keyof typeof data];
      const currency = item.currency;
      doc.moveDown(3);
      let x = doc.x;
      let y = doc.y;
      doc
        .text(item.name, pageMarginLeft, y - 30, {})
        .font(
          path.join("build", "fonts", "Inter", "static", "Inter-Regular.ttf")
        )
        .moveTo(0, y);
      let alignValue = 250;
      if (currency) {
        doc.text(currency, alignValue, y - 30, {
          continued: true,
        });
        alignValue = doc.x;
      }
      doc
        .font(Font.Regular)
        .text(item.value.toString(), alignValue, y - 30)

        .moveTo(pageMarginLeft, y - 10) // set the current point
        .lineTo(pageWidth - pageMarginLeft, y - 10)
        .stroke();
      // doc.underline(x, y, 200, 10);
    }
    doc.moveDown(1.5);
    let x = doc.x;
    let y = doc.y;
    doc.image("build/imgs/logo2.png", pageMarginLeft, y, {
      link: "https://telah.ng",
    });
    doc.fontSize(10).text(footerText, pageMarginLeft, y + 100, {
      width: pageWidth - 300,
    });
    y = doc.y;
    doc

      .lineWidth(2)
      .rect(pageWidth - pageMarginRight - 101.5, y - 44, 102, 10)
      .fill("black")
      .roundedRect(pageWidth - pageMarginRight - 100, y - 140, 100, 100, 5)

      .fillAndStroke("white", "black")
      .image(barcode, pageWidth - pageMarginRight - 98, y - 138, {
        fit: [96, 96],
        width: 100,
        height: 100,
        align: "center",
        valign: "center",
      });
    y = doc.y;
    doc

      .roundedRect(pageWidth - pageMarginRight - 101.5, y - 40, 102, 30, 5)
      .fill("black")

      .fill("black")
      .stroke()
      .fontSize(14)
      .font(Font.Bold)
      .fill("white")
      .text("Scan Me", pageWidth - pageMarginRight - 100, y - 28, {
        align: "center",
        baseline: "middle",
      });
    doc.end();
  } catch (error) {
    next(error);
  }
};

export { powerReceipt };
