
const apiUrl = "https://script.google.com/macros/s/AKfycbyj34nWakQmL4-bnKAjCYhzITzADZa_Sot6MCoShX7O8-t4k0kQBGMcVxQcolyESTqklQ/exec";
const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");
const monthFilter = document.getElementById("monthFilter");
const totalDisplay = document.getElementById("total");
const switchViewBtn = document.getElementById("switchView");
const viewTitle = document.getElementById("viewTitle");
const chartContainer = document.querySelector(".chart-container");
let currentView = "list";
let allRecords = [];
let chart;

async function loadRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        allRecords = data.slice(1).map((row, index) => ({ id: index + 2, date: row[0], category: row[1], amount: Number(row[2]), note: row[3] }));
        displayRecords();
    } catch (error) {
        console.error("讀取資料錯誤：", error);
    }
}

function displayRecords() {
    recordsContainer.innerHTML = "";
    chartContainer.style.display = "none";
    const selectedMonth = monthFilter.value;
    let total = 0;
    const filtered = allRecords.filter(record => {
        const recordMonth = record.date.slice(0, 7);
        return !selectedMonth || recordMonth === selectedMonth;
    });
    filtered.forEach(record => {
        total += record.amount;
        const div = document.createElement("div");
        div.classList.add("record");
        div.innerHTML = `
            <p><strong>日期：</strong>${record.date}</p>
            <p><strong>類別：</strong>${record.category}</p>
            <p><strong>金額：</strong>${record.amount}</p>
            <p><strong>備註：</strong>${record.note}</p>
            <button onclick="deleteRecord(${record.id})">刪除</button>
        `;
        recordsContainer.appendChild(div);
    });
    totalDisplay.textContent = `總支出：$${total}`;
}

async function deleteRecord(id) {
    await fetch(apiUrl + "?id=" + id, { method: "DELETE" });
    setTimeout(loadRecords, 1000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const note = document.getElementById("note").value;
    const data = { date, category, amount, note };
    await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors"
    });
    form.reset();
    setTimeout(loadRecords, 2000);
});

monthFilter.addEventListener("change", displayRecords);

switchViewBtn.addEventListener("click", () => {
    if (currentView === "list") {
        currentView = "chart";
        switchViewBtn.textContent = "切換為紀錄";
        viewTitle.textContent = "支出報表";
        renderChart();
    } else {
        currentView = "list";
        switchViewBtn.textContent = "切換為報表";
        viewTitle.textContent = "支出紀錄";
        displayRecords();
    }
});

function renderChart() {
    recordsContainer.innerHTML = "";
    chartContainer.style.display = "block";
    const selectedMonth = monthFilter.value;
    const filtered = allRecords.filter(record => {
        const recordMonth = record.date.slice(0, 7);
        return !selectedMonth || recordMonth === selectedMonth;
    });
    const totals = {};
    filtered.forEach(r => {
        totals[r.category] = (totals[r.category] || 0) + r.amount;
    });
    const labels = Object.keys(totals);
    const data = Object.values(totals);
    if (chart) chart.destroy();
    const ctx = document.getElementById("reportChart").getContext("2d");
    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "支出佔比",
                data: data,
                backgroundColor: [
                    "#a6a6d6", "#8ca6cc", "#a6b6d6", "#c6d6f2", "#9ea9d4"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

window.addEventListener("load", loadRecords);
