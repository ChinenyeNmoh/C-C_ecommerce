const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passwordSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "user",
		unique: true,
	},
	token: { 
        type: String,
        required: true 
    },
	expireAt: { 
        type: Date,
		expires: 6 * 60 * 60, // Expires after 1 minute
		index: true, 
        default: Date.now,
	}
});

module.exports = mongoose.model("password", passwordSchema);
