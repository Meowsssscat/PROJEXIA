const axios = require("axios");

/**
 * Sends raw comment text to an external analysis API.
 * Returns the API response data, or null if the request fails.
 */
async function analyzeComment(text) {
  console.log('[CommentAnalysis] Sending text to API:', text);
  try {
    const response = await axios.post(
      `${process.env.AI_PLATFORM_URL}/api/v1/chat`,
      { prompt: text },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.COMMENT_MODERATOR_SERVICE
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
