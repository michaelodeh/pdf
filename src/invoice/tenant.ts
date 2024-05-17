import { NextFunction, Request, Response } from "express";
import PDFDocument from "pdfkit";
import path from "path";
import QRCode from "qrcode";
const data = {
  billTo: "John Doe",
  invoiceDate: "10/10/2023",
  address: "10a, 10 Assembly Close, Satellite Town, Lagos",
  paymentDue: "10-10-2024",
  phoneNumber: "08060985540",
  amountDue: "7,000,000:00",
  email: "johndoe@gmail.com",
  description: [
    { item: "Rent", amount: "7,000,000:00" },
    { item: "Caution Fee", amount: "300,000:00" },
    { item: "Administrative Fee (Legal)", amount: "30:00" },
    { item: "Service Charge", amount: "0:00" },
  ],
  total: "7,000,000:00",
  bankDetails: {
    bank: "GT Bank",
    accountName: "Mazi Okoro",
    accountNumber: "0955650506",
  },
};
const invoiceID = "";
const TenantInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doc = new PDFDocument({
      info: {
        Title: "Invoice - Telah",
        Author: "Telah",
        Subject: "Invoice-" + invoiceID,
        Creator: "Telah",
        Producer: "Telah",
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

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        "Content-Length": pdfData.length,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=Invoice-${invoiceID}.pdf`,
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
    const codeText = `https://telah.ng/invoice/${invoiceID}`;
    const qrcode = await QRCode.toDataURL(codeText);
    const fontSize = 12;
    const secondaryFontSize = 8;
    const fontPath = path.join("public", "fonts", "Rubik", "static");

    const Font = {
      Light: "Light",
      Regular: "Regular",
      SemiBold: "SemiBold",
      Bold: "Bold",
      Italic: "Italic",
      BoldItalic: "BoldItalic",
    };

    doc.registerFont("Light", path.join(fontPath, "Rubik-Light.ttf"));
    doc.registerFont("Regular", path.join(fontPath, "Rubik-Regular.ttf"));
    doc.registerFont("SemiBold", path.join(fontPath, "Rubik-SemiBold.ttf"));
    doc.registerFont("Bold", path.join(fontPath, "Rubik-Bold.ttf"));
    doc.registerFont("Italic", path.join(fontPath, "Rubik-Italic.ttf"));
    doc.registerFont("BoldItalic", path.join(fontPath, "Rubik-BoldItalic.ttf"));

    const owner = "Chief Mazi Okoro Esate";
    const unit = "10a";
    const address = "10 Assembly Close, Satellite Town, Lagos.";
    const phoneNumber = "08060985540";
    const email = "johndoe@gmail.com";
    const rightPosition = pageWidth - 200;
    const gap = 1.5;
    let x = doc.x;
    let y = doc.y;
    const currencyFont = path.join(
      "public",
      "fonts",
      "Inter",
      "static",
      "Inter-Light.ttf"
    );
    doc
      .font(Font.Light, fontSize)
      .fillColor("#2D3564")
      .font(Font.Regular, 16)
      .text(owner, { align: "center" })
      .fillColor("black")
      .font(Font.Light, fontSize)
      .text(`Unit Number (${unit}) ${address}`, { align: "center" })
      .text(`${phoneNumber} ${email}`, { align: "center" })
      .moveDown()
      .font(Font.Regular, 30)
      .text("invoice".toUpperCase(), { align: "center" })
      .font(Font.Light, fontSize)
      .moveDown(0.5);
    y = doc.y;
    doc
      .text(`Bill To:\n${data.billTo}`)
      .text(`Invoice Date:\n${data.invoiceDate}`, rightPosition, y)
      .moveDown(gap);

    y = doc.y;

    doc
      .text(`Address:\n(${unit}) ${data.address}`, x)
      .text(`Payment Due:\n${data.paymentDue}`, rightPosition, y)
      .moveDown(gap);

    y = doc.y;

    doc
      .text(`Phone Number:\n${data.phoneNumber}`, x)
      .text(`Amount Due:`, rightPosition, y)
      .font(currencyFont)
      .text("\u20A6", { continued: true })
      .font(Font.Light)
      .text(`${data.amountDue}`)
      .moveDown(gap);

    doc.text(`Email:\n${data.email}`, x).moveDown();
    y = doc.y;
    doc.text("Description:", x).text("Amount:", rightPosition, y).moveDown(gap);
    y = doc.y;

    doc
      .rect(0, y, pageWidth, 100)
      .fillAndStroke("#F6F6F6", "#F6F6F6")
      .moveDown(0.8);
    x = pageMarginRight;
    doc.fillAndStroke("black", "black");

    data.description.forEach((list) => {
      y = doc.y;

      doc
        .text(list.item, x)
        .font(currencyFont)
        .text("\u20A6", rightPosition, y, { continued: true })
        .font(Font.Light)
        .text(list.amount)
        .moveDown(0.5);
    });
    doc.moveDown(1);
    y = doc.y;
    doc
      .fontSize(secondaryFontSize)
      .text(
        `For information on your next rent expiry date, go to MY PLACES\nscreen on your resident dashboard on TELAH`,
        x
      )
      .text(`Total: `, rightPosition, y + 1, {
        continued: true,
        baseline: "middle",
      })
      .fontSize(fontSize)
      .font(currencyFont)
      .text("\u20A6", rightPosition, y, { continued: true })
      .font(Font.Light)
      .text(`${data.total}`)
      .moveDown(gap);
    y = doc.y;
    doc.moveTo(0, y).lineTo(pageWidth, y).stroke("#E7E7E7");

    doc
      .moveDown()
      .image(qrcode)
      .moveDown()
      .fillAndStroke("black", "black")
      .text("kindly use the account details below to make payment", x)
      .moveDown()
      .text(
        `Bank: ${data.bankDetails.bank}\nAccount Name: ${data.bankDetails.accountName}\nAccount Number: ${data.bankDetails.accountNumber}`,
        x
      );
    doc
      .fontSize(secondaryFontSize)
      .moveDown(5)
      .text(
        `This bill is generated by TELAH for ${owner}\nFor any other assistance, kindly reach a support personnel on 0912361148 or email support@telah.ng`
      );
    doc.end();
  } catch (error) {
    next(error);
  }
};

export { TenantInvoice };
