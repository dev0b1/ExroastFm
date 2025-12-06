#!/usr/bin/env node
const { Webhook } = require('standardwebhooks');
const axios = require('axios');

// Usage:
// DODO_WEBHOOK_SECRET=whsec_... TARGET_URL=http://localhost:5000/api/webhooks/payments SONG_ID=your_song_id node scripts/send_dodo_webhook.js

(async () => {
  const secret = process.env.DODO_WEBHOOK_SECRET || process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  const target = process.env.TARGET_URL || 'http://localhost:5000/api/webhooks/payments';
  const songId = process.env.SONG_ID || 'test-song-123';

  if (!secret) {
    console.error('Error: set DODO_WEBHOOK_SECRET (or DODO_PAYMENTS_WEBHOOK_KEY) env var');
    process.exit(1);
  }

  const webhook = new Webhook(secret);

  const payload = {
    type: 'payment.completed',
    data: {
      id: `test_tx_${Date.now()}`,
      amount: '4.99',
      currency: 'USD',
      status: 'paid',
      custom_data: {
        songId: songId,
        userId: null
      }
    }
  };

  const raw = JSON.stringify(payload);
  const msgId = `local-${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // sign expects (msgId, Date, payloadString)
  const signature = webhook.sign(msgId, new Date(timestamp * 1000), raw);

  const headers = {
    'Content-Type': 'application/json',
    'webhook-id': msgId,
    'webhook-timestamp': String(timestamp),
    'webhook-signature': signature,
  };

  console.log('POSTing signed webhook to', target);
  console.log('Headers:', headers);
  console.log('Payload:', payload);

  try {
    const res = await axios.post(target, raw, { headers });
    console.log('Response status:', res.status);
    console.log('Response data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    process.exit(2);
  }
})();
