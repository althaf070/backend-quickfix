import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    default: '' // Initially empty, to be filled later
  },
  district: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reviews', // Reference to the Review model
}],
usedServices: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Service'
}],
appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
},
{timestamps:true}
)
export const users = mongoose.model('users', userSchema)
