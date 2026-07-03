const buildPrompt = (data) => {
  return `Summarize the following attendance records: ${JSON.stringify(data)}`;
};

module.exports = {
  buildPrompt
};
