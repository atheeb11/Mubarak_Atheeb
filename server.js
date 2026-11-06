const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read JSON data safely
function readJsonFile(filePath, defaultData = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultData;
}

// Helper to write JSON data safely
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
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
    serverTimestamp: new Date().toISOString()
  });
});

// POST /api/contact - Receive and save contact inquiries
app.post('/api/contact', (req, res) => {
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

  const messagesPath = path.join(__dirname, 'data', 'messages.json');
  const messages = readJsonFile(messagesPath, []);

  const newEntry = {
    id: 'msg_' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: (subject || 'General Inquiry').trim(),
    message: message.trim(),
    receivedAt: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  };

  messages.push(newEntry);
  const saved = writeJsonFile(messagesPath, messages);

  if (!saved) {
    return res.status(500).json({
      success: false,
      error: 'Could not persist message to storage. Please try again or email directly.'
    });
  }

  console.log(`[Contact Form] New message received from ${newEntry.name} (${newEntry.email})`);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been sent successfully. Mubarak Atheeb will get back to you shortly.',
    data: {
      id: newEntry.id,
      receivedAt: newEntry.receivedAt
    }
  });
});

// GET /api/messages - List contact messages (for review)
app.get('/api/messages', (req, res) => {
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

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Mubarak Atheeb 3D Portfolio running on Express.js`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
