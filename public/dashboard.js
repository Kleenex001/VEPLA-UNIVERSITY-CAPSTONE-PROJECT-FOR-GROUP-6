// ==========================
// Dashboard Data Simulation
// ==========================

// Example monthly data
const salesMonthly = [34000, 32000, 33000, 31000, 35000, 30000, 34000, 36000];
const paymentMonthly = [33000, 31000, 32000, 30000, 34000, 29000, 33000, 31000];

// Example yearly data
const salesYearly = [120000, 150000, 140000, 160000, 180000, 200000];
const paymentYearly = [90000, 95000, 100000, 110000, 115000, 120000];

// Labels
const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const yearlyLabels = ["2019", "2020", "2021", "2022", "2023", "2024"];

// ==========================
// Chart.js Utility
// ==========================
function createGradient(ctx, chartArea, color) {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, `${color}00`); // transparent
  gradient.addColorStop(0.5, `${color}80`); // semi-transparent
  gradient.addColorStop(1, `${color}FF`); // solid
  return gradient;
}

function createLineChart(ctx, labels, data, color) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "",
          data: data,
          fill: true,
          tension: 0.4,
          borderColor: color,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            return createGradient(ctx, chartArea, color);
          },
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f0f0" },
        },
      },
    },
  });
}

// ==========================
// Initialize Charts
// ==========================
let salesChart, paymentChart;

function initCharts() {
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  const paymentCtx = document.getElementById("paymentChart").getContext("2d");

  salesChart = createLineChart(salesCtx, monthlyLabels, salesMonthly, "#009879");
  paymentChart = createLineChart(paymentCtx, monthlyLabels, paymentMonthly, "#ff9800");
}

function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// ==========================
// Tabs Switching (Monthly/Yearly)
// ==========================
function setupTabs() {
  const salesTabs = document.querySelectorAll("#salesTabs button");
  const paymentTabs = document.querySelectorAll("#paymentTabs button");

  salesTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      salesTabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.view === "monthly") {
        updateChart(salesChart, monthlyLabels, salesMonthly);
      } else {
        updateChart(salesChart, yearlyLabels, salesYearly);
      }
    });
  });

  paymentTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      paymentTabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.view === "monthly") {
        updateChart(paymentChart, monthlyLabels, paymentMonthly);
      } else {
        updateChart(paymentChart, yearlyLabels, paymentYearly);
      }
    });
  });
}

// ==========================
// Dashboard Stats Population
// ==========================
function populateDashboard() {
  // KPIs
  document.getElementById("totalSales").textContent = "34,000";
  document.getElementById("totalExpenses").textContent = "34,000";
  document.getElementById("totalProfit").textContent = "34,000";

  // Quick Stats
  const quickStats = ["Tomato Rice #56,000", "Tomato Rice #56,000", "Tomato Rice #56,000"];
  document.getElementById("quickStats").innerHTML = quickStats
    .map((item, i) => `<li>${i + 1}. ${item}</li>`)
    .join("");

  // Pending Orders
  const pendingOrders = ["Tomato Rice #56,000", "Tomato Rice #56,000", "Tomato Rice #56,000"];
  document.getElementById("pendingOrdersList").innerHTML = pendingOrders
    .map((item, i) => `<li>${i + 1}. ${item}</li>`)
    .join("");

  // Low Stock
  const lowStock = ["Tomato Rice #56,000", "Tomato Rice #56,000", "Tomato Rice #56,000"];
  document.getElementById("lowStockList").innerHTML = lowStock
    .map((item, i) => `<li>${i + 1}. ${item}</li>`)
    .join("");

  // Top Customers
  const topCustomers = [
    { name: "John Doe Sam", amount: "#500,000" },
    { name: "John Doe Sam", amount: "#500,000" },
    { name: "John Doe Sam", amount: "#500,000" },
  ];
  document.getElementById("topCustomers").innerHTML = topCustomers
    .map((c) => `<li>${c.name} <span>${c.amount}</span></li>`)
    .join("");
}
function createSparkline(ctx, data, color) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [{
        data: data,
        borderColor: color,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

// Example sparkline data
createSparkline(document.getElementById("sparkSales"), [32, 35, 30, 34, 38, 40], "#009879");
createSparkline(document.getElementById("sparkExpenses"), [28, 30, 34, 32, 36, 34], "#f4b400");
createSparkline(document.getElementById("sparkProfit"), [10, 15, 20, 18, 25, 22], "#34a853");

// ==========================
// Init on DOM Ready
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  initCharts();
  setupTabs();
  populateDashboard();
});
