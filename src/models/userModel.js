const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone_number: String,
  name: String,
  likedItems: [String],
});

const verificationCodeSchema = new mongoose.Schema({
  phone_number: String,
  code: String,
});

const User = mongoose.model('User', userSchema);
const VerificationCode = mongoose.model(
  'VerificationCode',
  verificationCodeSchema
);

module.exports = {
  User,
  VerificationCode,
};
