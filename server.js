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

// ✅ Health check route (to avoid Render 502 and test deployment)
app.get('/', (req, res) => {
  res.send('✅ Backend is working!');
});

// 🎯 POST endpoint to receive prompt and generate content
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    // 1. Send the prompt to ChatGPT (GPT-4)
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const generatedContent = gptResponse.data.choices[0].message.content;

    // 2. Send the content to WordPress via REST API
    const wpResponse = await axios.post(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/pages`, // You can change to /posts if needed
      {
        title: `Generated Page`,
        content: generatedContent,
        status: 'publish'
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, wp: wpResponse.data });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// 🔁 Start the server (Render requires 0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
