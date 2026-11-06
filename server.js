require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase if credentials are provided
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('⚡ Connected to Supabase Cloud Database');
  } catch (err) {
    console.warn('Supabase initialization warning:', err.message);
  }
} else {
  console.log('ℹ️  Supabase credentials not detected; using local storage fallback');
}

// Telegram Bot Notification Settings
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  console.log('⚡ Telegram Bot Notification Dispatcher: ACTIVE');
} else {
  console.log('ℹ️  Telegram credentials not detected (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)');
}

// Helper to send instant notification via Telegram Bot API
async function sendTelegramNotification(entry) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return false;
  }

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const text = [
    `📬 <b>New Portfolio Message!</b>`,
    ``,
    `👤 <b>Name:</b> ${escapeHtml(entry.name)}`,
    `📧 <b>Email:</b> <code>${escapeHtml(entry.email)}</code>`,
    `📌 <b>Subject:</b> ${escapeHtml(entry.subject)}`,
    ``,
    `💬 <b>Message:</b>`,
    `${escapeHtml(entry.message)}`,
    ``,
    `🕒 <b>Received:</b> ${new Date(entry.receivedAt).toLocaleString()}`,
    `🌐 <b>IP:</b> <code>${escapeHtml(entry.ip || 'Unknown')}</code>`
  ].join('\n');

  try {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    if (result.ok) {
      console.log(`[Telegram] Message forwarded successfully to chat ${TELEGRAM_CHAT_ID}`);
      return true;
    } else {
      console.warn('[Telegram] API error:', result.description);
      return false;
    }
  } catch (err) {
    console.warn('[Telegram] Network dispatch error:', err.message);
    return false;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read JSON data safely
let memoryMessages = [];

function readJsonFile(filePath, defaultData = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
    const tmpPath = path.join('/tmp', path.basename(filePath));
    if (fs.existsSync(tmpPath)) {
      const raw = fs.readFileSync(tmpPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultData;
}

// Helper to write JSON data safely (handles Vercel read-only filesystem via /tmp)
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn(`Write to ${filePath} failed (${err.message}), attempting /tmp fallback...`);
    try {
      const tmpPath = path.join('/tmp', path.basename(filePath));
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (tmpErr) {
      memoryMessages = data;
      return true;
    }
  }
}

// ---------------- API ROUTES ----------------

// GET /api/profile - Full profile, skills, experiences, projects
app.get('/api/profile', (req, res) => {
  const profilePath = path.join(__dirname, 'data', 'profile.json');
  const profile = readJsonFile(profilePath, {});
  res.json(profile);
});

// GET /api/projects - Projects catalog
app.get('/api/projects', (req, res) => {
  const profilePath = path.join(__dirname, 'data', 'profile.json');
  const profile = readJsonFile(profilePath, {});
  const category = req.query.category;
  let projects = profile.projects || [];
  if (category && category !== 'All') {
    projects = projects.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }
  res.json(projects);
});

// GET /api/stats - Dynamic system & portfolio metrics
app.get('/api/stats', (req, res) => {
  const messagesPath = path.join(__dirname, 'data', 'messages.json');
  const messages = readJsonFile(messagesPath, []);
  res.json({
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    messagesCount: messages.length,
    status: 'online',
    database: supabase ? 'Supabase PostgreSQL (Connected)' : 'Local JSON Storage',
    telegramEnabled: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
    serverTimestamp: new Date().toISOString()
  });
});

// POST /api/contact - Receive and save contact inquiries (Supabase + Local fallback)
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Please fill in all required fields (name, email, and message).'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address.'
    });
  }

  const newEntry = {
    id: 'msg_' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: (subject || 'General Inquiry').trim(),
    message: message.trim(),
    receivedAt: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  };

  let savedToSupabase = false;

  // Insert to Supabase PostgreSQL table if client is initialized
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            name: newEntry.name,
            email: newEntry.email,
            subject: newEntry.subject,
            message: newEntry.message,
            received_at: newEntry.receivedAt,
            ip: String(newEntry.ip || '')
          }
        ]);

      if (error) {
        console.warn('Supabase insert warning:', error.message);
      } else {
        savedToSupabase = true;
      }
    } catch (dbErr) {
      console.warn('Supabase insert exception:', dbErr.message);
    }
  }

  // Also write to local storage
  const messagesPath = path.join(__dirname, 'data', 'messages.json');
  const messages = readJsonFile(messagesPath, []);
  messages.push(newEntry);
  const saved = writeJsonFile(messagesPath, messages);

  if (!saved && !savedToSupabase) {
    return res.status(500).json({
      success: false,
      error: 'Could not persist message to storage. Please try again or email directly.'
    });
  }

  // Send instant Telegram notification to Mubarak
  const sentTelegram = await sendTelegramNotification(newEntry);

  console.log(`[Contact Form] New message from ${newEntry.name} (${newEntry.email})${savedToSupabase ? ' [Supabase]' : ''}${sentTelegram ? ' [Telegram Notified]' : ''}`);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been sent successfully. Mubarak Atheeb will get back to you shortly.',
    data: {
      id: newEntry.id,
      receivedAt: newEntry.receivedAt,
      storage: savedToSupabase ? 'supabase' : 'local',
      telegramNotified: sentTelegram
    }
  });
});

// GET /api/messages - List contact messages (Supabase or Local fallback)
app.get('/api/messages', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        const formatted = data.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          subject: m.subject,
          message: m.message,
          receivedAt: m.received_at,
          ip: m.ip
        }));
        return res.json(formatted);
      }
    } catch (err) {
      console.warn('Supabase fetch error, using local fallback:', err.message);
    }
  }

  const messagesPath = path.join(__dirname, 'data', 'messages.json');
  const messages = readJsonFile(messagesPath, []);
  res.json(messages);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    framework: 'Express.js',
    app: 'Mubarak Atheeb 3D Portfolio'
  });
});

// GET /api/resume - Structured resume data & printable summary
app.get('/api/resume', (req, res) => {
  const profilePath = path.join(__dirname, 'data', 'profile.json');
  const profile = readJsonFile(profilePath, {});
  res.json({
    name: profile.name,
    tagline: profile.tagline,
    about: profile.about,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    github: profile.github,
    experiences: profile.experiences,
    education: profile.education,
    skills: profile.skills,
    certifications: profile.certifications,
    leadership: profile.leadership,
    languages: profile.languages
  });
});

// Fallback to index.html for single-page routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server (only when run directly or locally, not when imported as Vercel serverless function)
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Mubarak Atheeb 3D Portfolio running on Express.js`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

// Export for Vercel Serverless Function deployment
module.exports = app;
