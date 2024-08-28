import axios from "axios";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
dotenv.config();
const token = process.env.TGBOT_TOKEN;

// location
const bot = new TelegramBot(token as string, {
  polling: true,
});

function sendLocation(latitude: number, longitude: number, chatId: string) {
  bot
    .sendLocation(chatId, latitude, longitude)
    .then(() => {
      console.log("Location sent successfully");
    })
    .catch((error) => {
      console.error("Error sending location:", error);
    });
}

const sendMessageToGroup = async (chatId: string, message: string) => {
  try {
    const { data } = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      }
    );
    if (data) {
      console.log("Message send");
    }
  } catch (error) {
    console.log("Send message groupt error", error);
  }
};
export { sendMessageToGroup, sendLocation };
