/* Heard Custom Code - tax-deadlines-table */
"use strict";(()=>{var s=class{constructor(){this.sourceList=null;this.targetContainer=null;this.stylesInjected=!1;this.injectStyles(),this.init()}injectStyles(){if(this.stylesInjected)return;if(document.getElementById("heard-tax-deadlines-table-styles")){this.stylesInjected=!0;return}let t=document.createElement("style");t.id="heard-tax-deadlines-table-styles",t.textContent=`
.tax-deadlines-table {
  width: 100%;
  border-collapse: collapse;
  margin: 2.5rem 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}
.tax-deadlines-table thead {
  background: #226752;
  color: #ffffff;
}
.tax-deadlines-table th {
  padding: 1.25rem 1.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
  position: relative;
}
.tax-deadlines-table th:first-child {
  border-top-left-radius: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}
.tax-deadlines-table th:last-child {
  border-top-right-radius: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}
.tax-deadlines-table tbody tr:first-child td {
  border-top: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr td:first-child {
  border-left: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr td:last-child {
  border-right: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #ffffff;
}
.tax-deadlines-table tbody tr:nth-child(even) {
  background-color: #fafbfc;
}
.tax-deadlines-table tbody tr:last-child td {
  border-bottom: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr:hover {
  background-color: #f0f9ff;
}
.tax-deadlines-table td {
  padding: 1.25rem 1.75rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  vertical-align: top;
  text-align: left;
  border: 1px solid #e5e7eb;
  border-top: none;
}
.tax-deadline-date {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  min-width: 160px;
  font-size: 0.9375rem;
  letter-spacing: -0.01em;
  text-align: left;
}
.tax-deadline-description {
  color: #475569;
  font-weight: 400;
  text-align: left;
}
@media (max-width: 768px) {
  .tax-deadlines-table {
    border-radius: 10px;
    margin: 2rem 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);
  }
  .tax-deadlines-table th {
    padding: 1rem 1.25rem;
    font-size: 0.8125rem;
  }
  .tax-deadlines-table td {
    padding: 1rem 1.25rem;
    font-size: 0.875rem;
  }
  .tax-deadline-date {
    min-width: 140px;
    font-size: 0.875rem;
  }
}
@media (max-width: 640px) {
  .tax-deadlines-table {
    border-radius: 12px;
    border: none !important;
    box-shadow: none;
    background: transparent;
  }
  .tax-deadlines-table, .tax-deadlines-table thead, .tax-deadlines-table tbody, .tax-deadlines-table tr, .tax-deadlines-table th, .tax-deadlines-table td {
    display: block;
  }
  .tax-deadlines-table thead {
    display: none;
  }
  .tax-deadlines-table tbody tr {
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.25rem;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .tax-deadlines-table tbody tr:first-child td {
    border-top: none !important;
  }
  .tax-deadlines-table tbody tr td:first-child {
    border-left: none !important;
  }
  .tax-deadlines-table tbody tr td:last-child {
    border-right: none !important;
  }
  .tax-deadlines-table tbody tr:last-child td {
    border-bottom: none !important;
  }
  .tax-deadlines-table tbody tr:nth-child(even) {
    background-color: #ffffff;
  }
  .tax-deadlines-table tbody tr:hover {
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
    border-color: #2d4a2d;
  }
  .tax-deadlines-table td {
    padding: 0;
    border: none !important;
    text-align: left;
  }
  .tax-deadlines-table th {
    border: none !important;
  }
  .tax-deadline-date {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #2d4a2d;
    min-width: auto;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .tax-deadline-date::before {
    content: "\u{1F4C5}";
    font-size: 1.125rem;
    opacity: 0.8;
  }
  .tax-deadline-description {
    font-size: 0.9375rem;
    padding-left: 0;
    color: #475569;
    line-height: 1.7;
  }
}
@media print {
  .tax-deadlines-table {
    box-shadow: none;
    border: 2px solid #000;
    page-break-inside: avoid;
  }
  .tax-deadlines-table thead {
    background: #000 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .tax-deadlines-table th, .tax-deadlines-table td {
    border: 1px solid #000;
    text-align: left;
  }
  .tax-deadlines-table tbody tr {
    border-bottom: 1px solid #000;
    page-break-inside: avoid;
  }
  .tax-deadlines-table tbody tr:hover {
    background-color: transparent;
    transform: none;
    box-shadow: none;
  }
  .tax-deadlines-table tbody tr:nth-child(even) {
    background-color: #f5f5f5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`,document.head.appendChild(t),this.stylesInjected=!0}init(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.convert()):this.convert()}convert(){if(this.sourceList=document.querySelector(".cms-list-tax-deadlines"),!this.sourceList){console.warn("Tax deadlines list not found");return}let t=this.extractDeadlines();if(t.length===0){console.warn("No deadline items found");return}let e=this.createTable(t);this.replaceListWithTable(e)}extractDeadlines(){if(!this.sourceList)return[];let t=this.sourceList.querySelectorAll(".cms-item-taxdeadline"),e=[];return t.forEach(n=>{let a=n.querySelector(".text-weight-bold"),d=n.querySelector(".text-size-medium");a&&d&&e.push({date:a.textContent?.trim()||"",description:d.textContent?.trim()||""})}),e}createTable(t){let e=document.createElement("table");e.className="tax-deadlines-table",e.setAttribute("role","table"),e.setAttribute("aria-label","Tax deadlines for therapists");let n=document.createElement("thead"),a=document.createElement("tr"),d=document.createElement("th");d.textContent="Date",d.setAttribute("scope","col");let r=document.createElement("th");r.textContent="Deadline",r.setAttribute("scope","col"),a.appendChild(d),a.appendChild(r),n.appendChild(a),e.appendChild(n);let b=document.createElement("tbody");return t.forEach(c=>{let i=document.createElement("tr"),o=document.createElement("td");o.className="tax-deadline-date",o.textContent=c.date;let l=document.createElement("td");l.className="tax-deadline-description",l.textContent=c.description,i.appendChild(o),i.appendChild(l),b.appendChild(i)}),e.appendChild(b),e}replaceListWithTable(t){if(!this.sourceList)return;let e=this.sourceList.parentElement;if(!e){console.warn("Parent container not found");return}e.insertBefore(t,this.sourceList),this.sourceList.style.display="none",this.sourceList.setAttribute("data-converted-to-table","true")}};new s;})();
