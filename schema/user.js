const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    telegramId: {
        type:String,
        unique: true,
    },
    subscribed: Boolean,
  });
const User = mongoose.model('weather-User', userSchema);
module.exports = User