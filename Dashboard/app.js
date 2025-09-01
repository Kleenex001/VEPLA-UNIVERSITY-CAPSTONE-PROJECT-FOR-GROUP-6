/* app.js
  - Single shared script for all pages.
  - Detects page from document.body.dataset.page and initializes that page.
  - Provides: CRUD + localStorage + modals + CSV import/export + charts (Chart.js)
*/

(() => {
  // ---------- Utilities ----------
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const money = n => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

  // ---------- Data keys ----------
  const KEY_SALES = "vephla_sales_v1";
  const KEY_PROD  = "vephla_products_v1";
  const KEY_DEL   = "vephla_deliveries_v1";

  let sales = JSON.parse(localStorage.getItem(KEY_SALES) || "[]");
  let products = JSON.parse(localStorage.getItem(KEY_PROD) || "[]");
  let deliveries = JSON.parse(localStorage.getItem(KEY_DEL) || "[]");

  function saveAll(){
    localStorage.setItem(KEY_SALES, JSON.stringify(sales));
    localStorage.setItem(KEY_PROD, JSON.stringify(products));
    localStorage.setItem(KEY_DEL, JSON.stringify(deliveries));
  }

  // ---------- CSV helpers ----------
  function exportCSV(filename, rows){
    if(!rows || !rows.length){ alert("No data to export"); return; }
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  }

  function parseCSV(text){
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if(lines.length < 1) return [];
    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/^"|"$/g,""));
    const rows = lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g,""));
      const obj = {};
      headers.forEach((h,i) => obj[h] = values[i] ?? "");
      return obj;
    });
    return rows;
  }

  // ---------- Modal Utility ----------
  function openModal(id, mode="add", title){
    const modal = document.getElementById(id);
    if(!modal) return;
    if(title) modal.querySelector("h3") && (modal.querySelector("h3").textContent = title);
    modal.dataset.mode = mode;
    modal.style.display = "flex";
  }
  function closeModal(id){
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.style.display = "none";
    // reset forms inside
    modal.querySelectorAll("form").forEach(f => f.reset());
  }
  qsa("[data-close]").forEach(btn => btn.addEventListener("click", e => {
    const id = e.currentTarget.dataset.close;
    closeModal(id);
  }));

  // close modal by clicking overlay
  qsa(".modal").forEach(m => m.addEventListener("click", e => { if(e.target === m) m.style.display = "none"; }));

  // ---------- CHART helpers ----------
  let charts = {};
  function destroyChart(id){ if(charts[id]) { charts[id].destroy(); delete charts[id]; } }

  // ---------- PAGE INITIALIZERS ----------
  function initDashboard(){
    // KPIs
    const totalSalesNumber = sales.reduce((s,x)=>s + Number(x.amount || 0), 0);
    const expenses = Math.round(totalSalesNumber * 0.55);
    const profit = totalSalesNumber - expenses;
    qs("#kpiSales") && (qs("#kpiSales").textContent = money(totalSalesNumber));
    qs("#kpiExpenses") && (qs("#kpiExpenses").textContent = money(expenses));
    qs("#kpiProfit") && (qs("#kpiProfit").textContent = money(profit));
    qs("#kpiPending") && (qs("#kpiPending").textContent = deliveries.filter(d=>d.status!=="completed").length);

    // Top customers
    const byCustomer = {};
    sales.forEach(s => { byCustomer[s.customer] = (byCustomer[s.customer] || 0) + Number(s.amount || 0); });
    const top = Object.entries(byCustomer).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topEl = qs("#topCustomers");
    if(topEl){
      topEl.innerHTML = top.length ? top.map(t=>`<li>${t[0]} — <strong>${money(t[1])}</strong></li>`).join("") : "<li>No data</li>";
    }

    // Low stock list
    const low = products.filter(p => Number(p.stock) <= Number(p.reorder));
    const lowList = qs("#lowStockList");
    if(lowList) lowList.innerHTML = low.length ? low.map(p => `<li>${p.name} — ${p.stock} (reorder ${p.reorder})</li>`).join("") : "<li>All good</li>";

    // Sales chart (line)
    const salesByMonth = {}; // demo: group by month from dates
    sales.forEach(s => {
      const d = s.date ? new Date(s.date) : new Date();
      const key = d.toLocaleString('default',{month:"short", year:"numeric"});
      salesByMonth[key] = (salesByMonth[key]||0) + Number(s.amount || 0);
    });
    const labels = Object.keys(salesByMonth).slice(-8);
    const data = labels.map(l => salesByMonth[l] || 0);

    destroyChart("salesMain");
    const ctxS = qs("#salesMain");
    if(ctxS){
      charts["salesMain"] = new Chart(ctxS, {
        type:"line",
        data:{labels, datasets:[{label:"Sales", data, borderColor: getComputedStyle(document.documentElement).getPropertyValue("--accent") || "#0e8a70", fill:true, backgroundColor:"rgba(14,138,112,0.08)"}]},
        options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{callback: v => money(v)}}}
      });
    }

    // Overdue chart: simple values
    const overdueByMonth = {}; sales.forEach(s => { if(s.status === "overdue") { const d = s.date ? new Date(s.date) : new Date(); const k = d.toLocaleString('default',{month:"short", year:"numeric"}); overdueByMonth[k] = (overdueByMonth[k]||0) + Number(s.amount||0); }});
    const oLabels = Object.keys(overdueByMonth).slice(-8);
    const oData = oLabels.map(l=>overdueByMonth[l]||0);

    destroyChart("overdueMain");
    const ctxO = qs("#overdueMain");
    if(ctxO){
      charts["overdueMain"] = new Chart(ctxO, {
        type:"bar",
        data:{labels:oLabels, datasets:[{label:"Overdue", data:oData, backgroundColor: "rgba(230,126,34,0.9)"}]},
        options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{callback:v=>money(v)}}}}
      });
    }
  }

  // ---------- SALES page ----------
  function initSales(){
    const tableBody = qs("#salesTable tbody");
    const searchInput = qs("#salesSearch");
    const saleForm = qs("#saleForm");
    const saleModal = qs("#saleModal");
    let editIndex = null;

    function render(){
      if(!tableBody) return;
      const q = (searchInput && searchInput.value || "").toLowerCase();
      tableBody.innerHTML = sales.map((s,i) => ({...s, __i:i})).filter(r => JSON.stringify(r).toLowerCase().includes(q)).map((row, idx) => `
        <tr>
          <td>${idx+1}</td>
          <td>${row.orderId}</td>
          <td>${row.customer}</td>
          <td>${row.product}</td>
          <td>${money(row.amount)}</td>
          <td>${row.date}</td>
          <td>${row.status || "paid"}</td>
          <td class="row-actions">
            <button class="btn small" data-edit="${row.__i}">Edit</button>
            <button class="btn small outline" data-del="${row.__i}">Delete</button>
          </td>
        </tr>
      `).join("") || `<tr><td colspan="8" style="padding:12px">No sales yet</td></tr>`;
    }

    // open modal
    qs("#openAddSale")?.addEventListener("click", () => {
      editIndex = null;
      openModal("saleModal","add","Add Sale");
    });

    // handle edit/delete via delegation
    tableBody && tableBody.addEventListener("click", e => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if(edit){
        const idx = Number(edit.dataset.edit);
        const s = sales[idx];
        if(!s) return;
        editIndex = idx;
        openModal("saleModal","edit","Edit Sale");
        // populate
        const f = saleForm;
        f.orderId.value = s.orderId || "";
        f.customer.value = s.customer || "";
        f.product.value = s.product || "";
        f.amount.value = s.amount || "";
        f.date.value = s.date || "";
        f.status && (f.status.value = s.status || "paid");
      } else if(del){
        const idx = Number(del.dataset.del);
        if(confirm("Delete this sale?")){ sales.splice(idx,1); saveAll(); render(); }
      }
    });

    // submit form
    saleForm && saleForm.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(saleForm);
      const obj = {
        orderId: fd.get("orderId"),
        customer: fd.get("customer"),
        product: fd.get("product"),
        amount: Number(fd.get("amount") || 0),
        date: fd.get("date"),
        status: fd.get("status") || "paid"
      };
      if(editIndex !== null){ sales[editIndex] = obj; editIndex = null; }
      else { sales.push(obj); }
      saveAll(); render();
      closeModal("saleModal");
    });

    // search, export, import
    searchInput && searchInput.addEventListener("input", render);
    qs("#exportSalesBtn")?.addEventListener("click", ()=> exportCSV("sales.csv", sales));
    qs("#exportSalesBtn2")?.addEventListener("click", ()=> exportCSV("sales.csv", sales));
    qs("#importSales")?.addEventListener("change", e => {
      const file = e.target.files[0]; if(!file) return;
      const r = new FileReader(); r.onload = ev => {
        const parsed = parseCSV(ev.target.result);
        // normalized map to same shape
        const normalized = parsed.map(p => ({
          orderId: p.orderId || p["Order ID"] || p["orderId"] || "",
          customer: p.customer || p.Customer || "",
          product: p.product || p.Product || "",
          amount: Number(p.amount || p.Amount || 0),
          date: p.date || p.Date || "",
          status: p.status || p.Status || "paid"
        }));
        sales = sales.concat(normalized);
        saveAll(); render();
        alert("Sales imported");
      };
      r.readAsText(file);
    });

    render();
  }

  // ---------- PRODUCTS/INVENTORY ----------
  function initInventory(){
    const tableBody = qs("#productTable tbody");
    const searchInput = qs("#productSearch");
    const form = qs("#productForm");
    let editIndex = null;

    function render(){
      if(!tableBody) return;
      const q = (searchInput && searchInput.value || "").toLowerCase();
      tableBody.innerHTML = products.map((p,i)=>({...p,__i:i})).filter(r=>JSON.stringify(r).toLowerCase().includes(q)).map((row, idx)=>`
        <tr>
          <td>${idx+1}</td>
          <td>${row.name}</td>
          <td>${row.category||"—"}</td>
          <td>${row.stock}</td>
          <td>${row.reorder}</td>
          <td>${money(row.price)}</td>
          <td class="row-actions">
            <button class="btn small" data-edit="${row.__i}">Edit</button>
            <button class="btn small outline" data-del="${row.__i}">Delete</button>
          </td>
        </tr>
      `).join("") || `<tr><td colspan="7" style="padding:12px">No products</td></tr>`;
    }

    qs("#openAddProduct")?.addEventListener("click", ()=> { editIndex=null; openModal("productModal","add","Add Product"); });

    tableBody && tableBody.addEventListener("click", e => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if(edit){
        editIndex = Number(edit.dataset.edit);
        const p = products[editIndex];
        openModal("productModal","edit","Edit Product");
        form.name.value = p.name || "";
        form.category.value = p.category || "";
        form.stock.value = p.stock || 0;
        form.reorder.value = p.reorder || 0;
        form.price.value = p.price || 0;
      } else if(del){
        const idx = Number(del.dataset.del);
        if(confirm("Delete product?")){ products.splice(idx,1); saveAll(); render(); }
      }
    });

    form && form.addEventListener("submit", e=>{
      e.preventDefault();
      const fd = new FormData(form);
      const obj = {
        name: fd.get("name"),
        category: fd.get("category"),
        stock: Number(fd.get("stock")||0),
        reorder: Number(fd.get("reorder")||0),
        price: Number(fd.get("price")||0)
      };
      if(editIndex !== null){ products[editIndex]=obj; editIndex=null; }
      else { products.push(obj); }
      saveAll(); render(); closeModal("productModal");
    });

    searchInput && searchInput.addEventListener("input", render);
    qs("#exportProductsBtn")?.addEventListener("click", ()=> exportCSV("products.csv", products));
    qs("#importProducts")?.addEventListener("change", e=>{
      const file = e.target.files[0]; if(!file) return;
      const r = new FileReader(); r.onload = ev => {
        const parsed = parseCSV(ev.target.result);
        const normalized = parsed.map(p => ({
          name: p.name || p.Name || "",
          category: p.category || p.Category || "",
          stock: Number(p.stock || p.Stock || 0),
          reorder: Number(p.reorder || p.Reorder || 0),
          price: Number(p.price || p.Price || 0)
        }));
        products = products.concat(normalized); saveAll(); render(); alert("Products imported");
      };
      r.readAsText(file);
    });

    render();
  }

  // ---------- DELIVERIES ----------
  function initDeliveries(){
    const tableBody = qs("#deliveryTable tbody");
    const searchInput = qs("#deliverySearch");
    const form = qs("#deliveryForm");
    let editIndex = null;

    function render(){
      if(!tableBody) return;
      const q = (searchInput && searchInput.value || "").toLowerCase();
      tableBody.innerHTML = deliveries.map((d,i)=>({...d,__i:i})).filter(r=>JSON.stringify(r).toLowerCase().includes(q)).map((row, idx)=>`
        <tr>
          <td>${idx+1}</td>
          <td>${row.orderId}</td>
          <td>${row.customer}</td>
          <td>${row.mode || "—"}</td>
          <td>${money(row.worth)}</td>
          <td>${row.date}</td>
          <td>${row.status}</td>
          <td class="row-actions">
            <button class="btn small" data-edit="${row.__i}">Edit</button>
            <button class="btn small outline" data-del="${row.__i}">Delete</button>
          </td>
        </tr>
      `).join("") || `<tr><td colspan="8" style="padding:12px">No deliveries</td></tr>`;
    }

    qs("#openAddDelivery")?.addEventListener("click", ()=> { editIndex=null; openModal("deliveryModal","add","Add Delivery"); });

    tableBody && tableBody.addEventListener("click", e=>{
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if(edit){
        editIndex = Number(edit.dataset.edit);
        const d = deliveries[editIndex];
        openModal("deliveryModal","edit","Edit Delivery");
        const f = form;
        f.orderId.value = d.orderId || "";
        f.customer.value = d.customer || "";
        f.mode.value = d.mode || "";
        f.worth.value = d.worth || 0;
        f.date.value = d.date || "";
        f.status.value = d.status || "pending";
      } else if(del){
        const idx = Number(del.dataset.del);
        if(confirm("Delete delivery?")){ deliveries.splice(idx,1); saveAll(); render(); }
      }
    });

    form && form.addEventListener("submit", e=>{
      e.preventDefault();
      const fd = new FormData(form);
      const obj = {
        orderId: fd.get("orderId"),
        customer: fd.get("customer"),
        mode: fd.get("mode"),
        worth: Number(fd.get("worth")||0),
        date: fd.get("date"),
        status: fd.get("status") || "pending"
      };
      if(editIndex !== null){ deliveries[editIndex] = obj; editIndex = null; }
      else { deliveries.push(obj); }
      saveAll(); render(); closeModal("deliveryModal");
    });

    searchInput && searchInput.addEventListener("input", render);
    qs("#exportDeliveriesBtn")?.addEventListener("click", ()=> exportCSV("deliveries.csv", deliveries));
    qs("#importDeliveries")?.addEventListener("change", e=>{
      const file = e.target.files[0]; if(!file) return;
      const r = new FileReader(); r.onload = ev=>{
        const parsed = parseCSV(ev.target.result);
        const normalized = parsed.map(p => ({
          orderId: p.orderId || p["Order ID"] || "",
          customer: p.customer || p.Customer || "",
          mode: p.mode || p.Mode || "",
          worth: Number(p.worth || p.Worth || 0),
          date: p.date || p.Date || "",
          status: p.status || p.Status || "pending"
        }));
        deliveries = deliveries.concat(normalized); saveAll(); render(); alert("Deliveries imported");
      }; r.readAsText(file);
    });

    render();
  }

  // ---------- Customers / Suppliers simple renderers (demo) ----------
  function initCustomers(){
    const tbody = qs("#customerTable tbody");
    if(!tbody) return;
    // demo: derive customers from sales
    const map = {};
    sales.forEach(s => { map[s.customer] = map[s.customer] || {name:s.customer, contact:"—", balance:0, lastOrder:s.date}; map[s.customer].balance += Number(s.amount||0); if(new Date(s.date) > new Date(map[s.customer].lastOrder)) map[s.customer].lastOrder = s.date; });
    const arr = Object.values(map);
    tbody.innerHTML = arr.length ? arr.map((c,i)=>`<tr><td>${i+1}</td><td>${c.name}</td><td>${c.contact}</td><td>${money(c.balance)}</td><td>${c.lastOrder}</td></tr>`).join("") : `<tr><td colspan="5" style="padding:12px">No customers</td></tr>`;
    qs("#exportCustomersBtn")?.addEventListener("click", ()=> exportCSV("customers.csv", arr));
  }

  function initSuppliers(){
    const tbody = qs("#supplierTable tbody");
    if(!tbody) return;
    // demo placeholder: empty
    tbody.innerHTML = `<tr><td colspan="5" style="padding:12px">No suppliers yet</td></tr>`;
  }

  // ---------- Settings page ----------
  function initSettings(){
    qs("#exportAllBtn")?.addEventListener("click", ()=> {
      exportCSV("sales.csv", sales); exportCSV("products.csv", products); exportCSV("deliveries.csv", deliveries);
    });
    qs("#exportAllBtn2")?.addEventListener("click", ()=> { exportCSV("sales.csv", sales); exportCSV("products.csv", products); exportCSV("deliveries.csv", deliveries); });
    qs("#clearAllBtn")?.addEventListener("click", ()=> { if(confirm("Clear all data?")){ sales=[],products=[],deliveries=[]; saveAll(); location.reload(); }});
    qs("#clearAllBtn2")?.addEventListener("click", ()=> { if(confirm("Clear all data?")){ sales=[],products=[],deliveries=[]; saveAll(); location.reload(); }});
    qs("#clearAllBtn3")?.addEventListener("click", ()=> { if(confirm("Clear all data?")){ sales=[],products=[],deliveries=[]; saveAll(); location.reload(); }});
    qs("#clearAllBtn4")?.addEventListener("click", ()=> { if(confirm("Clear all data?")){ sales=[],products=[],deliveries=[]; saveAll(); location.reload(); }});
    qs("#clearAllBtnSettings")?.addEventListener("click", ()=> { if(confirm("Clear all data?")){ sales=[],products=[],deliveries=[]; saveAll(); location.reload(); }});

    // import all (json)
    qs("#importAll")?.addEventListener("change", e=>{
      const f = e.target.files[0]; if(!f) return;
      const r = new FileReader(); r.onload = ev => {
        try{
          const data = JSON.parse(ev.target.result);
          sales = data.sales || sales; products = data.products || products; deliveries = data.deliveries || deliveries; saveAll(); alert("Imported"); location.reload();
        }catch(err){ alert("Invalid JSON"); }
      }; r.readAsText(f);
    });
  }

  // ---------- Router (which page to init) ----------
  function bootstrap(){
    const page = document.body.dataset.page || (location.pathname.includes("sales") ? "sales" : "dashboard");
    // wire common global actions
    qsa(".nav").forEach(a => { if(a.href && a.href.endsWith(location.pathname.split("/").pop())) a.classList.add("active"); });

    // Initialize according to page
    if(page === "dashboard") initDashboard();
    if(page === "sales") initSales();
    if(page === "inventory") initInventory();
    if(page === "deliveries") initDeliveries();
    if(page === "customers") initCustomers();
    if(page === "suppliers") initSuppliers();
    if(page === "settings") initSettings();

    // Setup any universal modal close buttons inside DOM (dynamic pages)
    qsa(".modal-close").forEach(btn => {
      btn.addEventListener("click", e => { const id = btn.dataset.close || btn.getAttribute("data-close"); if(id) closeModal(id); });
    });
  }

  // run on DOM ready
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap);
  else bootstrap();

})();
// Sign up form validation and submission
