document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
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

  // Load Saved Settings from LocalStorage
  const loadSavedSettings = () => {
    const savedTheme = localStorage.getItem('theme') || 'theme-dark';
    document.body.className = savedTheme;
    themeSelect.value = savedTheme;

    botTokenInput.value = localStorage.getItem('botToken') || '';
    guildIdInput.value = localStorage.getItem('guildId') || '';
    botNameInput.value = localStorage.getItem('botName') || '';

    updateBotDashboard();
  };

  // 1. Toggle Dropdown Menu
  settingsBtn.addEventListener('click', () => {
    settingsDropdown.classList.toggle('hidden');
  });

  // 2. Tab Switcher
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // 3. Website Theme Selector
  themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    document.body.className = selectedTheme;
    localStorage.setItem('theme', selectedTheme);
  });

  // 4. Token Lock/Unlock Button
  let isTokenUnlocked = false;
  lockToggleBtn.addEventListener('click', () => {
    isTokenUnlocked = !isTokenUnlocked;
    if (isTokenUnlocked) {
      botTokenInput.removeAttribute('disabled');
      lockToggleBtn.classList.remove('locked');
      lockToggleBtn.classList.add('unlocked');
      lockToggleBtn.textContent = '🔓';
    } else {
      botTokenInput.setAttribute('disabled', 'true');
      lockToggleBtn.classList.remove('unlocked');
      lockToggleBtn.classList.add('locked');
      lockToggleBtn.textContent = '🔒';
    }
  });

  botTokenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      localStorage.setItem('botToken', botTokenInput.value);
      alert('Bot Token Saved!');
      updateBotDashboard();
    }
  });

  // 5. Save Server GUID
  guildIdInput.addEventListener('input', () => {
    localStorage.setItem('guildId', guildIdInput.value);
  });

  // 6. Bot Name Input Handler (Enter Key + Animations)
  botNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = botNameInput.value.trim();

      // Trigger Red Error Flash if name is empty or less than 3 chars
      if (!name || name.length < 3) {
        triggerErrorState();
      } else {
        triggerSuccessState(name);
      }
    }
  });

  function triggerSuccessState(name) {
    // Flash Green
    botNameInput.classList.remove('flash-red');
    botNameInput.classList.add('flash-green');
    
    localStorage.setItem('botName', name);
    updateBotDashboard();

    setTimeout(() => {
      botNameInput.classList.remove('flash-green');
    }, 1000);
  }

  function triggerErrorState() {
    // Flash Red & Show ERROR tag
    botNameInput.classList.remove('flash-green');
    botNameInput.classList.add('flash-red');
    
    errorTag.classList.remove('hidden', 'fade-out');

    // Fade out ERROR label and border back to normal
    setTimeout(() => {
      errorTag.classList.add('fade-out');
      setTimeout(() => {
        errorTag.classList.add('hidden');
        errorTag.classList.remove('fade-out');
        botNameInput.classList.remove('flash-red');
      }, 1000); // 1 sec fade transition
    }, 1500);
  }

  // 7. Dynamic Main Dashboard Display
  function updateBotDashboard() {
    const botName = localStorage.getItem('botName');
    const guildId = localStorage.getItem('guildId');

    botCardsContainer.innerHTML = '';

    if (botName) {
      const card = document.createElement('div');
      card.className = 'bot-card';
      card.innerHTML = `
        <div class="status-indicator"></div>
        <div>
          <h3>${botName}</h3>
          <p style="font-size: 0.8rem; opacity: 0.7;">Server GUID: ${guildId || 'Not Set'}</p>
        </div>
      `;
      botCardsContainer.appendChild(card);
    } else {
      botCardsContainer.innerHTML = `<p style="opacity: 0.5;">No connected bots found. Configure your Discord settings above.</p>`;
    }
  }

  loadSavedSettings();
});