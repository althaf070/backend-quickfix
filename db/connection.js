import mongoose from "mongoose";

export const connectToDb = async()=> {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log("Mongdb connected successfully");
        
    } catch (error) {
        console.log("Error connecting to mongodb",error.message);
        process.exit(1); //1 is error 
    }
}