document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsDropdown = document.getElementById('settingsDropdown');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  const themeSelect = document.getElementById('themeSelect');
  const botTokenInput = document.getElementById('botToken');
  const lockToggleBtn = document.getElementById('lockToggleBtn');
  const guildIdInput = document.getElementById('guildId');
  const botNameInput = document.getElementById('botName');
  const errorTag = document.getElementById('errorTag');
  const botCardsContainer = document.getElementById('botCardsContainer');
  const botCount = document.getElementById('botCount');

  // Load Saved Preferences
  const loadSavedSettings = () => {
    const savedTheme = localStorage.getItem('theme') || 'theme-dark';
    document.body.className = savedTheme;
    themeSelect.value = savedTheme;

    botTokenInput.value = localStorage.getItem('botToken') || '';
    guildIdInput.value = localStorage.getItem('guildId') || '';
    botNameInput.value = localStorage.getItem('botName') || '';

    updateBotDashboard();
  };

  // Toggle Settings Popup
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('hidden');
  });

  // Close Dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsDropdown.contains(e.target) && !settingsBtn.contains(e.target)) {
      settingsDropdown.classList.add('hidden');
    }
  });

  // Tab Navigation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Theme Switcher
  themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    document.body.className = selectedTheme;
    localStorage.setItem('theme', selectedTheme);
  });

  // Lock / Unlock Bot Token Input
  let isTokenUnlocked = false;
  lockToggleBtn.addEventListener('click', () => {
    isTokenUnlocked = !isTokenUnlocked;
    if (isTokenUnlocked) {
      botTokenInput.removeAttribute('disabled');
      lockToggleBtn.classList.add('unlocked');
      botTokenInput.focus();
    } else {
      botTokenInput.setAttribute('disabled', 'true');
      lockToggleBtn.classList.remove('unlocked');
    }
  });

  botTokenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      localStorage.setItem('botToken', botTokenInput.value);
      botTokenInput.classList.add('flash-green');
      setTimeout(() => botTokenInput.classList.remove('flash-green'), 800);
    }
  });

  // Save Guild ID
  guildIdInput.addEventListener('input', () => {
    localStorage.setItem('guildId', guildIdInput.value);
    updateBotDashboard();
  });

  // Bot Name Handling (Enter validation + Flash Animations)
  botNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = botNameInput.value.trim();

      if (!name || name.length < 3) {
        triggerErrorState();
      } else {
        triggerSuccessState(name);
      }
    }
  });

  function triggerSuccessState(name) {
    botNameInput.classList.remove('flash-red');
    botNameInput.classList.add('flash-green');
    
    localStorage.setItem('botName', name);
    updateBotDashboard();

    setTimeout(() => {
      botNameInput.classList.remove('flash-green');
    }, 800);
  }

  function triggerErrorState() {
    botNameInput.classList.remove('flash-green');
    botNameInput.classList.add('flash-red');
    
    errorTag.classList.remove('hidden', 'fade-out');

    setTimeout(() => {
      errorTag.classList.add('fade-out');
      setTimeout(() => {
        errorTag.classList.add('hidden');
        errorTag.classList.remove('fade-out');
        botNameInput.classList.remove('flash-red');
      }, 800);
    }, 1200);
  }

  // Render Bot Cards on Dashboard
  function updateBotDashboard() {
    const botName = localStorage.getItem('botName');
    const guildId = localStorage.getItem('guildId');

    botCardsContainer.innerHTML = '';

    if (botName) {
      botCount.textContent = "1 Active Bot";
      const initial = botName.charAt(0).toUpperCase();

      const card = document.createElement('div');
      card.className = 'bot-card';
      card.innerHTML = `
        <div class="avatar-wrapper">
          <div class="bot-avatar">${initial}</div>
          <div class="status-dot"></div>
        </div>
        <div class="bot-info">
          <h3>${botName}</h3>
          <p class="font-mono">GUID: ${guildId || 'Not Set'}</p>
        </div>
      `;
      botCardsContainer.appendChild(card);
    } else {
      botCount.textContent = "0 Active";
      botCardsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: var(--radius); border: 1px dashed var(--panel-border);">
          <p style="color: var(--text-muted); font-size: 0.9rem;">No bots configured. Open <strong>Settings &gt; Discord</strong> to add your bot name.</p>
        </div>
      `;
    }
  }

  loadSavedSettings();
});
