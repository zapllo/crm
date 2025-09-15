/**
 * Renders a quotation as HTML in the "Automate Business" layout.
 * Set template.styles.structure = 'legacy' to use your old section-by-section flow.
 */

// Safely resolve a company display name from a contact doc or plain value
function resolveCompanyNameFromContact(c: any): string {
  if (!c || c.company == null) return "";
  const v = c.company;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    // support multiple shapes just in case
    return v.name || v.companyName || v.title || "";
  }
  return "";
}

// Make any value safe to inline (avoid [object Object])
function safeText(v: any): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") return v.name || v.title || v.label || "";
  return "";
}


export function renderQuotationHTML(quotation: any, template: any, organization?: any): string {
  const { layout = {}, styles = {} } = template ?? {};
  const primary = styles.primaryColor || '#EC4899'; // pink-ish by default to resemble screenshot

  // ------------ utils --------------------------------------------------------
  const money = (n: number) => {
    if (!Number.isFinite(n)) return '';
    const currency = quotation?.currency || 'USD';
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
  };
  const show = (v?: number) => (v || v === 0) ? String(v) : '—';
  const words = quotation?.amountInWords || '';

  const logoUrl = (() => {
    if (quotation?.logos?.company) return quotation.logos.company;
    if (quotation?.organizationLogo) return quotation.organizationLogo;
    if (organization?.logo) return organization.logo;
    return '';
  })();

  const signatureUrl = (() => {
    return (
      quotation?.digitalSignature ||
      organization?.digitalSignature ||
      organization?.settings?.quotations?.digitalSignature ||
      ''
    );
  })();

  // variable replacement for header/footer strings from DB (kept intact)
  const processVars = (s: string) => {
    if (!s) return '';
    const cd = quotation?.companyDetails || {};
    const contact = quotation?.contact || {};
    const lead = quotation?.lead || {};
    const dict: Record<string, string> = {
      company_name: cd.name || organization?.companyName || '',
      company_email: cd.email || organization?.email || '',
      company_phone: cd.phone || organization?.phone || '',
      company_address: cd.address || organization?.address || '',
      company_website: cd.website || organization?.website || '',
      company_tagline: organization?.tagline || '',
      company_tax_id: cd.taxId || '',
      company_registration_number: cd.registrationNumber || '',
      company_logo: `<img src="${logoUrl || 'https://via.placeholder.com/200x100?text=Company+Logo'}" alt="Logo" style="max-width:180px;max-height:70px;object-fit:contain" />`,
      quotation_number: quotation?.quotationNumber || '',
      quotation_title: quotation?.title || '',
      date: quotation?.issueDate ? new Date(quotation.issueDate).toLocaleDateString() : '',
      valid_until: quotation?.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : '',
      page_number: '1',
      total_pages: '1',
      client_name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      client_salutation: quotation?.clientSalutation || 'Dear',
      project_title: lead.title || '',
      project_description: lead.description || '',
      total_amount: money(quotation?.total || 0),
      subtotal: money(quotation?.subtotal || 0),
      currency: quotation?.currency || 'USD',
      digital_signature: signatureUrl ? `<img src="${signatureUrl}" alt="Digital Signature" style="max-width:200px;max-height:80px;object-fit:contain" />` : ''
    };
    let out = s;
    for (const [k, v] of Object.entries(dict)) out = out.replace(new RegExp(`{{${k}}}`, 'g'), v);
    return out;
  };

  // ------------ CSS ----------------------------------------------------------
  const css = `
    body{font-family:${styles.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'};
         font-size:${styles.fontSize || '14px'};margin:0;background:${styles.backgroundColor || '#fff'};color:#111}
    .wrap{padding:20px}
    .topband{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
    .ql{max-width:70%}
    .qt{color:${primary};font-weight:800;font-size:22px;letter-spacing:.02em;margin:0 0 6px}
    .meta{font-size:12px;color:#6B7280;line-height:1.5}
    .meta b{color:#111}
    .logo img{max-height:52px;max-width:180px;object-fit:contain}
    .twogrid{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
    .card{background:#FFF;border:1px solid #E5E7EB;border-radius:8px}
    .card-inner{padding:14px 16px}
    .card h4{margin:0 0 8px;font:700 13px/1.2 inherit;color:${primary};text-transform:uppercase}
    .line{font-size:13px;color:#111;line-height:1.55}
    .muted{color:#9CA3AF}
    .sal{margin:10px 0 6px;font-size:13px}
    .items{width:100%;border-collapse:collapse;margin-top:16px;border-radius:8px;overflow:hidden}
    .items thead th{background:${primary};color:#fff;padding:12px 10px;font:700 12px/1.2 inherit;letter-spacing:.03em;text-align:left}
    .items td{padding:10px;border-bottom:1px solid #E5E7EB;font-size:13px}
    .txr{text-align:right}
    .sm{font-size:12px;color:#6B7280}
    .words{margin:12px 0 10px;font-size:12px}
    .bottom{margin-top:12px;display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start}
    .sumtab{width:100%;border-collapse:collapse}
    .sumtab td{padding:6px 0;font-size:13px}
    .lab{font-weight:700;color:#111}
    .val{text-align:right}
    .grand{margin-top:10px;background:${primary};color:#fff;font-weight:800;padding:10px 12px;text-align:right;border-radius:6px}
    /* Enhanced Zapllo branding */
        .zapllo-branding-container { margin-top: 40px; width: 100%; }
        .zapllo-branding {
          border-top: 1px solid ${primary}20;
          padding: 16px 24px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px;
          background: linear-gradient(to right, ${styles.backgroundColor || '#ffffff'}, ${primary}05, ${styles.backgroundColor || '#ffffff'});
        }
        .zapllo-powered-text { color: #6c737f; font-weight: 600; }
        .zapllo-logo { height: 16px; margin-right: 4px; }
        .zapllo-link { display: flex; align-items: center; text-decoration: none; transition: opacity .3s; }
        .zapllo-link:hover { opacity: .8; }
        .zapllo-brand-name { color: ${primary}; font-weight: 600; }
    .sig img{max-width:200px;max-height:80px;object-fit:contain}
    ${styles.customCSS || ''}
  `;

  // ------------ blocks (exact layout) ---------------------------------------
  const contact = quotation?.contact || {};
  const contactName = (contact.firstName || contact.lastName)
    ? `${[contact.firstName, contact.lastName].filter(Boolean).join(' ')}`
    : '';
  const companyName = contact.company || quotation?.companyDetails?.name || '';
  const salWord = quotation?.clientSalutation || 'Dear';
  const salName = contactName || 'Client';

  const header = `
    <div class="topband">
      <div class="ql">
        <h1 class="qt">QUOTATION</h1>
        <div class="meta">
          <div><b>Quotation Number:</b> ${quotation?.quotationNumber || ''}</div>
          <div><b>Quotation Date:</b> ${quotation?.issueDate ? new Date(quotation.issueDate).toLocaleDateString() : ''}</div>
          <div><b>Validity:</b> ${quotation?.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : ''}</div>
        </div>
      </div>
      <div class="logo">${logoUrl ? `<img src="${logoUrl}" alt="Logo" />` : ''}</div>
    </div>
  `;

const rightContact =
  quotation?.contactPerson ||
  quotation?.accountManager || {
    name: organization?.contactName || organization?.companyName || "",
    phone: organization?.phone || "",
    email: organization?.email || "",
  };

// right-side sender/contact (your side)
const senderName =
  safeText(quotation?.accountManager?.name) ||
  safeText(quotation?.ownerName) ||
  (quotation?.creator
    ? [safeText(quotation.creator.firstName), safeText(quotation.creator.lastName)].filter(Boolean).join(" ")
    : "");

const senderPhone =
  safeText(quotation?.accountManager?.phone) ||
  safeText(quotation?.ownerPhone) ||
  safeText(organization?.phone);

const senderEmail =
  safeText(quotation?.accountManager?.email) ||
  safeText(quotation?.ownerEmail) ||
  safeText(organization?.email);

const senderCompany =
  safeText(organization?.companyName) ||
  safeText(quotation?.companyDetails?.name);

// left-side client (their side) — NO fallbacks to your org/companyDetails
const clientCompany = resolveCompanyNameFromContact(contact); // handles populated contact.company
const clientPerson = [safeText(contact.firstName), safeText(contact.lastName)].filter(Boolean).join(" ");
const clientDisplay = clientCompany || clientPerson || "Client";

const cards = `
  <div class="twogrid">
    <!-- LEFT: QUOTE TO (client) -->
    <div class="card"><div class="card-inner">
      <h4>QUOTE TO</h4>
      <div class="line"><b>${clientDisplay}</b></div>
      ${contact.whatsappNumber || contact.phone ? `<div class="line">Phone: ${safeText(contact.whatsappNumber || contact.phone)}</div>` : ""}
      ${contact.email ? `<div class="line">Email: ${safeText(contact.email)}</div>` : ""}
      ${safeText(contact.address) ? `<div class="line">Billing Address: ${safeText(contact.address)}</div>` : ""}
      ${safeText((contact as any).shippingAddress) ? `<div class="line">Shipping Address: ${safeText((contact as any).shippingAddress)}</div>` : ""}

    
      ${quotation?.introText ? `<div class="line">${safeText(quotation.introText)}</div>` : ""}
    </div></div>

    <!-- RIGHT: CONTACT PERSON (sender) -->
    <div class="card"><div class="card-inner">
      <h4>CONTACT PERSON</h4>
      ${senderName ? `<div class="line"><b>${senderName}</b></div>` : ""}
      ${senderCompany ? `<div class="line muted">${senderCompany}</div>` : ""}
      ${senderPhone ? `<div class="line">Phone: ${senderPhone}</div>` : ""}
      ${senderEmail ? `<div class="line">Email: ${senderEmail}</div>` : ""}
    </div></div>
  </div>
    <div class="sal">${safeText(quotation?.clientSalutation || "Dear")} ${clientPerson || "Client"},</div>
`;

  const items = (quotation?.items || []).map((it: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div><b>${it.name || ''}</b></div>
          ${it.description ? `<div class="sm">${it.description}</div>` : ''}
        </td>
        <td class="txr">${it.quantity ?? ''}</td>
        <td class="txr">${money(it.unitPrice)}</td>
        <td class="txr">${show(it.discount)}</td>
        <td class="txr">${show(it.tax ?? it.taxPercentage ?? it.tax?.percentage)}</td>
        <td class="txr">${money(it.total)}</td>
      </tr>
  `).join('');

  const table = `
    <table class="items">
      <thead>
        <tr>
          <th style="width:42px">#</th>
          <th>Product Details</th>
          <th class="txr">Qty</th>
          <th class="txr">Price</th>
          <th class="txr">Disc%</th>
          <th class="txr">Tax%</th>
          <th class="txr">Total</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>
  `;

  const subtotal = quotation?.subtotal || 0;
  const discAmt = quotation?.discount?.amount || 0;
  const taxAmt = quotation?.tax?.amount || 0;
  const charges = quotation?.charges || quotation?.shipping || 0;
  const total = Number.isFinite(quotation?.total) ? quotation.total : (subtotal - discAmt + taxAmt + charges);

  const bottom = `
    ${words ? `<div class="words">Amount In Words: <b>${words}</b></div>` : ''}

    <div class="bottom">
      <div>
        ${quotation?.paymentTerms ? `
          <div style="margin-bottom:10px">
            <div class="lab" style="color:${primary};margin-bottom:6px">Payment Terms</div>
            <div class="line">${quotation.paymentTerms}</div>
          </div>` : ''}

        ${(Array.isArray(quotation?.terms) && quotation.terms.length) ? `
          <div>
            <div class="lab" style="color:${primary};margin-bottom:6px">Terms And Conditions</div>
            ${quotation.terms.map((t: any) =>
    `<div class="line"><b>${t.title ? t.title + ': ' : ''}</b>${t.content || ''}</div>`
  ).join('')}
          </div>` : ''}

        ${signatureUrl ? `
          <div class="sig" style="margin-top:16px">
            <div class="lab" style="color:${primary};margin-bottom:6px">Authorized Signature</div>
            <img src="${signatureUrl}" alt="Digital Signature" />
            <div style="margin-top:6px;font-size:12px;color:#6B7280">
              <strong>${organization?.companyName || quotation?.companyDetails?.name || ''}</strong>
            </div>
          </div>` : ''}
      </div>

      <div>
        <table class="sumtab">
          <tr><td class="lab">SUBTOTAL</td><td class="val">${money(subtotal)}</td></tr>
          ${discAmt ? `<tr><td class="lab">DISCOUNT</td><td class="val">-${money(discAmt)}</td></tr>` : ''}
          ${taxAmt ? `<tr><td class="lab">TAX</td><td class="val">${money(taxAmt)}</td></tr>` : ''}
          ${charges ? `<tr><td class="lab">${quotation?.chargesLabel || 'CHARGES'}</td><td class="val">${money(charges)}</td></tr>` : ''}
        </table>
        <div class="grand">GRAND TOTAL&nbsp;&nbsp;${money(total)}</div>
      </div>
    </div>
  `;

  // legacy path (if someone sets structure: 'legacy')
  const useLegacy = styles?.structure === 'legacy';
  const legacy = () => processVars(layout?.header?.content || '') +
    (layout?.sections ?? []).filter((s: any) => s?.isVisible).sort((a: any, b: any) => a.order - b.order)
      .map((s: any) => s.content ? `<div class="quotation-section">${s.title ? `<h3>${s.title}</h3>` : ''}${processVars(s.content)}</div>` : '')
      .join('') +
    processVars(layout?.footer?.content || '');

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="color-scheme" content="light" />
        <title>Quotation ${quotation?.quotationNumber || ''}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="wrap">
          ${processVars(layout?.header?.show ? layout.header.content : '')}

          ${useLegacy ? legacy() : `
            ${header}
            ${cards}
            ${table}
            ${bottom}
          `}

          ${processVars(layout?.footer?.show ? layout.footer.content : '')}

         <div class="zapllo-branding-container">
          <div class="zapllo-branding">
            <span class="zapllo-powered-text">Powered by</span>
            <a href="https://zapllo.com" target="_blank" rel="noopener noreferrer" class="zapllo-link">
              <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1743846882/logo-01_1_a2qvzt.png" alt="Zapllo" class="zapllo-logo"/>
             
            </a>
          </div>
        </div>

        </div>
      </body>
    </html>
  `;
  return html;
}
