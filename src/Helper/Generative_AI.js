import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config"
const genAI = new GoogleGenerativeAI(`${process.env.GEMINIAPI_KEY}`); // Replace with your actual key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Double-check model compatibility
const prompt = "if the given picture has any romance  content then respond only yes otherwise respond no. don't give any fullstop";
const img_detect = async (image) => {
  if (!image) {
      console.error("Please upload an image!");
      throw new Error("Please upload an image!"); // Use throw instead of reject
  }

  try {
      const result = await model.generateContent([prompt, image]);
      return result.response.text().trim();
  } catch (error) {
      // If the content generation fails, you can handle it here
      console.error("Error generating content:", error);
      return "yes"; // Default response in case of an error
  }
};

const Text_detection = async (text) => {
  const prompt = "Is there any abuse, adult content, or extreme negativity in the above text? If yes, respond only 'yes', otherwise respond 'no'. Don't include any punctuation.";

  try {
    // Generate content based on the text and the prompt
    const result = await model.generateContent(`${text}\n\n${prompt}`);
    const responseText = result.response.text().trim();
    
    // Return the response text
    return responseText;
  } catch (error) {
    console.log('jkfk3354sssssssssssssssss');
    toast.error("Sorry you can't upload this type of content")
    return "yes";
    // console.error("Error generating content:", error);
    // throw error; // Propagate the error
  }
};

  export {img_detect,Text_detection}