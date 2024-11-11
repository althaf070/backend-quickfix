import mongoose from "mongoose";


    const reviewSchema = new mongoose.Schema({
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Providers', // Reference to the Providers collection
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users', // Reference to the users
            required: true
        },
        serviceId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Providers', 
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1, // Minimum rating value
            max: 5  // Maximum rating value
        },
        feedback: {
            type: String,
            required: true,
            trim: true
        },
        
    }, { timestamps: true })
    
export const Review = mongoose.model('Reviews',reviewSchema)