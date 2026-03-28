const axios = require("axios");

/**
 * Sends raw comment text to an external analysis API.
 * Returns the API response data, or null if the request fails.
 */
async function analyzeComment(text) {
  try {
    const response = await axios.post(
      process.env.AI_PLATFORM_URL,
      { text },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.COMMENT_ANALYSIS_API_KEY}`
        },
        timeout: 5000
      }
    );
    return response.data;
  } catch (err) {
    console.error("[CommentAnalysis] Error:", err.message);
    return null;
  }
}

module.exports = { analyzeComment };
