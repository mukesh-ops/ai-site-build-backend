const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://aisitebuild.netlify.app'
}));

app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    // ✅ MOCKED GPT RESPONSE (for testing only)
    const generatedContent = `
      <h2>This is a mocked page generated from the prompt:</h2>
      <p>${prompt}</p>
    `;

    // Send to WordPress
    const wpResponse = await axios.post(
      `${process.env.WP_SITE_URL}/wp-json/wp/v2/pages`, // or posts
      {
        title: `Mocked Page`,
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
  console.log(`✅ Server running on port ${PORT}`);
});
