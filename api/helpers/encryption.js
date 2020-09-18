const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { secret } = require("../../config/main");

module.exports = {
  encrypt: async (text) => {
    const hash = await bcrypt.hash(text, 10);
    return hash;
  },

  encryptUsingHmac: async (text) => {
    return await crypto.createHmac("sha256", secret).update(text).digest("hex");
  },
};
