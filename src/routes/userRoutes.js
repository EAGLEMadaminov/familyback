const express = require('express');
const {
  sendCode,
  verifyCode,
  getUserInfo,
  orderProducts,
  getUserLikedList,
  userLike,
} = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware'); // Assume middleware is implemented

const router = express.Router();

router.post('/auth/send-code', sendCode);
router.post('/auth/verify-code', verifyCode);
router.get('/user-info', authenticateToken, getUserInfo);
router.get('/order', orderProducts);
router.get('/liked-list', authenticateToken, getUserLikedList);
router.post('/like', authenticateToken, userLike);

// Additional routes...

module.exports = router;
