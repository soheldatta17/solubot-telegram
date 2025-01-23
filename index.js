const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Load environment variables
const axios = require('axios'); // Import Axios for HTTP requests

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Use the Telegram bot token from the .env file
const token = process.env.TELEGRAM_BOT_TOKEN;

// Function to handle polling errors
function handlePollingError(error) {
    if (error.response && error.response.statusCode === 409) {
        console.error('Polling error: 409 Conflict. Make sure no other bot instance is running.');
    } else {
        console.error('Polling error:', error);
    }
}

// Create a bot instance with polling
let bot;
try {
    bot = new TelegramBot(token, { polling: true });
    console.log('Telegram bot polling started successfully.');
} catch (error) {
    handlePollingError(error);
}

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

// Set up each command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /start by user: ${msg.from.username || msg.from.first_name}`);
    bot.sendMessage(chatId, 'Welcome to the Telegram Bot! Type /help to see available commands.');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /help by user: ${msg.from.username || msg.from.first_name}`);
    const helpMessage = Object.entries(commands)
        .map(([command, description]) => `${command} - ${description}`)
        .join('\n');
    bot.sendMessage(chatId, `Here are the available commands:\n\n${helpMessage}`);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const echoText = match[1];
    console.log(`[Command Executed] /echo by user: ${msg.from.username || msg.from.first_name}, Text: ${echoText}`);
    bot.sendMessage(chatId, `Echo: ${echoText}`);
});

bot.onText(/\/joke/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /joke by user: ${msg.from.username || msg.from.first_name}`);
    try {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        bot.sendMessage(chatId, `${response.data.setup}\n\n${response.data.punchline}`);
    } catch (error) {
        bot.sendMessage(chatId, 'Oops! Could not fetch a joke at the moment.');
    }
});

bot.onText(/\/time/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /time by user: ${msg.from.username || msg.from.first_name}`);
    const currentTime = new Date().toLocaleString();
    bot.sendMessage(chatId, `Current server time: ${currentTime}`);
});

bot.onText(/\/cat/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /cat by user: ${msg.from.username || msg.from.first_name}`);
    try {
        const response = await axios.get('https://meowfacts.herokuapp.com/');
        bot.sendMessage(chatId, `Cat Fact: ${response.data.data[0]}`);
    } catch (error) {
        bot.sendMessage(chatId, 'Oops! Could not fetch a cat fact at the moment.');
    }
});

bot.onText(/\/advice/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /advice by user: ${msg.from.username || msg.from.first_name}`);
    try {
        const response = await axios.get('https://api.adviceslip.com/advice');
        bot.sendMessage(chatId, `Life Advice: ${JSON.parse(response.data).slip.advice}`);
    } catch (error) {
        bot.sendMessage(chatId, 'Oops! Could not fetch advice at the moment.');
    }
});

bot.onText(/\/trivia/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /trivia by user: ${msg.from.username || msg.from.first_name}`);
    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1');
        const trivia = response.data.results[0];
        bot.sendMessage(chatId, `Trivia: ${trivia.question} (Answer: ${trivia.correct_answer})`);
    } catch (error) {
        bot.sendMessage(chatId, 'Oops! Could not fetch trivia at the moment.');
    }
});

bot.onText(/\/quote/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`[Command Executed] /quote by user: ${msg.from.username || msg.from.first_name}`);
    try {
        const response = await axios.get('https://api.quotable.io/random');
        bot.sendMessage(chatId, `"${response.data.content}"\n\n- ${response.data.author}`);
    } catch (error) {
        bot.sendMessage(chatId, 'Oops! Could not fetch a quote at the moment.');
    }
});

// Handle unknown commands
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text.startsWith('/')) return;
    const isKnownCommand = Object.keys(commands).includes(msg.text.split(' ')[0]);
    if (!isKnownCommand) {
        console.log(`[Unknown Command] ${msg.text} by user: ${msg.from.username || msg.from.first_name}`);
        bot.sendMessage(chatId, 'Unknown command! Type /help to see the available commands.');
    }
});

// Express route to check bot status
app.get('/', (req, res) => {
    res.send('Telegram bot is live and running!');
});

// Start Express server
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
