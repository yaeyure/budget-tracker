const API_URL = 'https://script.google.com/macros/s/AKfycbyhM5WrwT-f04mA9Kqkm_8tqFPOAL2Y1W-ZHfA-B_rT3t4hz7ZarPOij7W6mCxb8ZDvuw/exec';

document.getElementById('expense-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    action: 'add',
    date: document.getElementById('date').value,
    category: document.getElementById('category').value,
    amount: document.getElementById('amount').value,
    note: document.getElementById('note').value,
  };

  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  document.getElementById('expense-form').reset();
  loadRecords();
});

async function loadRecords() {
  const res = await fetch(API_URL);
  const records = await res.json();
  const recordContainer = document.getElementById('records');
  const filter = document.getElementById('month-filter').value;
  recordContainer.innerHTML = '';

  let monthlyTotal = 0;

  records.forEach((record) => {
    if (filter && !record.date.startsWith(filter)) return;
    monthlyTotal += parseFloat(record.amount);

    const div = document.createElement('div');
    div.className = 'record';
    div.innerHTML = `
      <p><strong>日期：</strong>${record.date}</p>
      <p><strong>類別：</strong>${record.category}</p>
      <p><strong>金額：</strong>${record.amount}</p>
      <p><strong>備註：</strong>${record.note || ''}</p>
      <button onclick="deleteRecord(${record.rowIndex})">刪除</button>
    `;
    recordContainer.appendChild(div);
  });

  document.getElementById('monthly-total').textContent = `本月總支出：${monthlyTotal.toLocaleString()} 元`;
}

async function deleteRecord(rowIndex) {
  if (!confirm('確定要刪除這筆紀錄嗎？')) return;
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', rowIndex }),
    headers: { 'Content-Type': 'application/json' },
  });
  loadRecords();
}

document.getElementById('month-filter').addEventListener('change', loadRecords);
window.addEventListener('load', loadRecords);

function showView(view) {
  document.getElementById('records-view').style.display = view === 'records' ? 'block' : 'none';
  document.getElementById('report-view').style.display = view === 'report' ? 'block' : 'none';
  if (view === 'report') generateReport();
}

document.getElementById('report-month').addEventListener('change', generateReport);

async function generateReport() {
  const res = await fetch(API_URL);
  const records = await res.json();
  const selectedMonth = document.getElementById('report-month').value;
  const reportSummary = document.getElementById('report-summary');
  const ctx = document.getElementById('report-chart').getContext('2d');

  if (window.pieChart) window.pieChart.destroy();

  const filtered = records.filter(r => r.date.startsWith(selectedMonth));
  if (filtered.length === 0) {
    reportSummary.textContent = '該月份沒有支出資料。';
    return;
  }

  const categoryMap = {};
  let total = 0;
  filtered.forEach(r => {
    const amt = parseFloat(r.amount);
    total += amt;
    categoryMap[r.category] = (categoryMap[r.category] || 0) + amt;
  });

  reportSummary.textContent = `本月總支出：${total.toLocaleString()} 元`;

  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: [
          '#f39c12', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6',
          '#1abc9c', '#e67e22', '#34495e', '#7f8c8d'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}