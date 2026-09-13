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

// --- FETCH DISCORD GUILD MEMBERS ---
app.get('/api/members', async (req, res) => {
  try {
    const token = extractToken(req);
    const guildId = req.query.guildId;

    if (!token) {
      return res.status(400).json({ error: 'No Bot Token provided!' });
    }
    if (!guildId) {
      return res.status(400).json({ error: 'No Guild ID provided!' });
    }

    // Strip accidental "Bot " or "Bearer " prefixes if already attached
    const cleanToken = token.replace(/^(Bot|Bearer)\s+/i, '').trim();

    console.log(`[DISCORD FETCH] Requesting members for Guild: ${guildId}`);

    // Call Discord REST API with required "Bot " authorization prefix
    const discordRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: {
        'Authorization': `Bot ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await discordRes.json();

    if (!discordRes.ok) {
      console.error('[DISCORD API REJECTED]', data);
      return res.status(discordRes.status).json({ 
        error: data.message || `Discord Error (${discordRes.status}): Check Bot Permissions or Server Members Intent`
      });
    }

    // Map Discord member objects to clean display options
    const members = data
      .filter(m => !m.user.bot) // Filter out other bots
      .map(m => ({
        id: m.user.id,
        username: m.user.username,
        displayName: m.nick || m.user.global_name || m.user.username
      }));

    return res.json(members);

  } catch (err) {
    console.error('[SERVER ERROR]', err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
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
