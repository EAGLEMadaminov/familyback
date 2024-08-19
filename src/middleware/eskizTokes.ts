import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const email = process.env.ESKIZ_EMAIL;
const password = process.env.ESKIZ_PASSWORD;
let token = "";

const getEskizToken = async () => {
  try {
    if (email && password) {
      const { data } = await axios.post(
        "https://notify.eskiz.uz/api/auth/login",
        {
          email,
          password,
        }
      );
      if (data) {
        token = data.token;
        token = data.data.token;
      }
    }
  } catch (error) {
    console.log("Error eskiz get token", error);
  }
};

const sendCodeToPhoneNumber = async ({ phone_number }) => {
  const info = {
    mobile_phone: phone_number,
    message: "Bu Eskiz dan test",
    from: 4546,
  };
  try {
    const { data } = await axios.post(
      "https://notify.eskiz.uz/api/message/sms/send",
      info,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.log("Error response:", error.response.data);
      console.log("Status code:", error.response.status);
      console.log("Headers:", error.response.headers);
    } else if (error.request) {
      // Request was made but no response was received
      console.log("Error request:", error.request);
    } else {
      // Something else happened while setting up the request
      console.log("Send code error:", error.message);
    }
  }
};

export { getEskizToken, sendCodeToPhoneNumber };
