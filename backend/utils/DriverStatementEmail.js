import nodemailer from "nodemailer";
import pdf from "pdf-creator-node";

const template = `
<html>
  <head>
    <meta charset="UTF-8" />

    <style>
        .invoice-container {
           padding: 16px;
           border: 1px solid #ccc;
           border-radius: 8px;
           background: #f1efef;
           font-size: 14px;
          margin-top: 16px;
         box-sizing: border-box;
           font-family: Arial, sans-serif;
         }

.invoice-header{
  display: table !important;
  width: 100%;
  table-layout: fixed;
  margin-bottom: 20px;
  /* remove debug color if you want */
}
.invoice-header .company-info,
.invoice-header .invoice-info{
  display: table-cell !important;
  vertical-align: top;
}
.invoice-header .company-info{
  width: 60%;
  padding-right: 12px;
}
.invoice-header .invoice-info{
  width: 40% !important;
  text-align: right;
}

/* keep logo tidy */
.company-logo{
  max-width: 120px;
  height: auto;
  display: block;
  margin-bottom: 8px;
}
        .company-logo {
           height: 80px;
          margin-bottom: 8px;
         }
      .company-logo {
        height: 80px;
        margin-bottom: 8px;
      }

      .company-name {
        margin: 10px 0px;
        font-weight: 600;
      }

      .invoice-title {
        font-size: 20px;
        font-weight: bold;
      }

      .invoice-no {
        color: #6b7280;
      }

      .invoice-status {
        margin-top: 10px;
        margin-bottom: 10px;
        display: inline-block;
        font-size: 18px;
        font-weight: 700;
        border-radius: 10px;
        min-width: 60px;
        text-transform: capitalize;
      }

      .invoice-status.paid {
        color: #16a34a;
      }

      .invoice-status.unpaid {
        color: #dc2626;
      }

      .bill-to {
        font-weight: bold;
        margin-top: 10px;
        gap: 0px;
      }

    .bill-to-div { margin-top: 6px; }
.bill-to-div > span,
.bill-to-div > a {
  display: block;     
  margin: 7px 0;
}
    .email-link {
color: #2563eb;
font-size: 14px;          
text-decoration: none;
white-space: nowrap;      
word-break: keep-all;      
overflow-wrap: normal;     
marginBottom: 1px
}
      .invoice-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }

      .invoice-table thead {
        background: black;
        color: white;
      }

      .invoice-table th,
      .invoice-table td {
        padding: 8px;
        border: 1px solid #ddd;
        vertical-align: top;
        text-align: left;
      }

      .totals {
        text-align: right;
        margin-top: 16px;
      }

      .totals .balance {
        font-weight: bold;
      }

      .invoice-notes {
        margin-top: 16px;
        border-top: 1px solid #ccc;
        padding-top: 8px;
      }

      .notes-title {
        font-weight: 600;
      }

      .notes-text {
        color: #4b5563;
        font-size: 13px;
      }
        .tax-field {
        font-size:12px;
        white-space: nowrap;

        }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div class="invoice-header">
        <div class="company-info">
           {{#if company.profileImage}}
  <img src="{{company.profileImage}}" alt="Logo" class="company-logo"/>
{{/if}}
<p class="company-name">{{company.companyName}}</p>
<p>VAT Number - 442612419</p>
<p>{{company.fullAddress}}</p>
{{#if company.email}}
  <a href="mailto:{{company.email}}" class="email-link">{{company.email}}</a>
{{/if}}
        </div>
<div class="invoice-info">
  <h2 class="invoice-title">INVOICE</h2>

  {{#if invoice.status}}
    <p class="invoice-status {{invoice.statusLower}}" style="color: {{invoice.statusColor}};">
      {{invoice.status}}
    </p>
  {{/if}}

  <p class="invoice-no">#{{invoice.invoiceNumber}}</p>

  <div class="invoice-dates">
    <p>Invoice Date: {{invoice.invoiceDate}}</p>
    <p>Due Date: {{invoice.dueDate}}</p>
  </div>

  <div class="bill-to">
    <p>Bill To</p>
    <div class="bill-to-div">
      {{#if billTo.name}}<span>{{billTo.name}}</span>{{/if}}
      {{#if billTo.email}}
        <a href="mailto:{{billTo.email}}" class="email-link">{{billTo.email}}</a>
      {{/if}}
      {{#if billTo.phone}}<span>{{billTo.phone}}</span>{{/if}}
    </div>
  </div>
</div>
      </div>
      <div class="table-wrapper">
        <table class="invoice-table">
          <thead>
            <tr><th>#</th><th>Item</th><th>Tax</th><th>Amount</th></tr>
          </thead>
         <tbody>
  {{#each items}}
    <tr>
      <td>{{idx1}}</td>
      <td>
        {{bookingId}}<br/>
        <small>Pickup: {{pickup}}, Dropoff: {{dropoff}}</small>
      </td>
      <td class="tax-field">{{taxLabel}}</td>
      <td>£{{amountStr}}</td>
    </tr>
  {{/each}}
</tbody>

        </table>
      </div>
   <div class="totals">
  <p>Sub Total: £{{totals.subTotalStr}}</p>
  <p>Total Tax: £{{totals.totalTaxStr}}</p>
  <p class="balance">Grand Total: £{{totals.grandTotalStr}}</p>
</div>
      <div class="invoice-notes">
        <p class="notes-title">Notes</p>
        <p class="notes-text">T&Cs apply. Please call for detail.</p>
      </div>
    </div>
  </body>
</html>`;

/** helper: GBP string */
function gbp(n) {
  return Number(n || 0).toFixed(2);
}

/** Build data for the handlebars template: precompute everything you need */
function buildTemplateData(company, invoice) {
  // Ensure we have a plain object (Mongoose docs can hide fields like invoiceNumber)
  const inv =
    invoice && typeof invoice.toObject === "function"
      ? invoice.toObject({ getters: true, virtuals: true })
      : invoice;

  const items = Array.isArray(inv?.items) ? inv.items : [];

  const computedItems = items.map((ride, i) => {
    const fare = Number(ride?.fare) || 0;
    const total = Number(ride?.totalAmount) || 0;
    const taxAmount = total - fare;
    const taxPercent = fare > 0 ? Math.round((taxAmount / fare) * 100) : 0;

    return {
      idx1: i + 1,
      bookingId: ride?.bookingId || "-",
      pickup: ride?.pickup || "-",
      dropoff: ride?.dropoff || "-",
      taxLabel: taxAmount > 0 ? `${taxPercent}%` : "No Tax",
      amountStr: gbp(total),
    };
  });

  const subTotal = items.reduce((a, i) => a + (Number(i?.fare) || 0), 0);
  const totalTax = items.reduce(
    (a, i) => a + ((Number(i?.totalAmount) || 0) - (Number(i?.fare) || 0)),
    0
  );
  const grandTotal = subTotal + totalTax;

  const status = String(inv?.status || "");
  const statusLower = status.toLowerCase();
  const statusColor =
    statusLower === "paid"
      ? "#16a34a"
      : statusLower === "unpaid"
      ? "#dc2626"
      : "#111827";

  // Prefer inv.invoiceDate if present, else createdAt
  const invoiceDateVal = inv?.invoiceDate || inv?.createdAt;
  const invoiceDate = invoiceDateVal
    ? new Date(invoiceDateVal).toLocaleDateString()
    : "-";

  const dueDate = items?.[0]?.date
    ? new Date(items[0].date).toLocaleDateString()
    : "-";

  const fullAddress = [
    company?.address,
    company?.city,
    company?.state,
    company?.zip,
  ]
    .filter(Boolean)
    .join(", ");

  const billTo = {
    name:
      inv?.invoiceType === "driver" ? inv?.driver?.name : inv?.customer?.name,
    email:
      inv?.invoiceType === "driver" ? inv?.driver?.email : inv?.customer?.email,
    phone:
      inv?.invoiceType === "driver" ? inv?.driver?.phone : inv?.customer?.phone,
  };
  return {
    company: {
      ...company,
      fullAddress,
    },
    invoice: {
      ...inv, // now includes invoiceNumber
      status,
      statusLower, // used for class binding in template
      statusColor, // used for inline color in template
      invoiceDate,
      dueDate,
    },
    billTo,
    items: computedItems,
    totals: {
      subTotalStr: gbp(subTotal),
      totalTaxStr: gbp(totalTax),
      grandTotalStr: gbp(grandTotal),
    },
  };
}

export const DriverStatementEmail = async (
  to,
  subject,
  { company, invoice }
) => {
  // 1) Prep data for the template
  const data = buildTemplateData(company, invoice);

  // 2) Configure pdf-creator-node to return a Buffer
  const document = {
    html: template,
    data,
    type: "buffer", // important: we want a Buffer to attach to email
  };

  const options = {
    format: "A4",
    orientation: "portrait",
    border: "5mm",
    header: { height: "0mm" },
    footer: { height: "0mm" },
  };

  // 3) Generate the PDF buffer
  const pdfBuffer = await pdf.create(document, options);

  // 4) Email via Nodemailer
  const pdfName = `${invoice?.invoiceNumber || "statement"}.pdf`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"MTL Booking" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: `Here is your invoice ${
      invoice?.invoiceType === "driver" ? invoice?.driver?.name : "person"
    }`,
    attachments: [
      {
        filename: pdfName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};
