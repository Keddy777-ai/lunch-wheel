const GAS_URL = "https://script.google.com/macros/s/AKfycby1WWi6LRmqQcRlbuJI5ku6KopR3ZLl0vpPoK_3LaWwHEAUV-IzRqR83cjUy52budzmmQ/exec"; // <--- 填入你的網址
const WRITE_TOKEN = "lunch-demo-2026";

const options = ["牛肉麵", "滷肉飯", "壽司", "拉麵", "披薩", "自助餐", "燒臘便當", "麥當勞"];
const colors = ["#FF6D60", "#F7D060", "#98D8AA", "#6499E9", "#F3E99F", "#FFB26B", "#FF8B8B", "#FAD4D4"];

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const saveBtn = document.getElementById('saveBtn');
const resultText = document.getElementById('resultText');
const modal = document.getElementById('modal');
const userNameInput = document.getElementById('userName');

let currentAngle = 0;
let isSpinning = false;
let selectedItem = "";

// 初始化繪製輪盤
function drawWheel() {
    const arc = (2 * Math.PI) / options.length;
    options.forEach((item, i) => {
        const angle = i * arc;
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.arc(200, 200, 190, angle, angle + arc);
        ctx.fill();
        ctx.save();
        
        // 繪製文字
        ctx.translate(200, 200);
        ctx.rotate(angle + arc / 2);
        ctx.fillStyle = "#333";
        ctx.font = "bold 18px Arial";
        ctx.fillText(item, 80, 10);
        ctx.restore();
    });
}

// 旋轉邏輯
spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    
    isSpinning = true;
    selectedItem = "";
    resultText.innerText = "正在決定午餐...";
    resultText.classList.remove('highlight');
    
    const spinDuration = 3500; // 3.5秒
    const extraDegrees = Math.floor(Math.random() * 360) + 1440; // 至少轉4圈
    const startTime = performance.now();
    const startAngle = currentAngle;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // 緩動函數 (Ease Out)
        const easing = 1 - Math.pow(1 - progress, 3);
        currentAngle = startAngle + (extraDegrees * easing);
        
        canvas.style.transform = `rotate(${currentAngle % 360}deg)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            finalizeSpin();
        }
    }
    requestAnimationFrame(animate);
});

function finalizeSpin() {
    isSpinning = false;
    // 計算指針對應的選項 (指針在上方，即 270度或 -90度位置)
    const normalizedAngle = (360 - (currentAngle % 360) + 270) % 360;
    const index = Math.floor(normalizedAngle / (360 / options.length));
    selectedItem = options[index];
    
    resultText.innerText = `今天就吃［${selectedItem}］！`;
    resultText.classList.add('highlight');
}

// 確認登記邏輯
saveBtn.addEventListener('click', () => {
    if (!selectedItem) return alert("請先抽籤！");
    modal.style.display = "block";
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    modal.style.display = "none";
});

document.getElementById('submitBtn').addEventListener('click', async () => {
    const name = userNameInput.value.trim();
    if (!name) return alert("請輸入姓名！");

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "讀取中...";

    const payload = {
        action: "log",
        token: WRITE_TOKEN,
        item: selectedItem,
        name: name,
        userAgent: navigator.userAgent
    };

    try {
        const response = await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors", // 注意：GAS POST 跨域通常需設為 no-cors，但無法讀取 return body
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // 由於 no-cors 限制，通常無法抓取 response。
        // 若您的 GAS 有正確處理 CORS，可以使用正常模式。
        alert("登記成功！");
        modal.style.display = "none";
        userNameInput.value = "";
    } catch (error) {
        alert("登記失敗：" + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "送出";
    }
});

drawWheel();
