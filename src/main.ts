import express, { Express } from "express";
import { powerReceipt } from "./receipt/power";
import { TenantInvoice } from "./invoice/tenant";

require("dotenv").config();
const app: Express = express();

const port: number = Number(process.env.PORT || 3000);
const host = process.env.SERVER_HOST || undefined;

app.get("/receipt", async function (req, res, next) {
  powerReceipt(req, res, next);
});
app.get("/invoice", async function (req, res, next) {
  TenantInvoice(req, res, next);
});
app.get("/", function (req, res) {
  res.send(`
     <center>
        <h1>Receipt</h1>
        <h4><a href="receipt">View Power Receipt</a></h4>
        <h4><a href="invoice">View Invoice</a></h4>
     </center>
  `);
});
app.listen(port, () => {
  console.log("Server is running on port 3000");
});
