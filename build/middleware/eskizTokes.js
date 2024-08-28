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
dotenv.config();
const email = process.env.ESKIZ_EMAIL;
const password = process.env.ESKIZ_PASSWORD;
let token = "";
const getEskizToken = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (email && password) {
            const { data } = yield axios.post("https://notify.eskiz.uz/api/auth/login", {
                email,
                password,
            });
            if (data) {
                token = data.token;
                token = data.data.token;
            }
        }
    }
    catch (error) {
        console.log("Error eskiz get token", error);
    }
});
const sendCodeToPhoneNumber = (_a) => __awaiter(void 0, [_a], void 0, function* ({ phone_number, code }) {
    const info = {
        mobile_phone: phone_number,
        message: `vodiytezkor.uz saytiga ro‘yxatdan o‘tish uchun tasdiqlash kodi: ${code}`,
        from: 4546,
    };
    try {
        const { data } = yield axios.post("https://notify.eskiz.uz/api/message/sms/send", info, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
    catch (error) {
        if (error.response) {
            // Server responded with a status other than 2xx
            console.log("Error response:", error.response.data);
            console.log("Status code:", error.response.status);
            console.log("Headers:", error.response.headers);
        }
        else if (error.request) {
            // Request was made but no response was received
            console.log("Error request:", error.request);
        }
        else {
            // Something else happened while setting up the request
            console.log("Send code error:", error.message);
        }
    }
});
export { getEskizToken, sendCodeToPhoneNumber };
