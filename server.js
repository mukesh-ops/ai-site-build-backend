// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint for receiving prompt
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    // 1. Send to ChatGPT
    const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const generatedContent = gptResponse.data.choices[0].message.content;

    // 2. Send to WordPress
    const wpResponse = await axios.post(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/pages`, // or posts
      {
        title: `Generated Page`,
        content: generatedContent,
        status: 'publish'
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, wp: wpResponse.data });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
