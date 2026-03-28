const axios = require("axios");

/**
 * Sends raw comment text to an external analysis API.
 * Returns the API response data, or null if the request fails.
 */
async function analyzeComment(text, userId) {
  console.log('[CommentAnalysis] Sending text to API:', text);
  try {
    const response = await axios.post(
      process.env.AI_PLATFORM_URL + '/api/v1/chat',
      { prompt: text, user_id: userId, session_id: null },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.COMMENT_MODERATOR_SERVICE
        },
        timeout: 5000
      }
    );

    // response.data.message is a JSON string like '{"toxic":true,...}'
    const result = typeof response.data.message === 'string'
      ? JSON.parse(response.data.message)
      : response.data.message;

    return result;
  } catch (err) {
    console.error("[CommentAnalysis] Error:", err.message);
    console.error("[CommentAnalysis] Response data:", JSON.stringify(err.response?.data));
    console.error("[CommentAnalysis] Status:", err.response?.status);
    return null;
  }
}

module.exports = { analyzeComment };
