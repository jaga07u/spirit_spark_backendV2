import { Quote } from "../models/Quote.model.js";
import { Poem } from "../models/poem.model.js";
import { Couplet } from "../models/Couplet.model.js";
import { Story } from "../models/Story.model.js";
import { User } from "../models/User.model.js";
// const quoteData=Quote.findOne({_id:id});
// const poemData=Quote.findOne({_id:id});
// const storyData=Quote.findOne({_id:id});
// const coupletData=Quote.findOne({_id:id});
const getShareData = async (req, res) => {
    try {
        const { id } = req.params; // Extract id from params
        // Find the data in the Quote collection
const quoteData=Quote.findOne({_id:id});
const poemData=Quote.findOne({_id:id});
const storyData=Quote.findOne({_id:id});
const coupletData=Quote.findOne({_id:id});
const user = await User.findOne({ _id: quoteData.Owner});
        if (quoteData) {
            return res.json({
                "data":quoteData,
                user,
            });
        }
        if (poemData) {
            return res.json({
                "data":poemData,
                user,
            });
        }
        if (storyData) {
            return res.json({
               "data": storyData,
                user,
            });
         
        }
        if (coupletData) {
            return res.json({
                "data":coupletData,
                user,
            });
        }
        // Fetch user data if necessary
       // Replace with actual user field logic if needed
    } catch (error) {
        console.error("Error fetching share data:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};
export {getShareData}
