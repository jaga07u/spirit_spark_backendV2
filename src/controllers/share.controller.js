import { Quote } from "../models/Quote.model.js";
import { Poem } from "../models/poem.model.js";
import { Couplet } from "../models/Couplet.model.js";
import { Story } from "../models/Story.model.js";
import { User } from "../models/User.model.js";

const getShareData = async (req, res) => {
    try {
        const { id } = req.params; // Extract id from request parameters

        // Use `await` to properly handle asynchronous calls
        const quoteData = await Quote.findOne({ _id: id });
        const poemData = await Poem.findOne({ _id: id });
        const storyData = await Story.findOne({ _id: id });
        const coupletData = await Couplet.findOne({ _id: id });

        // If any of the data is found, fetch the user associated with it
        let data = quoteData || poemData || storyData || coupletData;

        if (data) {
            const user = await User.findOne({ _id: data.Owner }); // Assuming `Owner` is the field in your models
            return res.json({
                data,
                Owner: {
                    id: user._id,
                    username:user.username,
                    avatar:user?.avatarImg,
                    name: user.name,
                    email: user.email, // Include only necessary fields
                },
            });
        }

        // If no data is found
        return res.status(404).json({
            message: "Data not found",
        });
    } catch (error) {
        console.error("Error fetching share data:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

export { getShareData };
