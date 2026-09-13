const express = require('express');
const path = require('path');
const { REST, Routes, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Serve Main Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function extractToken(req) {
  const queryToken = req.query.token;
  const headerToken = req.headers['x-bot-token'];
  const authHeader = req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '').trim() : null;
  const envToken = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;

  console.log(`[API REQUEST] Token from Query: "${queryToken || ''}" | Header: "${headerToken || ''}" | Env: "${envToken ? 'EXISTS' : 'EMPTY'}"`);

  return queryToken || headerToken || authHeader || envToken;
}

// Endpoint: Fetch Guild Members
app.get('/api/members', async (req, res) => {
  const { guildId } = req.query;
  const botToken = extractToken(req);

  if (!botToken || botToken.trim() === '') {
    return res.status(400).json({ error: 'No Bot Token provided! Please enter your Bot Token in Settings.' });
  }

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID is required.' });
  }

  const rest = new REST({ version: '10' }).setToken(botToken.trim());

  try {
    const members = await rest.get(Routes.guildMembers(guildId), {
      query: new URLSearchParams({ limit: 1000 })
    });

    const memberList = members
      .filter(m => !m.user.bot)
      .map(m => ({
        id: m.user.id,
        username: m.user.username,
        displayName: m.nick || m.user.global_name || m.user.username
      }));

    res.json(memberList);
  } catch (err) {
    console.error("--- Error in /api/members ---", err);

    let errorMsg = err.message || 'Failed to fetch guild members.';

    if (err.status === 401 || err.code === 0) {
      errorMsg = 'Invalid Bot Token! Check your token in Settings > Discord.';
    } else if (err.status === 403 || err.code === 50001) {
      errorMsg = 'Bot is not in that server, or Server Members Intent is disabled in Discord Developer Portal!';
    } else if (err.status === 404 || err.code === 10004) {
      errorMsg = 'Unknown Guild ID. Double check your server ID in Settings.';
    }

    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Submit Record to Discord Channel
app.post('/api/submit-record', async (req, res) => {
  const { channelId, caseNumber, user, vehicle, color, duration } = req.body;
  const botToken = extractToken(req);

  if (!botToken || botToken.trim() === '') {
    return res.status(400).json({ error: 'No Bot Token provided! Enter your Bot Token in Settings.' });
  }

  if (!channelId) {
    return res.status(400).json({ error: 'Target Channel ID is required.' });
  }

  const rest = new REST({ version: '10' }).setToken(botToken.trim());

  try {
    const embed = new EmbedBuilder()
      .setTitle(`📋 New Record Registered: #${caseNumber}`)
      .setColor(color && color.startsWith('#') ? color : '#5865F2')
      .addFields(
        { name: 'Case Number', value: caseNumber || 'N/A', inline: true },
        { name: 'User', value: user || 'N/A', inline: true },
        { name: 'Vehicle', value: vehicle || 'N/A', inline: true },
        { name: 'Color', value: color || 'N/A', inline: true },
        { name: 'Expiration (24hr)', value: duration || 'N/A', inline: false }
      )
      .setTimestamp();

    await rest.post(Routes.channelMessages(channelId), {
      body: { embeds: [embed.toJSON()] }
    });

    res.json({ success: true, message: 'Record posted successfully!' });
  } catch (err) {
    console.error("--- Error in /api/submit-record ---", err);

    let errorMsg = err.message || 'Failed to send message to Discord channel.';
    if (err.status === 401) errorMsg = 'Invalid Bot Token!';
    if (err.status === 403) errorMsg = 'Bot lacks permission to send messages in that channel!';
    if (err.status === 404) errorMsg = 'Unknown Channel ID!';

    res.status(500).json({ error: errorMsg });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
