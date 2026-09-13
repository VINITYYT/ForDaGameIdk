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

// Start bot if token is provided via environment variable
if (process.env.DISCORD_TOKEN) {
  client.login(process.env.DISCORD_TOKEN).catch(console.error);
}

// Serve Main Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint: Fetch Guild Members
app.get('/api/members', async (req, res) => {
  const { guildId } = req.query;
  if (!guildId) return res.status(400).json({ error: 'Guild ID is required' });

  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    const members = await guild.members.fetch();
    const memberList = members.map(m => ({
      id: m.user.id,
      username: m.user.username,
      displayName: m.displayName
    }));

    res.json(memberList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guild members. Make sure bot is in the server and Guild Members Intent is enabled in Discord Developer Portal.' });
  }
});

// Endpoint: Submit Record to Discord Channel
app.post('/api/submit-record', async (req, res) => {
  const { channelId, caseNumber, user, vehicle, color, duration } = req.body;

  if (!channelId) return res.status(400).json({ error: 'Target Channel ID is required' });

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });

    const embed = new EmbedBuilder()
      .setTitle(`📋 New Record Registered: #${caseNumber}`)
      .setColor(color.startsWith('#') ? color : '#5865F2')
      .addFields(
        { name: 'Case Number', value: caseNumber, inline: true },
        { name: 'User', value: user, inline: true },
        { name: 'Vehicle', value: vehicle, inline: true },
        { name: 'Color', value: color, inline: true },
        { name: 'Expiration (24hr)', value: duration, inline: false }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    res.json({ success: true, message: 'Record posted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to send message to Discord channel' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
