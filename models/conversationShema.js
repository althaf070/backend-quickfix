import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		participants: [
			{
				userType: {
					type: String,
					enum: ['users', 'Provider'], // Specifies if the participant is a 'User' or 'Provider'
					required: true
				},
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					refPath: 'participants.userType' // Dynamically references either 'User' or 'Provider' collection
				}
			}
		],
		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Message",
				default: []
			}
		]
	},
	{ timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);


