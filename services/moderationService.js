const axios = require("axios");

/**
 * Checks comment text for toxic or sensitive content.
 * Returns { flagged: boolean, reason: string|null }
 */
async function moderateComment(text) {
  try {
    const response = await axios.post(
      `${process.env.AI_PLATFORM_URL}/api/v1/chat`,
      { prompt: text },
      {
        headers: {
          "X-API-Key": process.env.COMMENT_MODERATOR_SERVICE,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    const result = response.data;
    console.log('ppppp')
    console.log(result)



    // API returns: { flagged, category, confidence, action }
    // action: "allow" | "review" | "remove"
    if (result.action === "remove") {
      return {
        flagged: true,
        reason: `Your comment was removed due to ${result.category.replace(/_/g, " ")} content.`,
      };
    }

    if (result.action === "review") {
      return {
        flagged: true,
        reason: `Your comment was flagged for review due to ${result.category.replace(/_/g, " ")} content.`,
      };
    }

    return { flagged: false, reason: null };
  } catch (err) {
    // If moderation service is down, fail open (allow comment) but log the error
    console.error("[ModerationService] Error:", err.message);
    return { flagged: false, reason: null };
  }
}

module.exports = { moderateComment };
