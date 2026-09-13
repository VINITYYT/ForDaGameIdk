document.addEventListener('DOMContentLoaded', () => {
  // --- VEHICLE LIST ARRAY ---
  const vehicles = [
    "Tamaroh YZ125", "Myday Igine T3", "Suzara Hayatora 1300R Stretched Carbon", "Piazo Verpa 50", 
    "Koregreg Igirna", "Zoletive X1", "Tamaroh YZR M1", "Suzara RMZ450", "Tamaroh R1", 
    "Hermel Poison T10", "Suzara RM85", "Sanom L1", "Sorun Light Stinger X", "Aurion TS8", 
    "Tavoro Komodo", "Doublestorm X", "Doublestorm Thunder 3", "Tamaroh YZF R125", "D1 Aepi A252", 
    "Stake Fang", "Stake Fang EX", "Piazo TPR 50", "Tamaroh Boostar 50", "Piazo Verpa 2025", 
    "Razrida TR120", "Tavoro MX4", "Rembrini Haruco Super Trafaron", "Haro TT125", "Koregreg Kesto", 
    "E-Nice Pro SS", "Suzara RGV500", "Tamaroh Razdor 700", "Cookiring G4 Max", 
    "Tamaroh R1 Stretched Carbon", "Tamaroh Aerux 50", "Sorun Ultra Stinger", "E-Nice Pro SR", 
    "Tamaroh YZ450F", "Ducaro Pantera V4R", "Koruna CBR1000 Stretched Carbon", "Tamaroh YZ250", 
    "Kazari KX85", "MzDaren R2", "Keytee SX125", "Koruna Monkey", "Ducaro Resmocici GP", 
    "Suzara RM125", "Aurion TR6", "Tavoro MX5", "Cookiring G3 Pro", "OTP T10", "Kara DB30", 
    "Magia Bike Gomma", "Tamaroh YZ85", "Raurare TSC", "Draven Changer Hellfang", 
    "Tamaroh Bandee 350", "Keytee SXF450", "Kazari KX500", "MzDaren D1 FLC38", "Trailbest MB200", 
    "Keytee SX250", "Bash Bash EC700", "Zoletive D100", "Drone Gone Rubber", "Koruna RC213V", 
    "Draven Challer Demon 170", "Bavaro R1000SS", "Koruna CBR1000", "Koruna CR125", "Tavoro X3", 
    "Tamaroh MT-07", "MzDaren 760FT", "Tamaroh YZ450F Motard", "Keytee SX85", "Suzara Hayatora 1300R", 
    "Madman 878R", "Koruna Civica Type Z", "Kiwi RFK125", "Porta 199 GR3 TS", "Suzara GSX-RR", 
    "Coldme CT200U", "Porta 819 Spodar", "Kazari KFX700", "Koruna CR250", "Koruna CR85", 
    "Artir Sigma", "Koruna TRX250X", "Level Twelve", "Tamaroh Razdor 125", "Tamaroh YFZ450R", 
    "Sanom L2 Max", "Koruna TRX300EX", "Rembrini Aventra JSX", "Suzara LTZ400", "Keytee SXF450 Motard", 
    "Koruna TRX450", "Kazari KX450F Motard", "Koruna CR500", "Koruna CRF450R Motard", 
    "Draven Changer Hellfang Police Edition", "MzDaren Zerana", "Kazari KX250", "Zabura Respesa", 
    "Rubaghi Vehicle", "Ragano Bomba T", "Suzara RM250", "Rembrini Levero", "Bavaro S3 M36", 
    "Cookiring G2", "Ducaro Pantera V4R Stretched Carbon", "Kazari KX125", "TRR 420MM", 
    "Kazari Ninka H2R Stretched Carbon", "Suzara GSX R1000", "Kazari Ninka H2R", "Borli Dread Ride", 
    "Keytee Supernube 1390", "Sanom DT2 Pro", "Akrina RS660", "Bavaro G1300RT", "Kazari Ninka ZX6R", 
    "Keytee Nube 390", "Koruna CRF450R", "Kazari KX450F", "Piran Flight T34"
  ];

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
  
  // Manage Elements
  const userSelect = document.getElementById('userSelect');
  const loadUsersBtn = document.getElementById('loadUsersBtn');
  const vehicleGroup = document.getElementById('vehicleGroup');
  const vehicleSelect = document.getElementById('vehicleSelect');
  const colorGroup = document.getElementById('colorGroup');
  const colorSelect = document.getElementById('colorSelect');
  const colorPickerSquare = document.getElementById('colorPickerSquare');
  const durationGroup = document.getElementById('durationGroup');
  const durationDisplay = document.getElementById('durationDisplay');
  const channelGroup = document.getElementById('channelGroup');
  const targetChannelId = document.getElementById('targetChannelId');
  const submitRecordBtn = document.getElementById('submitRecordBtn');

  // Populate Vehicle Options
  vehicles.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    vehicleSelect.appendChild(opt);
  });

  // Calculate 24-Hour Expiration Time
  function updateDuration() {
    const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    durationDisplay.value = expireTime.toLocaleString();
  }
  updateDuration();

  // Color Picker Sync
  colorSelect.addEventListener('change', (e) => {
    colorPickerSquare.value = e.target.value;
  });
  colorPickerSquare.addEventListener('input', (e) => {
    colorSelect.value = e.target.value;
  });

  // Load Users via Server API using Guild ID
  loadUsersBtn.addEventListener('click', async () => {
    const guildId = guildIdInput.value || localStorage.getItem('guildId');
    if (!guildId) {
      alert('Please enter a Guild ID in Settings > Discord first!');
      return;
    }

    try {
      loadUsersBtn.textContent = 'Loading...';
      const res = await fetch(`/api/members?guildId=${guildId}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      userSelect.innerHTML = '<option value="">-- Choose User --</option>';
      data.forEach(user => {
        const opt = document.createElement('option');
        opt.value = `${user.displayName} (@${user.username})`;
        opt.textContent = `${user.displayName} (@${user.username})`;
        userSelect.appendChild(opt);
      });

      alert('Discord users loaded successfully!');
    } catch (err) {
      alert(`Could not load users: ${err.message}`);
    } finally {
      loadUsersBtn.textContent = 'Select >';
    }
  });

  // Step Sequential Reveals
  userSelect.addEventListener('change', () => {
    if (userSelect.value) {
      vehicleGroup.classList.remove('hidden');
    }
  });

  vehicleSelect.addEventListener('change', () => {
    if (vehicleSelect.value) {
      colorGroup.classList.remove('hidden');
      durationGroup.classList.remove('hidden');
      channelGroup.classList.remove('hidden');
      submitRecordBtn.classList.remove('hidden');
    }
  });

  // Generate 5-character Alphanumeric String
  function generateRandomCaseId() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  // Submit Record Handler
  submitRecordBtn.addEventListener('click', async () => {
    let caseNo = document.getElementById('caseNumber').value.trim();
    if (!caseNo) {
      caseNo = generateRandomCaseId();
      document.getElementById('caseNumber').value = caseNo;
    }

    const payload = {
      channelId: targetChannelId.value.trim(),
      caseNumber: caseNo,
      user: userSelect.value,
      vehicle: vehicleSelect.value,
      color: colorPickerSquare.value,
      duration: durationDisplay.value
    };

    if (!payload.channelId) {
      alert('Please enter a target Discord Channel ID!');
      return;
    }

    try {
      submitRecordBtn.textContent = 'Submitting...';
      const response = await fetch('/api/submit-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error);

      alert(`Success! Case #${caseNo} sent to Discord channel.`);
    } catch (err) {
      alert(`Error submitting record: ${err.message}`);
    } finally {
      submitRecordBtn.textContent = 'Submit Record';
    }
  });

  // --- SETTINGS DROPDOWN & PERSISTENCE ---
  const loadSavedSettings = () => {
    const savedTheme = localStorage.getItem('theme') || 'theme-dark';
    document.body.className = savedTheme;
    themeSelect.value = savedTheme;
    botTokenInput.value = localStorage.getItem('botToken') || '';
    guildIdInput.value = localStorage.getItem('guildId') || '';
    botNameInput.value = localStorage.getItem('botName') || '';
    updateBotDashboard();
  };

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!settingsDropdown.contains(e.target) && !settingsBtn.contains(e.target)) {
      settingsDropdown.classList.add('hidden');
    }
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  themeSelect.addEventListener('change', (e) => {
    document.body.className = e.target.value;
    localStorage.setItem('theme', e.target.value);
  });

  let isTokenUnlocked = false;
  lockToggleBtn.addEventListener('click', () => {
    isTokenUnlocked = !isTokenUnlocked;
    if (isTokenUnlocked) {
      botTokenInput.removeAttribute('disabled');
      lockToggleBtn.classList.add('unlocked');
    } else {
      botTokenInput.setAttribute('disabled', 'true');
      lockToggleBtn.classList.remove('unlocked');
    }
  });

  botNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = botNameInput.value.trim();
      if (!name || name.length < 3) {
        botNameInput.classList.add('flash-red');
        errorTag.classList.remove('hidden', 'fade-out');
        setTimeout(() => {
          errorTag.classList.add('fade-out');
          setTimeout(() => {
            errorTag.classList.add('hidden');
            botNameInput.classList.remove('flash-red');
          }, 800);
        }, 1200);
      } else {
        botNameInput.classList.add('flash-green');
        localStorage.setItem('botName', name);
        updateBotDashboard();
        setTimeout(() => botNameInput.classList.remove('flash-green'), 800);
      }
    }
  });

  function updateBotDashboard() {
    const botName = localStorage.getItem('botName');
    const guildId = localStorage.getItem('guildId');
    const container = document.getElementById('botCardsContainer');
    const count = document.getElementById('botCount');

    container.innerHTML = '';
    if (botName) {
      count.textContent = "1 Active Bot";
      const card = document.createElement('div');
      card.className = 'bot-card';
      card.innerHTML = `
        <div class="avatar-wrapper">
          <div class="bot-avatar">${botName.charAt(0).toUpperCase()}</div>
          <div class="status-dot"></div>
        </div>
        <div>
          <h3>${botName}</h3>
          <p class="font-mono">GUID: ${guildId || 'Not Set'}</p>
        </div>
      `;
      container.appendChild(card);
    } else {
      count.textContent = "0 Active";
      container.innerHTML = `<p style="color: var(--text-muted);">No bot connected. Configure settings above.</p>`;
    }
  }

  loadSavedSettings();
});
