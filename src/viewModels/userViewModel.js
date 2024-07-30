const { User, VerificationCode } = require('../models/userModel');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Fetch and update token
let token = '';
const getToken = async () => {
  try {
    const { data } = await axios.post(
      'https://notify.eskiz.uz/api/auth/login',
      {
        email: process.env.ESKIZ_EMAIL,
        password: process.env.ESKIZ_PASSWORD,
      }
    );
    if (data) {
      token = data.data.token;
    }
  } catch (error) {
    console.error(
      'Error getting token:',
      error.response ? error.response.data : error.message
    );
  }
};

const sendMesagToPhone = async (message) => {
  try {
    const { data } = await axios.post(
      'https://notify.eskiz.uz/api/message/sms/send',
      message,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (data) {
      console.log('Message sent successfully:', data);
    }
  } catch (error) {
    console.error(
      'Error sending message:',
      error.response ? error.response.data : error.message
    );
  }
};

const sendMessage = async (chatId, message, botToken) => {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const params = {
    chat_id: chatId,
    text: message,
  };

  try {
    await axios.post(url, params);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// ViewModel functions
const createUser = async (phone_number, name) => {
  return await User.findOneAndUpdate(
    { phone_number },
    { name },
    { upsert: true, new: true }
  );
};

const createVerificationCode = async (phone_number, code) => {
  return await VerificationCode.findOneAndUpdate(
    { phone_number },
    { code },
    { upsert: true, new: true }
  );
};

const getVerificationCode = async (phone_number) => {
  return await VerificationCode.findOne({ phone_number });
};

const deleteVerificationCode = async (phone_number) => {
  return await VerificationCode.deleteOne({ phone_number });
};

module.exports = {
  getToken,
  sendMesagToPhone,
  sendMessage,
  createUser,
  createVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
};
