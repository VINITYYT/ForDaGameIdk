// Helper to reliably get token even if elements/storage are obfuscated
  function getStoredToken() {
    const el = document.getElementById('botToken');
    const val = el ? el.value.trim() : '';
    const storageVal = localStorage.getItem('botToken') || '';
    return val || storageVal;
  }

  // Fetch Guild Members API Call
  loadUsersBtn.addEventListener('click', async () => {
    const rawGuildId = guildIdInput ? guildIdInput.value.trim() : '';
    const guildId = rawGuildId || localStorage.getItem('guildId');
    const token = getStoredToken();

    if (!token) {
      alert('Please enter your Discord Bot Token in Settings first!');
      return;
    }

    if (!guildId) {
      alert('Please enter a Guild ID in Settings > Discord first!');
      return;
    }

    try {
      loadUsersBtn.textContent = 'Loading...';

      // Send token in both URL parameter and Headers
      const res = await fetch(`/api/members?guildId=${encodeURIComponent(guildId)}&token=${encodeURIComponent(token)}`, {
        headers: {
          'x-bot-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch members');
      }

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
