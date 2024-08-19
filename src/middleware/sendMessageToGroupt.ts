import axios from "axios"
import dotenv from "dotenv"
dotenv.config()
const token=process.env.TGBOT_TOKEN
const sendMessageToGroup=async (chatId:string, message:string) => {
    try {
        
        const {data}=await axios.post(`https://api.telegram.org/bot${token}/sendMessage`,{
            chat_id:chatId,
            text:message
        })
        if(data){
            console.log("Message send");
            
        }
    } catch (error) {
        console.log("Send message groupt error", error);
        
    }

}
export default sendMessageToGroup