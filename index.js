const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// Create an Express application
const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Use the API key from the .env file
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot instance but do not poll for messages immediately
const bot = new TelegramBot(token, { polling: false });

// Available commands and their descriptions
const commands = {
    '/start': 'Start the bot and get a welcome message',
    '/help': 'List all available commands and their descriptions',
    '/echo': 'Echo back the text you send (Usage: /echo YourText)',
    '/joke': 'Get a random joke',
    '/time': 'Get the current server time',
    '/cat': 'Get a random cat fact'
};

// Handle the '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to my Telegram bot! Type /help to see what I can do.');
});

// Handle the '/help' command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = Object.entries(commands)
        .map(([command, description]) => `${command} - ${description}`)
        .join('\n');
    bot.sendMessage(chatId, `Here are the available commands:\n\n${helpText}`);
});

// Handle the '/echo' command
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const echoText = match[1]; // Extract the text after /echo
    bot.sendMessage(chatId, `You said: ${echoText}`);
});

// Handle the '/joke' command
bot.onText(/\/joke/, (msg) => {
    const chatId = msg.chat.id;
    const jokes = [
        'Why don’t skeletons fight each other? They don’t have the guts!',
        'What do you call fake spaghetti? An impasta!',
        'Why don’t scientists trust atoms? Because they make up everything!'
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    bot.sendMessage(chatId, randomJoke);
});

// Handle the '/time' command
bot.onText(/\/time/, (msg) => {
    const chatId = msg.chat.id;
    const currentTime = new Date().toLocaleString();
    bot.sendMessage(chatId, `The current server time is: ${currentTime}`);
});

// Handle the '/cat' command to fetch a random cat fact
bot.onText(/\/cat/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://catfact.ninja/fact');
        const catFact = response.data.fact;
        bot.sendMessage(chatId, `🐱 Cat Fact: ${catFact}`);
    } catch (error) {
        console.error('Error fetching cat fact:', error.message);
        bot.sendMessage(chatId, 'Sorry, I couldn’t fetch a cat fact right now. Please try again later.');
    }
});

// Handle any unknown commands in the bot
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text.startsWith('/')) return; // Ignore non-command messages
    const isKnownCommand = Object.keys(commands).includes(msg.text.split(' ')[0]);
    if (!isKnownCommand) {
        bot.sendMessage(chatId, `Unknown command! Type /help to see the available commands.`);
    }
});

// Define the route for '/'
app.get('/', (req, res) => {
    res.send('Hello! The bot is now triggered for messages in Telegram. Use the commands below.');

    // When the `/` route is hit, start polling the Telegram bot for messages
    bot.startPolling();
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

console.log('Server and Telegram bot are running...');
