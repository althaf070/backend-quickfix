import mongoose from "mongoose";

const serviceProviderSchema =new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true, 
    },
    lastlogin:{
        type:Date,
        default:Date.now()
    },
    address: {
        type: String,
        default: '' 
      },
      district: {
        type: String,
        default: ''
      },
      phoneNumber: {
        type: String,
        default: ''
      },
      profilepic: {
        type: String
    },    
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }], 
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reviews', // Reference to the Review model
  }],
  appointments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment'
   }],
   verified: {
    type: Boolean,
    default: false,
  },
  totalEarning:{
    type:Number,
    default:0
  }
},{timestamps:true})

export const Providers = mongoose.model('Providers', serviceProviderSchema)