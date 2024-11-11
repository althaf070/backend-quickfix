import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    servicename: {
        type: String,
        required: true,
        trim: true // Remove  whitespace if any
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: String,
        required:true,
    },
    available: {
        type: Boolean,
        default: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Providers', 
        required: true
    },
   
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);
