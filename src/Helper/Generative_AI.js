import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINIAPI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" }); // Updated to Flash 2.0

const prompt = "Does the image depict romance, sexuality, affection, or love or kissing scene? Respond only with 'yes' or 'no' without any punctuation.";

const img_detect = async (image) => {
  if (!image) {
    console.error("Please upload an image!");
    throw new Error("Please upload an image!");
  }

  try {
    const result = await model.generateContent({ contents: [{ role: "user", parts: [prompt, { inline_data: { mime_type: "image/jpeg", data: image } }] }] });
    const responseText = result.response.text().trim();
    console.log("Image Detected:", responseText);
    return responseText;
  } catch (error) {
    console.error("Error generating content:", error);
    return "Error";
  }
};

const Text_detection = async (text) => {
  const textPrompt = "Is there any abuse, adult content, or extreme negativity in the above text? If yes, respond only 'yes', otherwise respond 'no'. Don't include any punctuation.";

  try {
    const result = await model.generateContent({ contents: [{ role: "user", parts: [`${text}\n\n${textPrompt}`] }] });
    const responseText = result.response.text().trim();
    console.log("Text Detected:", responseText);
    return responseText;
  } catch (error) {
    console.error("Error generating content:", error);
    return "Error";
  }
};

export { img_detect, Text_detection };
