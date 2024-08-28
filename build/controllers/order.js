import { sendMessageToGroup, sendLocation, } from "../middleware/sendMessageToGroupt.js";
import dotenv from "dotenv";
dotenv.config();
const orderController = (req, res) => {
    const { phone_number, first_name, last_name, comment, isDelivery, products, map, } = req.body;
    let message2 = "";
    let message = `Name ${first_name} ${last_name}\n`;
    message += `Telefon raqam: ${phone_number}\n\n`;
    let buyingBroducts = JSON.parse(products);
    if (isDelivery) {
        message += `${first_name} Manzili\n\n`;
        const { home_number, door_phone, entrance, floor, office, street } = req.body;
        message += `Ko'cha ${street}\n`;
        message += `Uy raqami ${home_number}\n`;
        if (floor) {
            message += `Nechinchi qavat ${floor}\n`;
        }
        if (office) {
            message += `Office ${office}\n`;
        }
        if (entrance) {
            message += `Yo'lak ${entrance}\n\n`;
        }
    }
    if (comment) {
        message += `Comment ${comment}\n\n`;
    }
    message2 = message;
    message += "Sotib olingan maxsulotlar\n\n";
    let hasFamilyProducts = false;
    let hasShabboda = false;
    buyingBroducts.forEach((product, index) => {
        if ((product === null || product === void 0 ? void 0 : product.restaurant_id) === Number(process.env.CHAT_ID)) {
            hasFamilyProducts = true;
        }
        else if ((product === null || product === void 0 ? void 0 : product.restaurant_id) === Number(process.env.CHAT_ID_FOR_Shuxrat_aka)) {
            hasShabboda = true;
        }
        const productInfo = `Maxsulot nomi: ${product.title}\n` +
            `Maxsulot narxi: ${product.price}\n`;
        if (product.restaurant_id.toString() === process.env.CHAT_ID) {
            message += productInfo;
        }
        else if (product.restaurant_id.toString() === process.env.CHAT_ID_FOR_Shuxrat_aka) {
            message2 += productInfo;
        }
    });
    if (message.trim() && hasFamilyProducts) {
        sendMessageToGroup(`-${process.env.CHAT_ID}`, message);
        if (Boolean(map.lang) && Boolean(map.lat)) {
            sendLocation(Number(map.lat), Number(map.lang), `-${process.env.CHAT_ID}`);
        }
    }
    if (message2.trim() && hasShabboda) {
        sendMessageToGroup(`-${process.env.CHAT_ID_FOR_Shuxrat_aka}`, message2);
        if (Boolean(map.lang) && Boolean(map.lat)) {
            sendLocation(Number(map.lat), Number(map.lang), `-${process.env.CHAT_ID_FOR_Shuxrat_aka}`);
        }
    }
    res.status(200).send({
        success: true,
        messge: "Sizning buyutrmangiz qabul qilindi",
    });
};
export default orderController;
