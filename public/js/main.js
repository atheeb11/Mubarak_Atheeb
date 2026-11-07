/**
 * Mubarak Atheeb - Main Interactive Portfolio Script
 * Express.js API Integration, 3D Tilt Physics, Interactive Terminal & Web Audio FX
 */

document.addEventListener('DOMContentLoaded', () => {

  // ================= 1. WEB AUDIO SYNTHESIZER (NO MP3s NEEDED) =================
  let audioContext = null;
  let soundEnabled = false;

  function initAudio() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.12, gainVal = 0.1) {
    if (!soundEnabled || !audioContext) return;
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      gain.gain.setValueAtTime(gainVal, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled 
        ? '<i class="fa-solid fa-volume-high text-cyan-400"></i><span class="btn-tooltip">Sound: ON</span>' 
        : '<i class="fa-solid fa-volume-xmark"></i><span class="btn-tooltip">Sound: OFF</span>';
      if (soundEnabled) {
        playTone(587, 'sine', 0.15, 0.15); // D5
        setTimeout(() => playTone(880, 'sine', 0.2, 0.15), 100); // A5
        showToast('Cyber Audio FX Enabled 🔊');
      } else {
        showToast('Audio FX Muted 🔇');
      }
    });
  }

  // Play button hover & click sounds
  document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mouseenter', () => playTone(440, 'triangle', 0.05, 0.04));
    el.addEventListener('click', () => playTone(880, 'sine', 0.08, 0.08));
  });

  // ================= 2. THEME ATMOSPHERE TOGGLE =================
  const themeBtn = document.getElementById('theme-toggle');
  let isCyanAtmosphere = true;
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      isCyanAtmosphere = !isCyanAtmosphere;
      document.body.classList.toggle('cyber-violet-theme', !isCyanAtmosphere);
      themeBtn.innerHTML = isCyanAtmosphere
        ? '<i class="fa-solid fa-moon"></i><span class="btn-tooltip">Cyber Cyan</span>'
        : '<i class="fa-solid fa-sun text-purple-400"></i><span class="btn-tooltip">Deep Violet</span>';
      showToast(isCyanAtmosphere ? 'Atmosphere: Obsidian Cyan' : 'Atmosphere: Deep Violet');
    });
  }

  // ================= 3. TYPEWRITER EFFECT =================
  const typewriterEl = document.getElementById('typewriter-text');
  const roles = [
    'Informatics Engineering Student',
    'AWS Student Builder Community Leader',
    'President, AWS Student Builder Club @ Nusa Putra',
    'Ambassador, One World Youth Movements',
    'Ambassador, International Diplomats',
    'Founder @ InkBit Digital Studio',
    'Full-Stack Developer & AI Explorer'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function typeEffect() {
    if (!typewriterEl) return;
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typewriterEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 45;
    } else {
      typewriterEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 85;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      isDeleting = true;
      typingSpeed = 1800;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(typeEffect, typingSpeed);
  }
  typeEffect();

  // ================= 4. 3D CUTOUT PARALLAX & TILT PHYSICS =================
  const characterStage = document.getElementById('hero-character-wrapper');
  const cutoutImg = document.getElementById('avatar-image');
  const floatingBadges = document.querySelectorAll('.floating-badge');

  if (characterStage && cutoutImg) {
    characterStage.addEventListener('mousemove', (e) => {
      const rect = characterStage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      // 3D tilt for the free-standing cutout figure
      cutoutImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      cutoutImg.style.filter = `drop-shadow(0 25px 35px rgba(0, 0, 0, 0.9)) drop-shadow(${rotateY * -1}px ${rotateX * -1}px 30px rgba(0, 242, 254, 0.35)) drop-shadow(0 0 50px rgba(157, 78, 221, 0.25))`;

      // Multi-layer parallax for floating badges
      floatingBadges.forEach(badge => {
        const depth = parseFloat(badge.getAttribute('data-depth')) || 0.3;
        const moveX = (x - centerX) * depth * 0.25;
        const moveY = (y - centerY) * depth * 0.25;
        badge.style.transform = `translate3d(${moveX}px, ${moveY}px, 20px) scale(1.04)`;
      });
    });

    characterStage.addEventListener('mouseleave', () => {
      cutoutImg.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      cutoutImg.style.filter = 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 25px rgba(0, 242, 254, 0.25)) drop-shadow(0 0 50px rgba(157, 78, 221, 0.2))';

      floatingBadges.forEach(badge => {
        badge.style.transform = '';
      });
    });
  }

  // ================= 5. DYNAMIC STATS COUNTER =================
  const counters = document.querySelectorAll('.counter');
  let counted = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const speed = 25;
      const step = Math.ceil(target / speed);
      let count = 0;

      const timer = setInterval(() => {
        count += step;
        if (count >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = count;
        }
      }, 40);
    });
  }

  const statsSection = document.querySelector('.stats-banner');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        runCounters();
      }
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  }

  // ================= 6. LOAD & FILTER PROJECTS VIA EXPRESS API =================
  const projectsContainer = document.getElementById('projects-container');
  let loadedProjects = [];

  async function fetchProjects(category = 'all') {
    try {
      const url = category === 'all' ? '/api/projects' : `/api/projects?category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      loadedProjects = data;
      renderProjects(data);
    } catch (err) {
      console.warn('Fallback loading projects:', err);
      loadFallbackProjects();
    }
  }

  function renderProjects(projects) {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '';

    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card flex flex-col justify-between group';
      card.setAttribute('data-category', p.category);

      const techBadges = p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

      // Status indicator style
      let statusColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30';
      let statusDot = 'bg-emerald-400';
      if (p.status?.includes('AWS') || p.status?.includes('Systems')) {
        statusColor = 'text-amber-400 bg-amber-950/80 border-amber-500/30';
        statusDot = 'bg-amber-400';
      } else if (p.status?.includes('Flagship') || p.status?.includes('Agency')) {
        statusColor = 'text-cyan-400 bg-cyan-950/80 border-cyan-500/30';
        statusDot = 'bg-cyan-400';
      } else if (p.status?.includes('AI') || p.status?.includes('Diploma')) {
        statusColor = 'text-purple-400 bg-purple-950/80 border-purple-500/30';
        statusDot = 'bg-purple-400';
      }

      card.innerHTML = `
        <div>
          <!-- Thumbnail Container with Quick Action Overlay -->
          <div class="project-thumbnail">
            <img src="${p.image}" alt="${p.title}" class="project-img" loading="lazy">
            
            <div class="project-status-tag ${statusColor}">
              <span class="w-1.5 h-1.5 rounded-full ${statusDot} animate-pulse"></span>
              <span>${p.status || 'Active Project'}</span>
            </div>

            <span class="project-category-tag">${p.category}</span>

            <!-- Quick Action Overlay on Hover -->
            <div class="project-thumb-overlay">
              <button class="thumb-action-btn project-details-btn" data-project-id="${p.id}" title="Inspect Architecture & Specs">
                <i class="fa-solid fa-layer-group"></i>
              </button>
              <a href="${p.github || 'https://github.com/atheeb11'}" target="_blank" rel="noopener noreferrer" class="thumb-action-btn" title="View Source Code on GitHub">
                <i class="fa-brands fa-github"></i>
              </a>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-6 sm:p-7">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400/90">${p.subtitle || p.role || 'Full-Stack Solution'}</span>
              ${p.featured ? '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold"><i class="fa-solid fa-star text-[9px] mr-1"></i>Featured</span>' : ''}
            </div>

            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors duration-200">${p.title}</h3>
            
            <p class="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">${p.desc}</p>
            
            ${p.metrics ? `
            <div class="flex items-center gap-2 text-xs font-mono text-emerald-300/90 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg mb-4">
              <i class="fa-solid fa-gauge-high text-emerald-400 text-[11px]"></i>
              <span class="truncate">${p.metrics}</span>
            </div>` : ''}

            <div class="flex flex-wrap gap-1.5 pt-1 mb-2">
              ${techBadges}
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <button class="project-details-btn text-xs font-mono font-semibold text-cyan-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer" data-project-id="${p.id}">
            <i class="fa-solid fa-circle-info text-sm"></i>
            <span>Architecture &amp; Specs</span>
            <i class="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
          </button>
          
          <div class="flex items-center gap-3">
            <a href="${p.github || 'https://github.com/atheeb11'}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition" title="GitHub Repository">
              <i class="fa-brands fa-github text-sm"></i>
              <span>Code</span>
            </a>
          </div>
        </div>
      `;

      projectsContainer.appendChild(card);
    });

    initScrollReveals();
  }

  function loadFallbackProjects() {
    fetch('/data/profile.json')
      .then(res => res.json())
      .then(data => {
        loadedProjects = data.projects || [];
        renderProjects(loadedProjects);
      })
      .catch(e => console.error(e));
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      fetchProjects(cat);
      playTone(660, 'sine', 0.06, 0.1);
    });
  });

  fetchProjects('all');

  // ================= 6B. SKILLS 3D TILT & CATEGORY FILTER =================
  const skillCards = document.querySelectorAll('.skill-3d-card');
  const skillTabBtns = document.querySelectorAll('.skill-tab-btn');

  // 3D Tilt physics on each skill card
  skillCards.forEach(card => {
    const inner = card.querySelector('.skill-3d-card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      inner.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    // Sound effect on logo hover
    const logoBox = card.querySelector('.skill-logo-box');
    if (logoBox) {
      logoBox.addEventListener('mouseenter', () => {
        playTone(620, 'sine', 0.08, 0.08);
      });
    }
  });

  // Category filter tabs
  skillTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skillTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCat = btn.getAttribute('data-skill-cat');
      playTone(520, 'sine', 0.06, 0.1);

      skillCards.forEach(card => {
        const cardCat = card.getAttribute('data-cat');
        if (targetCat === 'all' || cardCat === targetCat) {
          card.classList.remove('hidden-card');
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });

  // ================= 7. 3D INTERACTIVE TERMINAL =================
  const termInput = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');
  const termExecBtn = document.getElementById('terminal-exec-btn');

  const commandHistory = [];
  let historyIdx = -1;

  const terminalCommands = {
    help: () => `Available Terminal Commands:
  • about        : Summary biography & university status
  • leadership   : AWS Builder & Global Ambassador leadership roles
  • skills       : Core technical skills breakdown
  • projects     : Featured studio & engineering projects
  • experience   : Career history (InkBit, Harvest, BSC)
  • education    : Academic qualifications & scholarship
  • certs        : Professional diplomas (AI, ML, Data)
  • cv / resume  : Opens Curriculum Vitae modal & print view
  • contact      : Reach out via email, phone or GitHub
  • hire         : Opens the contact transmission form
  • matrix       : Fullscreen digital rain stream
  • clear        : Clears console screen
  • whoami       : Current user session identification
  • date         : Server timestamp and date`,

    about: () => `MUBARAK ATHEEB
First-year Informatics Engineering student at Universitas Nusa Putra (Student ID: 20250040223).
Founder & Web Designer at InkBit Digital Studio (Sukabumi, Indonesia).
AWS Student Builder Community Leader & Global Ambassador.
Specializes in responsive web applications, Python automation, and machine learning models.
Origin: Sri Lanka | Current Base: Sukabumi, Indonesia`,

    leadership: () => `HONORARY & COMMUNITY LEADERSHIP POSITIONS:
  ⚡ AWS Student Builder Community Leader
     • Amazon Web Services (AWS) Student Community
     • Leading developer cloud workshops, architecture sessions & hackathons
  👑 President — AWS Student Builder Club
     • Universitas Nusa Putra (Sukabumi, Indonesia)
     • Presiding over university tech initiatives & student cloud empowerment
  🌐 Global Ambassador — One World Youth Movements (OWYM)
     • Cross-cultural youth empowerment & international diplomatic dialogue
  🤝 Global Ambassador — International Diplomats
     • Global youth leadership, technological literacy & international summits`,

    aws: () => terminalCommands.leadership(),
    roles: () => terminalCommands.leadership(),
    ambassador: () => terminalCommands.leadership(),

    skills: () => `TECHNICAL SKILLS INVENTORY:
  [Frontend]   HTML5, CSS3, JavaScript (ES6+), Three.js, Responsive Design
  [Backend]    Express.js, Node.js, Python, MySQL, WordPress CMS
  [AI / Data]  Machine Learning, Artificial Intelligence, Data Analytics, ReportLab
  [Hardware]   PC Diagnostics, Board Troubleshooting, OS Deployment, Data Recovery
  [DevTools]   Git, GitHub, UI/UX Prototyping`,

    projects: () => `FEATURED WORKS:
  1. InkBit Digital Studio Portal  (HTML5/CSS3/Three.js/Express)
  2. ReportLab PDF & Data Engine   (Python/MySQL/Data Analytics)
  3. Hardware Diagnostics Suite    (Diagnostics/OS Deployment)
  4. Harvest College Social Hub    (Brand Strategy/Analytics)
  5. Machine Learning Models       (Scikit-Learn/Pandas/AI)
  Type 'contact' or use the UI cards above to explore live details.`,

    experience: () => `CAREER TIMELINE:
  • 2025 - Present : Founder & Web Designer, InkBit Digital Studio
  • 2025           : Social Media Manager, Harvest International Business College
  • 2021 - 2024    : Computer Technician, BSC Computers (Sri Lanka)`,

    exp: () => terminalCommands.experience(),

    education: () => `EDUCATION & HONORS:
  • 2025 - Present : Universitas Nusa Putra (Informatics Engineering B.Eng)
                     Student ID: 20250040223 | Scholarship Awardee
  • 2022 - 2024    : KMKM Imam Gazzaly Maha Vidyalaya (GCE A/L)
  • 2019 - 2021    : KMKM Imam Gazzaly Maha Vidyalaya (GCE O/L)`,

    edu: () => terminalCommands.education(),

    certs: () => `CERTIFICATIONS & ACCREDITATIONS:
  ✓ Diploma in Machine Learning (NOVI/TECH)
  ✓ Diploma in Artificial Intelligence (NOVI/TECH)
  ✓ Diploma in Data Analytics (NOVI/TECH)
  ✓ Web Designing (Cyber Lowala Piyath)
  ✓ Web Designing (Suhan / Sara)
  ✓ GCE Advanced Level (Completed 2024)`,

    cv: () => {
      openResumeModal();
      return 'Opening Curriculum Vitae modal... You can also print or export as PDF!';
    },

    resume: () => terminalCommands.cv(),

    contact: () => `DIRECT CONTACT CHANNELS:
  • Email   : atheeb1311@gmail.com
  • WhatsApp: https://wa.me/94779413135 (+94 77 941 3135)
  • GitHub  : https://github.com/atheeb11
  • Location: Sukabumi, Indonesia (Origin: Sri Lanka)`,

    whatsapp: () => {
      window.open('https://wa.me/94779413135?text=Hi%20Mubarak%2C%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20connect!', '_blank');
      return 'Opening direct WhatsApp chat with Mubarak Atheeb (+94 77 941 3135)...';
    },

    wa: () => terminalCommands.whatsapp(),

    hire: () => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('form-name')?.focus();
      return 'Navigating to Contact Transmission Form... Please complete details below!';
    },

    clear: () => {
      if (termOutput) termOutput.innerHTML = '';
      return '';
    },

    whoami: () => `guest@atheeb-core (Role: Explorer | Access: Guest Sandbox)`,

    date: () => new Date().toString(),

    matrix: () => {
      startMatrixRain();
      return `[MATRIX PROTOCOL INITIALIZED] Fullscreen digital stream active. Press ESC or click Exit to return.`;
    },

    voice: () => {
      startVoiceIntro();
      return `[VOICE SYNTHESIS ACTIVATED] Playing Mubarak's personal voice introduction...`;
    },

    speak: () => terminalCommands.voice(),
    intro: () => terminalCommands.voice(),

    inbox: async () => {
      try {
        const res = await fetch('/api/messages');
        const msgs = await res.json();
        if (!msgs || msgs.length === 0) {
          return 'No inquiries logged yet in Express backend database. Messages submitted via the contact form will appear here!';
        }
        let output = `EXPRESS INBOX LEDGER (${msgs.length} received):\n`;
        msgs.slice(-5).reverse().forEach((m, idx) => {
          output += `\n[#${idx + 1}] Date: ${new Date(m.receivedAt).toLocaleString()}\n`;
          output += `     From   : ${m.name} <${m.email}>\n`;
          output += `     Subject: ${m.subject}\n`;
          output += `     Message: ${m.message}\n`;
        });
        return output;
      } catch (err) {
        return 'Could not retrieve inbox from Express API.';
      }
    },

    stats: async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        return `EXPRESS.JS SERVER METRICS:
  • Status       : ${data.status.toUpperCase()}
  • Uptime       : ${data.uptime} seconds
  • Node Version : ${data.nodeVersion}
  • Total Inquiries: ${data.messagesCount}
  • Timestamp    : ${data.serverTimestamp}`;
      } catch (err) {
        return 'Express server metrics unreachable.';
      }
    }
  };

  async function executeCommand(inputRaw) {
    const trimmed = inputRaw.trim();
    if (!trimmed) return;

    commandHistory.push(trimmed);
    historyIdx = commandHistory.length;

    const cmdLine = document.createElement('div');
    cmdLine.innerHTML = `<span class="text-neon-cyan font-bold">&gt;</span> <span class="term-cmd">${escapeHTML(trimmed)}</span>`;
    termOutput.appendChild(cmdLine);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let responseText = '';
    if (cmd === 'echo') {
      responseText = args;
    } else if (terminalCommands[cmd]) {
      const result = terminalCommands[cmd]();
      responseText = result instanceof Promise ? await result : result;
    } else {
      responseText = `Command not recognized: '${cmd}'. Type 'help' for the command list.`;
    }

    if (cmd !== 'clear' && responseText) {
      const resLine = document.createElement('div');
      resLine.className = 'term-res';
      resLine.textContent = responseText;
      termOutput.appendChild(resLine);
    }

    termOutput.scrollTop = termOutput.scrollHeight;
    playTone(520, 'sine', 0.08, 0.1);
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = termInput.value;
        termInput.value = '';
        executeCommand(val);
      } else if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          termInput.value = commandHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < commandHistory.length - 1) {
          historyIdx++;
          termInput.value = commandHistory[historyIdx] || '';
        } else {
          historyIdx = commandHistory.length;
          termInput.value = '';
        }
      }
    });
  }

  if (termExecBtn && termInput) {
    termExecBtn.addEventListener('click', () => {
      const val = termInput.value;
      termInput.value = '';
      executeCommand(val);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ================= 8. CONTACT FORM WITH EXPRESS.JS POST API =================
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const formAlert = document.getElementById('form-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById('form-name').value,
        email: document.getElementById('form-email').value,
        subject: document.getElementById('form-subject').value,
        message: document.getElementById('form-message').value
      };

      submitBtn.disabled = true;
      btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Transmitting to Express API...';
      formAlert.className = 'hidden';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await res.json();

        if (res.ok && result.success) {
          formAlert.className = 'mt-4 p-4 rounded-xl text-sm font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 block';
          formAlert.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i> ${result.message}`;
          contactForm.reset();

          playTone(523.25, 'sine', 0.15, 0.15);
          setTimeout(() => playTone(659.25, 'sine', 0.15, 0.15), 100);
          setTimeout(() => playTone(783.99, 'sine', 0.3, 0.15), 200);

          showToast('Message received by Express backend! 🚀');
        } else {
          formAlert.className = 'mt-4 p-4 rounded-xl text-sm font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300 block';
          formAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-2"></i> ${result.error || 'Failed to submit.'}`;
        }
      } catch (err) {
        console.error('Contact submit error:', err);
        formAlert.className = 'mt-4 p-4 rounded-xl text-sm font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300 block';
        formAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-2"></i> Connection error. Please contact directly at atheeb1311@gmail.com`;
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Transmit Message to Express API';
      }
    });
  }

  // Toast notification helper
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<i class="fa-solid fa-circle-info text-cyan-400"></i> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ================= 9. MOBILE MENU TOGGLE =================
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  // ================= 10. ACTIVE NAVBAR & REAL-TIME SCROLL PROGRESS BAR =================
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');
  const scrollProgressBar = document.getElementById('scroll-progress-bar');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset || window.scrollY || 0;

    // Real-time Neon Cyber Scroll Progress Bar
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollPercent = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }

    sections.forEach(sec => {
      const secTop = sec.offsetTop - 140;
      const secHeight = sec.offsetHeight;
      if (scrollY >= secTop && scrollY < secTop + secHeight) {
        current = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  }, { passive: true });

  // ================= CINEMATIC SCROLL REVEAL INTERSECTION OBSERVER =================
  const scrollRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          scrollRevealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  function initScrollReveals() {
    const targetSelectors = [
      '.section-tag',
      '.section-heading',
      '.section-subheading',
      '.skill-3d-card',
      '.project-card',
      '.timeline-item',
      '.honor-card',
      '.terminal-window',
      '.contact-info-card',
      '#contact-form'
    ];

    targetSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el, idx) => {
        if (!el.classList.contains('scroll-reveal')) {
          el.classList.add('scroll-reveal');
          const delayClass = `scroll-delay-${(idx % 5) + 1}`;
          el.classList.add(delayClass);
        }
        scrollRevealObserver.observe(el);
      });
    });
  }

  // Initialize scroll reveals on startup
  initScrollReveals();

  // ================= 11. RESUME & CV MODAL LOGIC =================
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtn = document.getElementById('open-resume-btn');
  const closeResumeBtn = document.getElementById('close-resume-btn');
  const printResumeBtn = document.getElementById('print-resume-btn');

  function openResumeModal() {
    if (resumeModal) {
      resumeModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      playTone(660, 'sine', 0.1, 0.1);
    }
  }

  function closeResumeModal() {
    if (resumeModal) {
      resumeModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (openResumeBtn) openResumeBtn.addEventListener('click', openResumeModal);
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResumeModal);
  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResumeModal();
    });
  }

  // ================= 12. PROJECT DETAILS MODAL LOGIC =================
  const projectModal = document.getElementById('project-modal');
  const projectModalContent = document.getElementById('project-modal-content');

  function openProjectModal(projectId) {
    const project = loadedProjects.find(p => p.id === projectId);
    if (!project || !projectModalContent) return;

    const techBadges = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    const highlights = project.highlights ? project.highlights.map(h => `
      <li class="flex items-start gap-2.5 text-xs text-slate-300">
        <i class="fa-solid fa-circle-check text-cyan-400 mt-0.5 text-xs"></i>
        <span>${h}</span>
      </li>
    `).join('') : '';

    projectModalContent.innerHTML = `
      <div class="relative bg-slate-950">
        <img src="${project.image}" alt="${project.title}" class="w-full h-60 sm:h-72 object-cover">
        <button id="close-project-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-900 transition border border-slate-700/60 shadow-lg cursor-pointer">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
        <div class="absolute bottom-4 left-6 flex items-center gap-2">
          <span class="text-xs font-mono font-bold px-3 py-1 rounded bg-slate-900/90 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">${project.category}</span>
          ${project.status ? `<span class="text-xs font-mono font-semibold px-3 py-1 rounded bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>${project.status}</span>` : ''}
        </div>
      </div>
      
      <div class="p-6 sm:p-8 space-y-5 text-slate-200 max-h-[70vh] overflow-y-auto">
        <div>
          <div class="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-1">${project.subtitle || project.role || 'Full-Stack Solution'}</div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white">${project.title}</h3>
          ${project.role ? `<div class="text-xs text-slate-400 mt-1.5"><i class="fa-solid fa-user-gear mr-1.5 text-slate-500"></i>Role: <strong class="text-slate-300">${project.role}</strong></div>` : ''}
        </div>

        <div>
          <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">System Overview</h4>
          <p class="text-slate-300 text-sm leading-relaxed">${project.desc}</p>
        </div>

        ${project.metrics ? `
        <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-lg shrink-0">
            <i class="fa-solid fa-gauge-high"></i>
          </div>
          <div>
            <div class="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Performance &amp; Key Metrics</div>
            <div class="text-xs font-mono font-bold text-emerald-400">${project.metrics}</div>
          </div>
        </div>
        ` : ''}

        ${highlights ? `
        <div>
          <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">Key Engineering Highlights</h4>
          <ul class="space-y-2">
            ${highlights}
          </ul>
        </div>
        ` : ''}

        <div>
          <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">Architecture &amp; Tech Stack</h4>
          <div class="flex flex-wrap gap-2">
            ${techBadges}
          </div>
        </div>

        <div class="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <a href="${project.github || 'https://github.com/atheeb11'}" target="_blank" rel="noopener noreferrer" class="btn-primary text-xs py-2.5 px-5">
              <i class="fa-brands fa-github mr-2"></i>
              <span>GitHub Repository</span>
            </a>
          </div>

          <button id="modal-inquire-btn" class="btn-outline text-xs py-2.5 px-4 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 flex items-center gap-2">
            <i class="fa-solid fa-paper-plane"></i>
            <span>Inquire About Project</span>
          </button>
        </div>
      </div>
    `;

    projectModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    playTone(720, 'sine', 0.1, 0.1);

    document.getElementById('close-project-btn')?.addEventListener('click', closeProjectModal);
    document.getElementById('modal-inquire-btn')?.addEventListener('click', () => {
      closeProjectModal();
      const contactSec = document.getElementById('contact');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
        const subjectInput = document.getElementById('form-subject');
        if (subjectInput) {
          subjectInput.value = `Project Inquiry: ${project.title}`;
          subjectInput.focus();
        }
      }
    });
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  if (projectsContainer) {
    projectsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.project-details-btn');
      if (btn) {
        const id = btn.getAttribute('data-project-id');
        openProjectModal(id);
      }
    });
  }

  // ================= 13. FULLSCREEN DIGITAL MATRIX RAIN =================
  const matrixModal = document.getElementById('matrix-modal');
  const matrixCanvas = document.getElementById('matrix-canvas');
  const closeMatrixBtn = document.getElementById('close-matrix-btn');
  let matrixInterval = null;

  function startMatrixRain() {
    if (!matrixModal || !matrixCanvas) return;
    matrixModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const chars = '0123456789ABCDEF@#$%&*+=-~MUBARAKATHEEBINKBIT';
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    clearInterval(matrixInterval);
    matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.fillStyle = '#00f2fe';
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 33);
  }

  function stopMatrixRain() {
    if (matrixModal) matrixModal.classList.add('hidden');
    document.body.style.overflow = '';
    clearInterval(matrixInterval);
  }

  if (closeMatrixBtn) closeMatrixBtn.addEventListener('click', stopMatrixRain);

  // Global ESC handler to close any active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeResumeModal();
      closeProjectModal();
      stopMatrixRain();
    }
  });

  // ================= 14. AUTOMATIC SEAMLESS VOICE OVER INTRODUCTION =================
  const voiceIntroText = "Welcome to My Profile! I'm Mubarak Atheeb, an Informatics Engineering student at Nusa Putra University, Indonesia. I serve as an AWS Student Builder Community Leader, One World Youth Movement Ambassador, and International Diplomats Ambassador. I'm passionate about technology, artificial intelligence, software development, youth leadership, and global collaboration. I enjoy exploring innovative ideas, leading communities, connecting with people worldwide, and creating positive change through technology and leadership. Let's connect, collaborate, and build a better future together!";

  const voiceToggleBtn = document.getElementById('voiceover-toggle-btn');
  const profileAudio = document.getElementById('profile-audio');
  let isSpeaking = false;
  let hasStartedVoice = false;
  let currentUtterance = null;
  let speechKeepAliveTimer = null;

  function updateVoiceUI(speaking) {
    isSpeaking = speaking;
    if (voiceToggleBtn) {
      if (speaking) {
        voiceToggleBtn.classList.add('speaking');
        voiceToggleBtn.title = 'Pause Voice Introduction';
      } else {
        voiceToggleBtn.classList.remove('speaking');
        voiceToggleBtn.title = 'Play Voice Introduction';
      }
    }
  }

  function getBestEnglishVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Zira')) && 
      v.lang.startsWith('en')
    );
    return preferred || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  async function startVoiceIntro(forceRestart = false) {
    if (isSpeaking && !forceRestart) return true;

    stopVoiceIntro(false);

    // 1. Try HTML5 Audio First (Fastest, highest fidelity, fully cross-platform)
    if (profileAudio) {
      try {
        profileAudio.currentTime = 0;
        const playPromise = profileAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          hasStartedVoice = true;
          updateVoiceUI(true);
          return true;
        }
      } catch (audioErr) {
        // Fall back to Web Speech API
      }
    }

    // 2. Fallback to Browser Speech Synthesis API
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        currentUtterance = new SpeechSynthesisUtterance(voiceIntroText);
        const selectedVoice = getBestEnglishVoice();
        if (selectedVoice) currentUtterance.voice = selectedVoice;
        currentUtterance.rate = 0.98;
        currentUtterance.pitch = 1.0;

        currentUtterance.onstart = () => {
          hasStartedVoice = true;
          updateVoiceUI(true);
          // Keep-alive timer for Chrome speech synthesis 15-second pause bug
          clearInterval(speechKeepAliveTimer);
          speechKeepAliveTimer = setInterval(() => {
            if (isSpeaking && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
              window.speechSynthesis.resume();
            } else {
              clearInterval(speechKeepAliveTimer);
            }
          }, 300);
        };

        currentUtterance.onend = () => {
          clearInterval(speechKeepAliveTimer);
          updateVoiceUI(false);
        };

        currentUtterance.onerror = () => {
          clearInterval(speechKeepAliveTimer);
          updateVoiceUI(false);
        };

        window.speechSynthesis.speak(currentUtterance);
        window.speechSynthesis.resume();
        return true;
      } catch (ttsErr) {
        // TTS failed
      }
    }

    return false;
  }

  function stopVoiceIntro(notify = false) {
    if (profileAudio && !profileAudio.paused) {
      profileAudio.pause();
      profileAudio.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(speechKeepAliveTimer);
    updateVoiceUI(false);
    if (notify) showToast('Voice intro paused ⏸️');
  }

  function toggleVoiceIntro() {
    if (isSpeaking) {
      stopVoiceIntro(true);
    } else {
      startVoiceIntro(true).then(ok => {
        if (ok) showToast('Playing Mubarak\'s voice intro 🎙️');
      });
    }
  }

  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener('click', toggleVoiceIntro);
  }

  if (profileAudio) {
    profileAudio.addEventListener('ended', () => updateVoiceUI(false));
    profileAudio.addEventListener('pause', () => {
      if (!window.speechSynthesis?.speaking) updateVoiceUI(false);
    });
  }

  // Pre-load voices for Chrome / Chromium
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      getBestEnglishVoice();
      if (!hasStartedVoice) {
        attemptAutoPlay();
      }
    };
  }

  // Dual-tier Autoplay Engine:
  // Tier 1: Try immediately on open / refresh
  function attemptAutoPlay() {
    if (hasStartedVoice) return;
    startVoiceIntro().then(started => {
      if (started) {
        hasStartedVoice = true;
        detachGestureListeners();
      }
    }).catch(() => {});
  }

  // Tier 2: Instant trigger on first user activation if browser requires gesture
  const userActivationEvents = ['pointerdown', 'click', 'touchstart', 'keydown'];
  function onFirstUserActivation() {
    if (!hasStartedVoice) {
      startVoiceIntro().then(started => {
        if (started) {
          hasStartedVoice = true;
          detachGestureListeners();
        }
      });
    } else {
      detachGestureListeners();
    }
  }

  function detachGestureListeners() {
    userActivationEvents.forEach(evt => {
      window.removeEventListener(evt, onFirstUserActivation, { capture: true });
      document.removeEventListener(evt, onFirstUserActivation, { capture: true });
    });
  }

  userActivationEvents.forEach(evt => {
    window.addEventListener(evt, onFirstUserActivation, { capture: true, passive: true });
    document.addEventListener(evt, onFirstUserActivation, { capture: true, passive: true });
  });

  // Attempt right away at multiple stages of document readiness
  attemptAutoPlay();
  if (document.readyState === 'complete') {
    setTimeout(attemptAutoPlay, 200);
  } else {
    window.addEventListener('load', () => setTimeout(attemptAutoPlay, 200));
  }

});
