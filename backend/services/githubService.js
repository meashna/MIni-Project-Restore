const axios = require("axios");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const createGist = async (description, files, isPublic = false) => {
  try {
    const response = await axios.post(
      "https://api.github.com/gists",
      {
        description,
        public: isPublic,
        files,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Failed to create gist");
  }
};

module.exports = { createGist };
