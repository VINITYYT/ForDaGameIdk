const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Check both DISCORD_TOKEN and DISCORD_BOT_TOKEN environment variable names
const BOT_TOKEN = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;

if (BOT_TOKEN) {
  client.login(BOT_TOKEN)
    .then(() => console.log(`[BOT READY] Logged in as ${client.user.tag}`))
    .catch(err => console.error("[BOT ERROR] Login failed:", err.message));
} else {
  console.warn("[BOT WARNING] No DISCORD_TOKEN or DISCORD_BOT_TOKEN set in environment variables!");
}

// Serve Main Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint: Fetch Guild Members
app.get('/api/members', async (req, res) => {
  const { guildId } = req.query;

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID is required' });
  }

  // Check if bot is logged in
  if (!client.isReady()) {
    return res.status(500).json({ 
      error: 'Bot is not logged in! Make sure DISCORD_TOKEN or DISCORD_BOT_TOKEN is set in Render Environment Variables.' 
    });
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found or bot is not in this server.' });
    }

    const members = await guild.members.fetch();
    const memberList = members
      .filter(m => !m.user.bot) // Filter out bot accounts
      .map(m => ({
        id: m.user.id,
        username: m.user.username,
        displayName: m.displayName || m.user.username
      }));

    res.json(memberList);
  } catch (err) {
    console.error("--- Error in /api/members ---", err);

    // Dynamic error handling to pinpoint exact problem
    let detailedError = err.message || 'Failed to fetch guild members.';
    
    if (err.code === 50001) {
      detailedError = "Bot lacks access/permissions or is not in that server.";
    } else if (err.code === 50035 || err.message.includes('disallowed intents')) {
      detailedError = "Guild Members Intent is disabled in Discord Developer Portal!";
    } else if (err.code === 10004) {
      detailedError = "Unknown Guild ID. Double check your server ID.";
    }

    res.status(500).json({ error: detailedError });
  }
});

// Endpoint: Submit Record to Discord Channel
app.post('/api/submit-record', async (req, res) => {
  const { channelId, caseNumber, user, vehicle, color, duration } = req.body;

  if (!channelId) return res.status(400).json({ error: 'Target Channel ID is required' });

  if (!client.isReady()) {
    return res.status(500).json({ error: 'Bot is not logged in.' });
  }

  try {
    const channel = await client.channels.fetch(channelId);
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
