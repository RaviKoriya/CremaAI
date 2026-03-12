import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company" }, { status: 400 });
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`*, contacts(*), companies!company_id(*)`)
    .eq("id", invoiceId)
    .eq("company_id", profile.company_id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Generate simple HTML-based PDF response
  // In production, use @react-pdf/renderer on the server side
  const html = generateInvoiceHTML(invoice);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.html"`,
    },
  });
}

function generateInvoiceHTML(invoice: Record<string, unknown>): string {
  const contact = invoice.contacts as Record<string, string> | null;
  const company = invoice.companies as Record<string, string> | null;
  const lineItems = (invoice.line_items as Array<Record<string, unknown>>) ?? [];

  function fmt(amount: number, currency: string): string {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹", AUD: "A$", CAD: "C$", SGD: "S$" };
    return `${symbols[currency] ?? currency}${amount.toFixed(2)}`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${invoice.invoice_number}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; }
  .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .logo { width: 40px; height: 40px; background: #0F1E3C; border-radius: 8px; }
  .invoice-title { font-size: 28px; font-weight: 800; color: #0F1E3C; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 12px; color: #64748b; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .total-row { font-weight: 700; font-size: 16px; }
  .text-right { text-align: right; }
  .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
  @media print { button { display: none; } }
</style>
</head>
<body>
<button onclick="window.print()" style="position:fixed;top:20px;right:20px;padding:8px 16px;background:#0F1E3C;color:white;border:none;border-radius:8px;cursor:pointer;">Print / Save PDF</button>
<div class="header">
  <div>
    <div class="logo"></div>
    <h1 class="invoice-title">INVOICE</h1>
    <p style="color:#64748b;margin:4px 0">${invoice.invoice_number}</p>
    ${company ? `<p style="font-weight:600;margin:4px 0">${company.name}</p>` : ""}
  </div>
  <div style="text-align:right">
    <p><strong>Issue Date:</strong> ${invoice.issue_date}</p>
    ${invoice.due_date ? `<p><strong>Due Date:</strong> ${invoice.due_date}</p>` : ""}
    <p><strong>Status:</strong> <span class="badge">${invoice.status}</span></p>
  </div>
</div>

${contact ? `
<div style="margin-bottom:30px">
  <p style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Bill To</p>
  <p style="font-weight:600;margin:4px 0">${contact.full_name}</p>
  ${contact.company_name ? `<p style="color:#64748b">${contact.company_name}</p>` : ""}
  ${contact.email ? `<p style="color:#64748b">${contact.email}</p>` : ""}
</div>` : ""}

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Qty</th>
      <th>Unit Price</th>
      <th class="text-right">Total</th>
    </tr>
  </thead>
  <tbody>
    ${lineItems.map((item) => `
    <tr>
      <td>${item.description || "—"}</td>
      <td>${item.quantity}</td>
      <td>${fmt(Number(item.unitPrice), invoice.currency as string)}</td>
      <td class="text-right">${fmt(Number(item.lineTotal), invoice.currency as string)}</td>
    </tr>`).join("")}
  </tbody>
</table>

<div style="margin-left:auto;max-width:300px;space-y:8px">
  <div style="display:flex;justify-content:space-between;padding:4px 0;color:#64748b">
    <span>Subtotal</span><span>${fmt(Number(invoice.subtotal), invoice.currency as string)}</span>
  </div>
  <div style="display:flex;justify-content:space-between;padding:4px 0;color:#64748b">
    <span>Tax</span><span>${fmt(Number(invoice.tax_amount), invoice.currency as string)}</span>
  </div>
  <div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;font-size:16px;border-top:2px solid #e2e8f0;margin-top:4px">
    <span>Total</span><span style="color:#0F1E3C">${fmt(Number(invoice.total), invoice.currency as string)}</span>
  </div>
</div>

${invoice.notes ? `<div style="margin-top:30px;padding:16px;background:#f8fafc;border-radius:8px"><p style="font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:8px">Notes</p><p style="white-space:pre-wrap">${invoice.notes}</p></div>` : ""}
${invoice.bank_details ? `<div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px"><p style="font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:8px">Payment Details</p><pre style="font-family:monospace;font-size:12px;white-space:pre-wrap">${(invoice.bank_details as Record<string, string>).info ?? ""}</pre></div>` : ""}
</body>
</html>`;
}
