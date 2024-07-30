// userController.js
const jwt = require('jsonwebtoken');
const { User, VerificationCode } = require('../models/userModel'); // Add this line
const {
  getToken,
  sendMesagToPhone,
  sendMessage,
  createUser,
  createVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
} = require('../viewModels/userViewModel');

// Get token on startup
getToken();

const sendCode = async (req, res) => {
  const { phone_number, name } = req.body;
  const code = Math.floor(10000 + Math.random() * 90000).toString();

  await createUser(phone_number, name);
  await createVerificationCode(phone_number, code);

  const data = {
    mobile_phone: phone_number,
    message: `Your verification code is: ${code}`,
    from: 4546,
  };

  await sendMesagToPhone(data);
  res.status(200).send({ code });
};

const verifyCode = async (req, res) => {
  const { phone_number, code } = req.body;

  const verificationCode = await getVerificationCode(phone_number);

  if (verificationCode && verificationCode.code === code) {
    const access_token = jwt.sign({ phone_number }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    await deleteVerificationCode(phone_number);
    res.status(200).json({ access_token });
  } else {
    res.status(400).send('Invalid verification code');
  }
};

const getUserInfo = async (req, res) => {
  const { phone_number } = req.user;
  const user = await User.findOne({ phone_number });

  if (user) {
    res.status(200).json({ phone_number, name: user.name });
  } else {
    res.status(404).send('User not found');
  }
};

const orderProducts = (req, res) => {
  const { first_name, last_name, phone_number, comment, isDelivery, products } =
    req.body;
  const myProducts = JSON.parse(products);
  let message = `Xaridor ismi: ${first_name} Familyasi: ${last_name}\n`;
  message += `Tel raqam: ${phone_number}\n`;
  message += `Izoh: ${comment}\n\n`;

  if (isDelivery) {
    const { door_phone, entrance, floor, home_number, office, street } =
      req.body;
    message += `Ko'cha nomi: ${street}\n`;
    message += `Uy raqami: ${home_number}\n`;
    message += `Uy qavatda: ${floor}\n`;
    message += `Office: ${office}\n`;
    message += `Kirish yo'lagi: ${entrance}\n`;
    message += `Dom damafon codi: ${door_phone}\n`;
  }
  message += 'Sotib olingan maxsulotlar\n\n';

  myProducts.forEach((item) => {
    message += `Nomi: ${item.title}\n`;
    message += `Miqdori:  ${item.count}\n`;
    message += `Narxi: ${item.price}\n`;
  });

  if (first_name && last_name && phone_number) {
    res.status(200).json({ msg: "Sizning ma'lumotlaringiz yuborildi." });
    sendMessage(process.env.CHAT_ID, message, process.env.TGBOT_TOKEN);
  }
};

const getUserLikedList = async (req, res) => {
  const { phone_number } = req.user;

  try {
    const user = await User.findOne({ phone_number });

    if (user) {
      res.send(user?.likedItems);
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

const userLike = async (req, res) => {
  const { phone_number } = req.user;
  const { itemId } = req.body;

  try {
    const user = await User.findOne({ phone_number });

    if (user) {
      if (!user.likedItems.includes(itemId)) {
        user.likedItems.push(itemId);
        await user.save();
        res.status(200).json({ msg: 'Item added to liked list' });
      } else {
        user.likedItems = user.likedItems.filter(
          (item) => item !== `${itemId}`
        );
        await user.save();
        res.status(200).json({ msg: 'Item removed in liked list' });
      }
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
};

// Additional controller functions for liked items and order handling...

module.exports = {
  sendCode,
  verifyCode,
  getUserInfo,
  orderProducts,
  getUserLikedList,
  userLike,
  // Other functions...
};
