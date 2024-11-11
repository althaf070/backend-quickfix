import { Conversation } from '../models/conversationShema.js'
import { Message } from '../models/messageSchema.js';


export const sendMessage = async (req, res) => {
    const { message } = req.body;
    const { id: receiverId } = req.params; // Provider's ID
    const userId = req.userId;  // User's ID

    try {
        // Find an existing conversation between the user and provider
        let conversation = await Conversation.findOne({
            participants: {
                $all: [
                    { $elemMatch: { userType: 'users', userId: userId } },
                    { $elemMatch: { userType: 'Provider', userId: receiverId } }
                ]
            }
        });

        // If conversation doesn't exist, create a new one
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    { userType: 'users', userId: userId },
                    { userType: 'Provider', userId: receiverId }
                ],
                messages: []
            });
        }

        // Create a new message document
        const newMessage = await Message.create({
            user: userId,
            provider: receiverId,
            message,
            senderType: 'users' // Specify that the user sent this message
        });

        // Add new message to conversation's messages array
        conversation.messages.push(newMessage._id);
        await conversation.save();

        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ success: false, message: "Error sending message, server error." });
    }
};

// Function for sending a message from provider to user
export const sendMessageFromProvider = async (req, res) => {
    const { message } = req.body;
    const { id: receiverId } = req.params; // User's ID
    const providerId = req.providerId; // Provider's ID

    try {
        // Find an existing conversation between the user and provider
        let conversation = await Conversation.findOne({
            participants: {
                $all: [
                    { $elemMatch: { userType: 'users', userId: receiverId } },
                    { $elemMatch: { userType: 'Provider', userId: providerId } }
                ]
            }
        });

        // If conversation doesn't exist, create a new one
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    { userType: 'users', userId: receiverId },
                    { userType: 'Provider', userId: providerId }
                ],
                messages: []
            });
        }

        // Create a new message document
        const newMessage = await Message.create({
            user: receiverId,
            provider: providerId,
            message,
            senderType: 'Provider' // Specify that the provider sent this message
        });

        // Add new message to conversation's messages array
        conversation.messages.push(newMessage._id);
        await conversation.save();

        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ success: false, message: "Error sending message, server error." });
    }
};


// get message of user btw provider
export const getUserMessages=async(req,res)=>{
    const {id:providerId} = req.params
    const userId = req.userId
try {
    const conversation = await Conversation.findOne({
        participants: {
            $all: [
                { $elemMatch: { userType: 'users', userId: userId } }, 
                { $elemMatch: { userType: 'Provider', userId: providerId } }
            ]
        }
    }).populate({
        path: 'messages',
        model: 'Message', 
    });
    if(!conversation) return res.status(200).json([])
        const messages = conversation.messages
    res.status(200).json({success: true,messages})
} catch (error) {
    console.error("Error getting message:", error.message);
    res.status(500).json({ success: false, message: "Error sending message, server error." });
}
}

// provider

// get messages for provider
export const getProviderMessages=async(req,res)=>{
    const {id:providerId} = req.params
    const userId = req.providerId
try {
    const conversation = await Conversation.findOne({
        participants: {
            $all: [
                { $elemMatch: { userType: 'users', userId: userId } }, 
                { $elemMatch: { userType: 'Provider', userId: providerId } }
            ]
        }
    }).populate('messages')
    if(!conversation) return res.status(200).json([])
        const messages = conversation.messages
    res.status(200).json({success: true,messages})
} catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ success: false, message: "Error sending message, server error." });
}
}