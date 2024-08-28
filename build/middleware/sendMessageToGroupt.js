var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
dotenv.config();
const token = process.env.TGBOT_TOKEN;
// location
const bot = new TelegramBot(token, {
    polling: true,
});
function sendLocation(latitude, longitude, chatId) {
    bot
        .sendLocation(chatId, latitude, longitude)
        .then(() => {
        console.log("Location sent successfully");
    })
        .catch((error) => {
        console.error("Error sending location:", error);
    });
}
const sendMessageToGroup = (chatId, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
        });
        if (data) {
            console.log("Message send");
        }
    }
    catch (error) {
        console.log("Send message groupt error", error);
    }
});
export { sendMessageToGroup, sendLocation };
