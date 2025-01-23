const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // Import Axios for HTTP requests
require('dotenv').config(); // Load environment variables

// Initialize Express app
const app = express();
const HOST = '0.0.0.0';
const PORT = 5000; // Updated to listen on port 5000

// Use the Telegram bot token from the .env file
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Define the bot's commands and their descriptions
const commands = {
    '/start': 'Start the bot and get a welcome message',
    '/help': 'List all available commands and their descriptions',
    '/echo': 'Echo back the text you send (Usage: /echo YourText)',
    '/joke': 'Get a random joke',
    '/time': 'Get the current server time',
    '/cat': 'Get a random cat fact',
    '/advice': 'Get random life advice',
    '/trivia': 'Get a random trivia fact',
    '/quote': 'Get an inspirational quote',
};

// Handle '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to my Telegram bot! Type /help to see what I can do.');
});

// Handle '/help' command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = Object.entries(commands)
        .map(([command, description]) => `${command} - ${description}`)
        .join('\n');
    bot.sendMessage(chatId, `Here are the available commands:\n\n${helpText}`);
});

// Handle '/echo' command
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const echoText = match[1];
    bot.sendMessage(chatId, `You said: ${echoText}`);
});

// Handle '/joke' command
bot.onText(/\/joke/, (msg) => {
    const chatId = msg.chat.id;
    const jokes = [
        'Why don’t skeletons fight each other? They don’t have the guts!',
        'What do you call fake spaghetti? An impasta!',
        'Why don’t scientists trust atoms? Because they make up everything!',
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    bot.sendMessage(chatId, randomJoke);
});

// Handle '/time' command
bot.onText(/\/time/, (msg) => {
    const chatId = msg.chat.id;
    const currentTime = new Date().toLocaleString();
    bot.sendMessage(chatId, `The current server time is: ${currentTime}`);
});

// Handle '/cat' command
bot.onText(/\/cat/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://catfact.ninja/fact');
        bot.sendMessage(chatId, `🐱 Cat Fact: ${response.data.fact}`);
    } catch (error) {
        console.error('Error fetching cat fact:', error.message);
        bot.sendMessage(chatId, 'Sorry, I couldn’t fetch a cat fact right now.');
    }
});

// Handle '/advice' command
bot.onText(/\/advice/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://api.adviceslip.com/advice');
        bot.sendMessage(chatId, `💡 Advice: ${response.data.slip.advice}`);
    } catch (error) {
        console.error('Error fetching advice:', error.message);
        bot.sendMessage(chatId, 'Sorry, I couldn’t fetch advice right now.');
    }
});

// Handle '/trivia' command
bot.onText(/\/trivia/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        bot.sendMessage(chatId, `🧠 Trivia: ${response.data.text}`);
    } catch (error) {
        console.error('Error fetching trivia:', error.message);
        bot.sendMessage(chatId, 'Sorry, I couldn’t fetch a trivia fact right now.');
    }
});

// Handle '/quote' command
bot.onText(/\/quote/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://api.quotable.io/random');
        bot.sendMessage(chatId, `📜 Quote: ${response.data.content} — ${response.data.author}`);
    } catch (error) {
        console.error('Error fetching quote:', error.message);
        bot.sendMessage(chatId, 'Sorry, I couldn’t fetch a quote right now.');
    }
});

// Handle unknown commands
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text.startsWith('/')) return;
    const isKnownCommand = Object.keys(commands).includes(msg.text.split(' ')[0]);
    if (!isKnownCommand) {
        bot.sendMessage(chatId, 'Unknown command! Type /help to see the available commands.');
    }
});

// Express route to check bot status
app.get('/route', (req, res) => {
    res.send('Telegram bot is live and running!');
});

// Start Express server
app.listen(PORT, HOST, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
});
