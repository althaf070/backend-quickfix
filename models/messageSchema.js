import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
       required: true
      },
      provider:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Providers',
        required: true
      },
      message:{
        type:String,
        required: true
      },
      senderType: {
        type: String,
        enum: ["users", "Provider"],  
        required: true
    }
},{timestamps:true})

export const Message = mongoose.model('Message',messageSchema)