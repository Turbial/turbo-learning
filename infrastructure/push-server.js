// infrastructure/push-server.js — standalone Expo + web push dispatch service.
// Run separately if you outgrow edge functions. Requires: npm i expo-server-sdk express
const express = require('express');
const { Expo } = require('expo-server-sdk');
const app = express(); app.use(express.json());
const expo = new Expo();

app.post('/push', async (req, res) => {
  const { tokens = [], title, body, data } = req.body;
  const messages = tokens.filter(t => Expo.isExpoPushToken(t))
    .map(to => ({ to, sound: 'default', title, body, data }));
  try {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const c of chunks) tickets.push(...await expo.sendPushNotificationsAsync(c));
    res.json({ ok: true, tickets });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});
app.listen(process.env.PORT || 8081, () => console.log('push-server up'));
