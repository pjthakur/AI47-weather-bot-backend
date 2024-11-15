require('dotenv').config();
const User = require("../schema/user")
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });


// Subscribe for weather updates
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    const newUser = new User({ telegramId: chatId, subscribed: true });
    await newUser.save();
    bot.sendMessage(chatId, 'You are now subscribed to daily weather updates!');
  } else if (!user.subscribed) {
    user.subscribed = true;
    await user.save();
    bot.sendMessage(chatId, 'You have resubscribed to daily weather updates!');
  } else {
    bot.sendMessage(chatId, 'You are already subscribed for daily weather updates.');
  }
});

// Unsubscribe from weather updates
bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOneAndUpdate({ telegramId: chatId }, { subscribed: false });
  
  if (user) {
    bot.sendMessage(chatId, 'You have unsubscribed from weather updates.');
  } else {
    bot.sendMessage(chatId, 'You are not subscribed.');
  }
});

bot.onText(/\/weather/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramId: chatId });
    if (user.subscribed) {
      try {
        const weather = await getWeather(); 
        bot.sendMessage(chatId, `Today's weather: \n\n${weather}`);
      } catch (error) {
        bot.sendMessage(chatId, 'Sorry, I could not fetch the weather right now.');
      }
    }
    else{
      bot.sendMessage(chatId, 'You are not subscribed.');
    }

  });


// Send weather update according schedule
async function sendWeatherUpdate() {
  const users = await User.find({ subscribed: true });

  users.forEach(async (user) => {
    const weather = await getWeather();
    bot.sendMessage(user.telegramId, `Today's weather: ${weather}`);
  });
}

// Fetch weather data from weather stack API
async function getWeather() {
  try {
    const response = await axios.get(`http://api.weatherstack.com/current?access_key=${process.env.WEATHER_API_KEY}&query=Noida`);
    const data = response.data;
    // console.log(data)
    return `Temperature: ${(data.current.temperature)}°C\nWeather: ${data.current.weather_descriptions}\nLocation: ${data.location.name}, ${data.location.country}`;
  } catch (error) {
    console.error(error);
    return 'Unable to fetch weather data.';
  }
}


// Schedule weather updates 
cron.schedule('0 8 * * *', () => {
  sendWeatherUpdate();
});
