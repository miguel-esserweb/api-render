const puppeteer = require("puppeteer");

async function getClientPdfContent(result) {
  // Para evitar error timeout 30000 ms al generar el pdf
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  //   const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const formatted = (date) => {
    const dateObject = new Date(date);
    const formattedDate = `${dateObject.getDate().toString().padStart(2, "0")}/${(dateObject.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${dateObject.getFullYear()}`;
    return formattedDate;
  };

  const formattedSymbol = (value, symbol, position, spaced) => {
    if (position === "left") {
      if (spaced) {
        return `${symbol} ${value}`;
      } else {
        return `${symbol}${value}`;
      }
    } else {
      if (spaced) {
        return `${value} ${symbol}`;
      } else {
        return `${value}${symbol}`;
      }
    }
  };

  const reportHtml = `
  <html>
  <head>
    <title>Sample Report</title>
    <style>
          body {
          margin: 0px auto;
          font-family: "Inter", sans-serif;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        svg {
          width: 200px;
          height: auto;
        }
        .data-account{
          display: flex;
          flex-direction: column;
          align-items: end;
        }
        .account-state {
          font-size: 20px;
          line-height: 28px;
          font-weight: 700;
          margin-top: 0px;
          margin-bottom: 0px;
        }
        .account-name {
          font-size: 18px;
          line-height: 28px;
          font-weight: 600;
          margin: 0px;
        }
        .account-amount {
          text-align: left;
          font-size: 18px;
          line-height: 28px;
          font-weight: 500;
          margin: 0px;
        }
  
        .subheader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        .status-account {
          font-size: 16px;
          font-weight: 400;
        }
        .datetime {
          font-size: 16px;
          font-weight: 400;
        }
        .box-grid {
          margin-top: 55px;
          grid-gap: 10px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
  
        .box-grid div {
          border-radius: 12px;
          width: 100%;
          height: 100px;
          background-color: #f1f5f9;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .box-grid div p {
          font-weight: 600;
          margin: 5px;
          padding: 0px 15px;
        }
        .box-grid div span {
          margin: 5px;
          padding: 0px 15px;
        }
  
        span {
          color: #4237ca;
        }
  
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th,
        td {
          padding: 8px;
          text-align: left;
        }
        th {
          font-size: 12px;
          padding: 12px 0px;
          background-color: #e2e7f0;
        }
        th:first-child {
          border-radius: 10px 0px 0px 10px;
          padding: 0px 10px;
        }
        th:last-child {
          border-radius: 0px 10px 10px 0px;
          text-align: right;
          padding: 0px 10px;
        }
  
        tr.content-table td {
          font-size: 14px;
          height: 22px;
        }
        tr.content-table:nth-child(odd){
              background-color: #f2f6fa;
          } 
        tr.content-table td:first-child {
          border-radius: 10px 0px 0px 10px;
          padding: 0px 10px;
        }
        tr.content-table td:last-child {
          border-radius: 0px 10px 10px 0px;
          text-align: right;
          padding: 0px 10px;
        }
    </style>
  </head>
    <body>
      <header>
        <svg
          aria-hidden="true"
          fill="#1D1B4B"
          focusable="false"
          role="presentation"
          viewBox="0 0 285.84 66.91"
        >
          <path
            d="M55.13 1.04c-.39-.39-.93-.61-1.49-.61H18.03C8.07.43 0 8.47 0 18.39v.1c.06 9.88 8.1 17.86 18.02 17.86h5.82l-1.51-.76-.01-.01c-.14-.06-.27-.13-.41-.2l-.2-.1c-2.82-1.52-4.75-4.49-4.75-7.91 0-4.52 3.34-8.25 7.68-8.88h46.91c.4 0 .6-.48.32-.77L55.13 1.04Z"
          />
          <path
            d="M53.72 24.26H47.9l1.56.78c.03.01.06.03.09.04l.55.27c2.8 1.53 4.7 4.49 4.7 7.88 0 4.52-3.34 8.25-7.68 8.88H1.08c-.73 0-1.09.88-.58 1.39l16.24 16.18c.32.32.75.49 1.2.49h35.78c9.96 0 18.03-8.04 18.03-17.96v-.1c-.06-9.88-8.1-17.86-18.03-17.86"
            fill="#00DA8D"
          />
          <path
            d="M105.26 60.23c-3.69 0-6.62-1.24-8.79-3.72-2.17-2.45-3.25-5.66-3.25-9.61s1.1-7.13 3.29-9.54c2.17-2.43 5.07-3.64 8.72-3.64 2.79 0 5.22.74 7.29 2.22 2.02 1.45 3.24 3.43 3.67 5.93h-3.55c-.4-1.64-1.23-2.92-2.51-3.82-1.27-.9-2.86-1.36-4.75-1.36-2.69 0-4.8.91-6.32 2.72-1.52 1.81-2.28 4.31-2.28 7.5s.76 5.75 2.28 7.59c1.52 1.85 3.63 2.77 6.32 2.77 2.14 0 3.88-.59 5.22-1.77s2.16-2.89 2.49-5.13h3.44c-.45 3.07-1.67 5.48-3.67 7.24-2 1.75-4.53 2.63-7.59 2.63ZM137.28 57.19h.56v2.43h-1.83c-2.07 0-3.18-.9-3.33-2.72-.67.98-1.62 1.75-2.84 2.32-1.22.57-2.61.86-4.15.86-2.02 0-3.6-.47-4.75-1.41s-1.72-2.26-1.72-3.95c0-3.29 2.19-5.2 6.58-5.75l4.94-.61c.92-.09 1.38-.56 1.38-1.39v-.79c0-1.9-1.45-2.86-4.34-2.86-1.45 0-2.51.25-3.2.75-.69.5-1.08 1.35-1.18 2.54H120c.32-4 3.01-6 8.04-6s7.56 1.97 7.56 5.9v9.08c0 .6.12 1.01.37 1.25s.69.36 1.31.36Zm-10.96.36c1.57 0 2.93-.44 4.08-1.32 1.15-.88 1.72-1.9 1.72-3.07v-2.57l-5.76.82c-2.49.36-3.74 1.42-3.74 3.18 0 .93.33 1.66.99 2.18.66.52 1.57.79 2.71.79ZM149.96 40.79c2.49 0 4.5.83 6.02 2.5 1.52 1.67 2.28 3.9 2.28 6.68 0 2.93-.76 5.34-2.28 7.22-1.52 1.88-3.58 2.82-6.17 2.82-2.42 0-4.33-.88-5.72-2.64v9.54h-3.44V41.18h2.99v2.97c.6-1.02 1.45-1.84 2.56-2.45 1.11-.61 2.36-.91 3.76-.91Zm-4.49 14.51c1.02 1.26 2.36 1.89 4 1.89s2.96-.67 3.93-2c.95-1.33 1.42-3.07 1.42-5.22s-.46-3.62-1.38-4.72c-.92-1.1-2.24-1.64-3.97-1.64s-3.05.57-4.06 1.72-1.52 2.76-1.52 4.86.52 3.85 1.57 5.11ZM165.64 37.72h-3.44v-3.54h3.44v3.54Zm0 21.9h-3.44V41.18h3.44v18.44ZM179.93 43.72l-4.41-.14v11.51c0 .69.13 1.16.39 1.41s.75.38 1.48.38h2.51v2.75h-3.52c-1.5 0-2.59-.33-3.27-.98-.69-.65-1.03-1.7-1.03-3.13V43.59l-2.88.14v-2.54l2.88.11v-5.75h3.44v5.79l4.41-.14v2.54ZM200.13 57.19h.56v2.43h-1.83c-2.07 0-3.18-.9-3.33-2.72-.67.98-1.62 1.75-2.84 2.32-1.22.57-2.61.86-4.15.86-2.02 0-3.6-.47-4.75-1.41s-1.72-2.26-1.72-3.95c0-3.29 2.19-5.2 6.58-5.75l4.94-.61c.92-.09 1.38-.56 1.38-1.39v-.79c0-1.9-1.45-2.86-4.34-2.86-1.45 0-2.51.25-3.2.75-.69.5-1.08 1.35-1.18 2.54h-3.4c.32-4 3.01-6 8.04-6s7.56 1.97 7.56 5.9v9.08c0 .6.12 1.01.37 1.25s.69.36 1.31.36Zm-10.96.36c1.57 0 2.93-.44 4.08-1.32 1.15-.88 1.72-1.9 1.72-3.07v-2.57l-5.76.82c-2.49.36-3.74 1.42-3.74 3.18 0 .93.33 1.66.99 2.18.66.52 1.57.79 2.71.79ZM206.94 59.62h-3.44V34.18h3.44v25.44ZM218.28 34.18h10.96c2.67 0 4.76.63 6.28 1.89 1.52 1.26 2.28 3.06 2.28 5.4s-.76 4.29-2.28 5.59c-1.52 1.3-3.64 1.95-6.36 1.95h-7.41v10.61h-3.48V34.18Zm3.48 11.93h7.48c1.6 0 2.84-.4 3.74-1.2s1.35-1.94 1.35-3.41c0-2.95-1.76-4.43-5.27-4.43h-7.29v9.04ZM244.91 59.62h-3.44V34.18h3.44v25.44ZM262.76 51.44V41.19h3.44v18.44h-3.22v-2.61c-1.4 2.05-3.55 3.07-6.47 3.07-2.05 0-3.65-.54-4.81-1.61-1.16-1.07-1.74-2.57-1.74-4.5V41.19h3.44v12.15c0 2.6 1.28 3.89 3.85 3.89 1.62 0 2.94-.48 3.97-1.45 1.02-.96 1.53-2.41 1.53-4.34ZM277.8 60.09c-4.91 0-7.59-2.1-8.04-6.29h3.29c.17 1.26.66 2.19 1.46 2.77.8.58 1.95.88 3.44.88s2.64-.25 3.42-.75 1.18-1.22 1.18-2.14c0-1.38-1.01-2.28-3.03-2.68l-3.89-.79c-3.57-.71-5.35-2.38-5.35-5 0-1.67.62-2.97 1.87-3.91s3.02-1.41 5.31-1.41 4.08.49 5.44 1.46c1.36.98 2.16 2.42 2.41 4.32h-3.4c-.37-2.12-1.9-3.18-4.56-3.18s-3.89.81-3.89 2.43c0 .64.23 1.16.69 1.55.46.39 1.23.7 2.3.91l3.74.79c1.95.43 3.37 1.07 4.28 1.91.91.85 1.37 1.95 1.37 3.31 0 1.81-.71 3.23-2.13 4.27-1.42 1.04-3.39 1.55-5.91 1.55ZM108.59 25.66c-1.52 1.45-3.64 2.17-6.36 2.17s-4.85-.72-6.32-2.17c-1.52-1.45-2.28-3.47-2.28-6.06v-2.36h5.24v2.43c0 2.25 1.08 3.37 3.25 3.37s3.18-1.12 3.18-3.37V.6h5.54v19c0 2.59-.75 4.61-2.24 6.06ZM122.06.6v21.7h12.98v4.94h-18.52V.6h5.54ZM148.62 28.09c-3.44 0-6.17-.81-8.17-2.43-2.01-1.62-3.05-3.85-3.12-6.7h5.42c.08 1.47.62 2.61 1.65 3.4 1.02.8 2.42 1.2 4.19 1.2 1.52 0 2.72-.29 3.59-.88.87-.59 1.31-1.4 1.31-2.45 0-.87-.31-1.54-.94-2-.62-.46-1.67-.88-3.14-1.25l-4.9-1.23c-2.09-.52-3.71-1.42-4.84-2.69-1.14-1.27-1.7-2.84-1.7-4.71 0-2.32.86-4.29 2.58-5.91 1.7-1.62 4.15-2.43 7.37-2.43s5.79.8 7.71 2.39c1.92 1.62 2.97 3.74 3.14 6.36h-5.39c-.17-1.32-.75-2.36-1.72-3.11s-2.21-1.12-3.7-1.12c-1.35 0-2.42.3-3.22.9-.8.6-1.2 1.37-1.2 2.32 0 1.47 1.03 2.47 3.11 2.99l5.31 1.31c4.84 1.17 7.26 3.73 7.26 7.67 0 2.59-.94 4.64-2.82 6.13-1.88 1.5-4.47 2.25-7.76 2.25Z"
          />
        </svg>
        <div class="data-account">
          <p class="account-state">Estado de cuenta</p>
          <p class="account-name">Jose luis Rodriguez</p>
          <p class="account-amount">saldo actual: <span>$0.00</span></p>
        </div>
      </header>
      <div class="subheader">
        <div class="status-account">Operaciones de los últimos 30 días</div>
        <div class="datetime">Fecha: 06/08/2024</div>
      </div>
      <table>
        <tr class="header-table">
          <th>ID</th>
          <th>FECHA</th>
          <th>TIPO</th>
          <th>MONTO</th>
          <th>TASA</th>
          <th>ENTRADA</th>
          <th>SALIDA</th>
          <th>TOTAL</th>
        </tr>
         ${result.data
           .map(
             (item) =>
               `<tr class="content-table">
              <td>${item.id}</td>
              <td>${formatted(item.operationDate)}</td>
              <td class="type">${item.operationType}</td>
              <td>${formattedSymbol(
                item.amount,
                item.amountCurrency.symbol,
                item.amountCurrency.position,
                item.amountCurrency.spaced
              )}</td>
              <td>${item.definitiveRate}</td>
              <td>${
                !item.amountReceived
                  ? "-"
                  : formattedSymbol(
                      item.amountReceived,
                      item.receivedCurrency.symbol,
                      item.receivedCurrency.position,
                      item.receivedCurrency.spaced
                    )
              }</td>
              <td>${
                !item.amountSent
                  ? "-"
                  : formattedSymbol(
                      item.amountSent,
                      item.emitterCurrency.symbol,
                      item.emitterCurrency.position,
                      item.emitterCurrency.spaced
                    )
              }</td>
              <td>${item.balance}</td>
            </tr>`
           )
           .join("")}
      </table>
      <div class="box-grid">
        <div>
          <p>Compras</p>
          <span>${result.buy}</span>
        </div>
        <div>
          <p>Ventas</p>
          <span>${result.sell}</span>
        </div>
        <div>
          <p>Cambios</p>
          <span>${result.changes}</span>
        </div>
      </div>
      <script>
        const tableCells = document.querySelectorAll(".content-table .type");

        tableCells.forEach((cell) => {
          if(cell.textContent.trim() === "Venta"){
            cell.style.color = "#ef4444";
          }
          else if(cell.textContent.trim() === "Cambio"){
            cell.style.color = "#3b82f6";
          }
          else if(cell.textContent.trim() === "Retiro"){
            cell.style.color = "#eab308";
          }else{
            cell.style.color = "#22c55e";
          }
        });
      </script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
      </style>
    </body>
  </html>
    `;

  await page.setContent(reportHtml);
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { left: "0.8cm", top: "0.8cm", bottom: "1.2cm", right: "0.8cm" },
    displayHeaderFooter: true,
    footerTemplate: `<div style="font-size: 15px; width: 100%;
        text-align: center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  });

  await browser.close();

  return pdf;
}

module.exports = getClientPdfContent;
