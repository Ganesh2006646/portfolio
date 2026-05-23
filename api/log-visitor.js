// Vercel Serverless Function — Visitor Logging Endpoint
// Logs chatbot visitor info (name, role) to Google Sheets via Apps Script

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxCHxg0WPzIscoH2Zw3ML8V4g_G9wR0FCDZt2-EDZHmgkhJRKbJH9BVl69QxQrze9A4RA/exec';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, role } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing visitor name' });
  }

  try {
    // Forward to Google Apps Script
    const payload = new URLSearchParams({
      name: name.trim(),
      role: (role || 'Not specified').trim(),
      source: 'chatbot',
      timestamp: new Date().toISOString(),
    });

    await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
      redirect: 'follow',
    });

    console.log(`[Visitor Log] Name: ${name}, Role: ${role}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Visitor Log Error:', error);
    // Don't fail the user experience — log silently
    return res.status(200).json({ success: true });
  }
};
