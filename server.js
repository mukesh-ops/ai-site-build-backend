const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Mocked /generate endpoint (no OpenAI call)
app.post('/generate', async (req, res) => {
  const { prompt, siteUrl, wpKey } = req.body;

  try {
    console.log("🔧 Using mocked OpenAI response");

    // 1. Fake AI response for testing
    const generatedContent = `<h2>This is a mock site generated for:</h2><p>${prompt}</p>`;

    // 2. Send to WordPress (replace siteUrl/wpKey if using input from frontend)
    const wpResponse = await axios.post(
      `${process.env.WP_SITE_URL || siteUrl}/wp-json/wp/v2/pages`,
      {
        title: `Mocked AI Page`,
        content: generatedContent,
        status: 'publish'
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD || wpKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, wp: wpResponse.data });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

// Optional: base route to check server status
app.get('/', (req, res) => {
  res.send('✅ AI Site Builder backend is running (mock mode)');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
