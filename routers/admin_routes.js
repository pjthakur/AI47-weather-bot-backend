require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require("../schema/user")
const Admin = require("../schema/admin")

const router = express.Router()


// Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Admin login
router.get('/testing',(req,res)=>{
  res.send("Hello tester")
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (admin && admin.password == password) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(400).send('Invalid credentials');
  }
});

// Update API key
router.post('/update-api-key', authenticateToken, (req, res) => {
  // logic to update API keys
  res.send('API key updated');
});

// Block user
router.post('/block-user', authenticateToken, async (req, res) => {
  const { telegramId } = req.body;
  await User.findOneAndUpdate({ telegramId }, { subscribed: false });
  res.send('User blocked');
});

// Delete user
router.post('/delete-user', authenticateToken, async (req, res) => {
  const { telegramId } = req.body;
  await User.findOneAndDelete({ telegramId });
  res.send('User deleted');
});


module.exports = router