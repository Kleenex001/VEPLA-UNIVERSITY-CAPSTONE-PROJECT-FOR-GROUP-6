
// Fetch Data from Backend API

async function fetchDataFromAPI() {
  try {
    const res = await fetch("/api/dashboard"); // 🔗 replace with your endpoint
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return await res.json();
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return null;
  }
}


// Chart.js Helpers

function createLineChart(ctx, labels, data, color) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "",
          data,
          fill: true,
          tension: 0.4,
          borderColor: color,
          backgroundColor: color + "33",
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } },
    },
  });
}

let salesChart, paymentChart, sparkSales, sparkOwed, sparkDelivery;


// Render Functions

function updateKPIs(kpis) {
  document.getElementById("totalSales").textContent = kpis.totalSales.toLocaleString();
  document.getElementById("totalOwed").textContent = kpis.totalOwed.toLocaleString();
  document.getElementById("totalDelivery").textContent = kpis.totalDelivery.toLocaleString();

  // Sparklines
  if (sparkSales) sparkSales.destroy();
  if (sparkOwed) sparkOwed.destroy();
  if (sparkDelivery) sparkDelivery.destroy();

  sparkSales = createLineChart(
    document.getElementById("sparkSales").getContext("2d"),
    kpis.salesTrend.labels,
    kpis.salesTrend.data,
    "#009879"
  );
  sparkOwed = createLineChart(
    document.getElementById("sparkOwed").getContext("2d"),
    kpis.owedTrend.labels,
    kpis.owedTrend.data,
    "#ff5722"
  );
  sparkDelivery = createLineChart(
    document.getElementById("sparkDelivery").getContext("2d"),
    kpis.deliveryTrend.labels,
    kpis.deliveryTrend.data,
    "#2196f3"
  );
}

function updateCharts(sales, payments) {
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  const paymentCtx = document.getElementById("paymentChart").getContext("2d");

  if (salesChart) salesChart.destroy();
  if (paymentChart) paymentChart.destroy();

  salesChart = createLineChart(salesCtx, sales.monthly.labels, sales.monthly.data, "#009879");
  paymentChart = createLineChart(paymentCtx, payments.monthly.labels, payments.monthly.data, "#ff9800");

  // Tabs
  document.querySelectorAll("#salesTabs button").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll("#salesTabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      updateChart(salesChart, sales[view].labels, sales[view].data);
    };
  });

  document.querySelectorAll("#paymentTabs button").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll("#paymentTabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      updateChart(paymentChart, payments[view].labels, payments[view].data);
    };
  });
}

function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function updateSidebar(data) {
  document.getElementById("quickStats").innerHTML = data.quickStats.map((s) => `<li>${s}</li>`).join("");
  document.getElementById("pendingOrdersList").innerHTML = data.pendingOrders.map((o) => `<li>${o}</li>`).join("");
  document.getElementById("lowStockList").innerHTML = data.lowStock.map((l) => `<li>${l}</li>`).join("");
  document.getElementById("topCustomers").innerHTML = data.topCustomers
    .map((c) => `<li>${c.name} <span>${c.amount}</span></li>`)
    .join("");
}


// Main Renderer

async function renderDashboard() {
  const data = await fetchDataFromAPI();
  if (!data) return;

  updateKPIs(data.kpis);
  updateCharts(data.sales, data.payments);
  updateSidebar(data);
}


// Init

document.addEventListener("DOMContentLoaded", renderDashboard);
