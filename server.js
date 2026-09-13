const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Single client instance
let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Helper: Ensure client is logged in with the token provided by the frontend UI
async function ensureAuthenticated(token) {
  if (!token) {
    throw new Error('No Bot Token provided! Please enter your Discord Bot Token in Settings.');
  }

  // If already logged in with the exact same token, return client
  if (client.isReady() && client.token === token) {
    return client;
  }

  // If logged in with a different token, destroy previous connection
  if (client.token && client.token !== token) {
    await client.destroy();
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
      ]
    });
  }

  // Log in with the token provided from the website UI
  await client.login(token);
  return client;
}

// Serve Main Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint: Fetch Guild Members
app.get('/api/members', async (req, res) => {
  const { guildId } = req.query;
  const botToken = req.headers['x-bot-token'] || process.env.DISCORD_TOKEN;

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID is required.' });
  }

  try {
    // Authenticate bot dynamically
    const botClient = await ensureAuthenticated(botToken);

    const guild = await botClient.guilds.fetch(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found or bot is not in this server.' });
    }

    const members = await guild.members.fetch();
    const memberList = members
      .filter(m => !m.user.bot)
      .map(m => ({
        id: m.user.id,
        username: m.user.username,
        displayName: m.displayName || m.user.username
      }));

    res.json(memberList);
  } catch (err) {
    console.error("--- Error in /api/members ---", err);
    let errorMsg = err.message || 'Failed to fetch guild members.';

    if (err.code === 'TOKEN_INVALID' || err.message.includes('An invalid token')) {
      errorMsg = 'Invalid Bot Token! Please check your token in Settings > Discord.';
    } else if (err.code === 50001) {
      errorMsg = 'Bot lacks permissions or is not in that server.';
    } else if (err.code === 50035 || err.message.includes('disallowed intents')) {
      errorMsg = 'Guild Members Intent is disabled in Discord Developer Portal!';
    }

    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Submit Record to Discord Channel
app.post('/api/submit-record', async (req, res) => {
  const { channelId, caseNumber, user, vehicle, color, duration } = req.body;
  const botToken = req.headers['x-bot-token'] || process.env.DISCORD_TOKEN;

  if (!channelId) return res.status(400).json({ error: 'Target Channel ID is required' });

  try {
    const botClient = await ensureAuthenticated(botToken);

    const channel = await botClient.channels.fetch(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });

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

    await channel.send({ embeds: [embed] });
    res.json({ success: true, message: 'Record posted successfully!' });
  } catch (err) {
    console.error("--- Error in /api/submit-record ---", err);
    res.status(500).json({ error: err.message || 'Failed to send message to Discord channel' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
