const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = Number.isFinite(Number(process.env.BCRYPT_ROUNDS))
  ? Number(process.env.BCRYPT_ROUNDS)
  : 12;

const DUMMY_PASSWORD_HASH =
  process.env.DUMMY_PASSWORD_HASH ||
  bcrypt.hashSync("invalid_password", BCRYPT_ROUNDS);

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function safeCompareHash(value, hash) {
  if (!hash) {
    await bcrypt.compare(value, DUMMY_PASSWORD_HASH);
    return false;
  }
  return bcrypt.compare(value, hash);
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least 1 uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least 1 number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least 1 special character.";
  }
  return null;
}

module.exports = {
  hashPassword,
  comparePassword,
  safeCompareHash,
  validatePassword,
  BCRYPT_ROUNDS,
  DUMMY_PASSWORD_HASH,
};
