// On your Render server.js file:
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve the index.html website directly!

// Endpoint to fetch real live bots connected
app.get('/api/bot-status', (req, res) => {
  res.json({
    online: client.user ? true : false,
    botName: client.user ? client.user.tag : "Offline",
    guildsConnected: client.guilds.cache.size
  });
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on Render'));