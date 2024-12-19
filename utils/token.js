const crypto = require("crypto");

const generateToken = () => {
  const randomKey = crypto.randomBytes(32).toString("hex");
  const hashedRandomKey = crypto
    .createHash("sha256")
    .update(randomKey)
    .digest("hex");

  return { randomKey, hashedRandomKey };
};

module.exports = generateToken;
