//https://script.google.com/macros/s/AKfycbzWF2iYrp7gQxxDeQmmTRxDfLClRGIL5twTiFsMEYbfYhSBZu-cTMOsPA4at8qyX3GoIw/exec
const apiUrl = "https://script.google.com/macros/s/AKfycbzWF2iYrp7gQxxDeQmmTRxDfLClRGIL5twTiFsMEYbfYhSBZu-cTMOsPA4at8qyX3GoIw/exec"; // 替換為你的 API 網址

const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");

// 讀取 Google Sheets 的記帳紀錄並顯示
async function loadRecords() {
    try {
        const response = await fetch(apiUrl); // `GET` 請求 API
        const data = await response.json();   // 解析 JSON

        recordsContainer.innerHTML = ""; // 清空舊資料

        for (let i = 1; i < data.length; i++) { // 跳過標題列
            const [date, category, amount, note] = data[i];

            const recordElement = document.createElement("div");
            recordElement.classList.add("record");
            recordElement.innerHTML = `
                <p><strong>日期：</strong>${date}</p>
                <p><strong>類別：</strong>${category}</p>
                <p><strong>金額：</strong>${amount}</p>
                <p><strong>備註：</strong>${note}</p>
            `;
            recordsContainer.appendChild(recordElement);
        }
    } catch (error) {
        console.error("讀取紀錄時發生錯誤：", error);
    }
}

// 新增記帳資料
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const note = document.getElementById("note").value;

    const newRecord = { date, category, amount, note };

    await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(newRecord),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors"  // 避免 CORS 錯誤
    });

    form.reset();
    alert("記帳成功！（請到 Google Sheets 查看資料）");

    // **重新載入紀錄，確保新資料即時顯示**
    setTimeout(loadRecords, 2000); // 等 2 秒後重新載入資料
});

// **網頁載入時自動載入記帳紀錄**
window.addEventListener("load", loadRecords);
