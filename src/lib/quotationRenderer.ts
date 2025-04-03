/**
 * Renders a quotation as HTML based on a provided template
 */
export function renderQuotationHTML(quotation: any, template: any, organization?: any): string {
  // For debugging - log inputs
  console.log('Renderer inputs:', {
    quotation: {
      logos: quotation?.logos,
      organization: quotation?.organization
    },
    organization: {
      _id: organization?._id,
      logo: organization?.logo
    }
  });
  
  // Extract template properties
  const { layout, styles, pageSettings } = template;
  
  // Format currency values
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '';
    
    const currency = quotation.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Get company logo URL with explicit logging
  const getCompanyLogoUrl = () => {
    // Check quotation logos
    if (quotation?.logos?.company) {
      console.log('Using logo from quotation:', quotation.logos.company);
      return quotation.logos.company;
    }
    
    // Check organization logo
    if (organization?.logo) {
      console.log('Using logo from organization:', organization.logo);
      return organization.logo;
    }
    
    console.log('No logo found in quotation or organization');
    return null;
  };
  
  // Process template variables in content
  const processVariables = (content: string) => {
    if (!content) return '';
    
    // Get company logo URL for template use
    const logoUrl = getCompanyLogoUrl();
    // Use a placeholder only if needed for rendering
    const finalLogoUrl = logoUrl || 'https://via.placeholder.com/200x100?text=Company+Logo';
    
    // Define variable mappings
    const variables: {[key: string]: string} = {
      company_name: organization?.companyName || '',
      company_email: organization?.email || '',
      company_phone: organization?.phone || '',
      company_address: organization?.address || '',
      company_tagline: organization?.tagline || '',
      company_logo: `<img src="${finalLogoUrl}" alt="${organization?.companyName || 'Company'} Logo" style="max-width: 180px; max-height: 70px; object-fit: contain;" ${!logoUrl ? 'class="placeholder-logo"' : ''} />`,
      quotation_number: quotation.quotationNumber || '',
      quotation_title: quotation.title || '',
      date: new Date(quotation.issueDate).toLocaleDateString(),
      valid_until: quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : '',
      page_number: '1', // Will be replaced by PDF renderer
      total_pages: '1', // Will be replaced by PDF renderer
      client_name: `${quotation.contact?.firstName || ''} ${quotation.contact?.lastName || ''}`.trim(),
      client_email: quotation.contact?.email || '',
      client_phone: quotation.contact?.phone || quotation.contact?.whatsappNumber || '',
      total_amount: formatCurrency(quotation.total),
    };
    
    // Replace variables in content
    let processedContent = content;
    for (const [key, value] of Object.entries(variables)) {
      processedContent = processedContent.replace(
        new RegExp(`{{${key}}}`, 'g'), 
        value
      );
    }
    
    return processedContent;
  };
  
  // Compile custom CSS with template styles
  const compileStyles = () => {
    return `
      body {
        font-family: ${styles.fontFamily || 'Inter, sans-serif'};
        font-size: ${styles.fontSize || '12px'};
        color: #333;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
      
      .quotation-container {
        padding: 20px;
      }
      
      .company-logo {
        max-width: 180px;
        max-height: 70px;
        object-fit: contain;
      }
      
      .placeholder-logo {
        border: 1px dashed #ccc;
        border-radius: 4px;
        padding: 4px;
      }
      
      .quotation-section {
        margin-bottom: 25px;
      }
      
      .quotation-section-title {
        color: ${styles.primaryColor};
        font-weight: 600;
        margin-bottom: 10px;
      }
      
      .quotation-table {
        width: 100%;
        border-collapse: ${styles.tableBorders ? 'collapse' : 'separate'};
        margin-bottom: 15px;
      }
      
      .quotation-table th,
      .quotation-table td {
        padding: 10px;
        text-align: left;
        ${styles.tableBorders ? `border: 1px solid #ddd;` : ''}
      }
      
      .quotation-total {
        font-weight: bold;
      }
      
      ${styles.customCSS || ''}
    `;
  };
  
  // Render client information section
  const renderClientInfo = () => {
    const client = quotation.contact || {};
    const lead = quotation.lead || {};
    
    return `
      <div class="quotation-section client-info">
        <div style="display: flex; justify-content: space-between;">
          <div style="flex: 1;">
            <h3 style="margin-top: 0; margin-bottom: 10px;">Client Information</h3>
            <div>${client.firstName || ''} ${client.lastName || ''}</div>
            <div>${client.email || ''}</div>
            <div>${client.phone || client.whatsappNumber || ''}</div>
          </div>
          <div style="flex: 1;">
            <h3 style="margin-top: 0; margin-bottom: 10px;">Project</h3>
            <div>${lead.title || 'General Inquiry'}</div>
            <div>Quotation #: ${quotation.quotationNumber || ''}</div>
            <div>Date: ${new Date(quotation.issueDate).toLocaleDateString()}</div>
            <div>Valid until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>
      </div>
    `;
  };
  
  // Render items table section
  const renderItemsTable = () => {
    const items = quotation.items || [];
    
    if (items.length === 0) {
      return `<div class="quotation-section">
        <h3 class="quotation-section-title">Products & Services</h3>
        <p>No items have been added to this quotation.</p>
      </div>`;
    }
    
    const itemRows = items.map((item: any) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.description || ''}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
        ${item.discount ? `<td style="text-align: right;">${item.discount}%</td>` : ''}
        <td style="text-align: right;">${formatCurrency(item.total)}</td>
      </tr>
    `).join('');
    
    return `
      <div class="quotation-section">
        <h3 class="quotation-section-title">Products & Services</h3>
        <table class="quotation-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              ${items.some((item: any) => item.discount) ? `<th style="text-align: right;">Discount</th>` : ''}
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>
    `;
  };
  
  // Render summary section
  const renderSummary = () => {
    return `
      <div class="quotation-section">
        <h3 class="quotation-section-title">Summary</h3>
        <table style="width: 300px; margin-left: auto;">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">${formatCurrency(quotation.subtotal)}</td>
          </tr>
          ${quotation.discount ? `
          <tr>
            <td>Discount (${quotation.discount.type === 'percentage' ? `${quotation.discount.value}%` : 'Fixed'}):</td>
            <td style="text-align: right;">-${formatCurrency(quotation.discount.amount)}</td>
          </tr>
          ` : ''}
          ${quotation.tax ? `
          <tr>
            <td>${quotation.tax.name || 'Tax'} (${quotation.tax.percentage}%):</td>
            <td style="text-align: right;">${formatCurrency(quotation.tax.amount)}</td>
          </tr>
          ` : ''}
          ${quotation.shipping ? `
          <tr>
            <td>Shipping:</td>
            <td style="text-align: right;">${formatCurrency(quotation.shipping)}</td>
          </tr>
          ` : ''}
          <tr class="quotation-total-row">
            <td><strong>Total:</strong></td>
            <td style="text-align: right;"><strong>${formatCurrency(quotation.total)}</strong></td>
          </tr>
        </table>
      </div>
    `;
  };
  
  // Render terms & conditions section
  const renderTerms = () => {
    const terms = quotation.terms || [];
    
    if (terms.length === 0) {
      return '';
    }
    
    const termsSections = terms.map((term: any) => `
      <div style="margin-bottom: 15px;">
        <h4 style="margin-top: 0; margin-bottom: 5px;">${term.title}</h4>
        <div>${term.content}</div>
      </div>
    `).join('');
    
    return `
      <div class="quotation-section">
        <h3 class="quotation-section-title">Terms & Conditions</h3>
        ${termsSections}
      </div>
    `;
  };
  
// Render additional logos
const renderAdditionalLogos = () => {
  let logos: string[] = [];
  
  // Add logos from quotation first
  if (quotation?.logos?.additional && quotation.logos.additional.length > 0) {
    logos = quotation.logos.additional;
  }
  // Add logos from organization if available and no quotation logos
  else if (organization?.additionalLogos && organization.additionalLogos.length > 0) {
    logos = organization.additionalLogos;
  }
    
    if (logos.length === 0) {
      return '';
    }
    
return `
  <div class="quotation-section" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-top: 30px;">
    ${logos.map((logo: string) => `
      <img src="${logo}" alt="Additional Logo" style="max-height: 60px; max-width: 150px; object-fit: contain;" />
    `).join('')}
  </div>
`;
  };
  
  // Generate complete HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation ${quotation.quotationNumber || ''}</title>
      <style>
        ${compileStyles()}
      </style>
    </head>
    <body>
      <div class="quotation-container">
        ${layout.header.show ? processVariables(layout.header.content) : ''}
        
        ${layout.sections.filter((section: any) => section.isVisible).sort((a: any, b: any) => a.order - b.order).map((section: any) => {
          switch(section.type) {
            case 'client_info':
              return renderClientInfo();
            case 'items_table':
              return renderItemsTable();
            case 'summary':
              return renderSummary();
            case 'terms':
              return renderTerms();
            case 'additional_logos':
              return renderAdditionalLogos();
            default:
              // For custom sections, process the content with variables
              if (section.content) {
                return `
                  <div class="quotation-section">
                    ${section.title ? `<h3 class="quotation-section-title">${section.title}</h3>` : ''}
                    <div>${processVariables(section.content)}</div>
                  </div>
                `;
              }
              return '';
          }
        }).join('')}
        
        ${layout.footer.show ? processVariables(layout.footer.content) : ''}
      </div>
      
      <!-- Hidden debug info -->
      <div style="display: none;" id="debug-info">
        Organization: ${JSON.stringify(organization?._id || 'Not provided')}
        Organization Logo: ${organization?.logo || 'None'}
        Quotation Logo: ${quotation?.logos?.company || 'None'}
      </div>
    </body>
    </html>
  `;
  
  return html;
}