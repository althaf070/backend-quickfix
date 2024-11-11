import { Appointment } from "../models/appointmentSchema.js";
import { Log } from "../models/logSchema.js";

export const getUserLogs = async(req,res)=> {
    const userId = req.userId
    const limit = parseInt(req.query.limit) || 0;
    try {
        const logs = await Log.find({users:userId}).populate('service')
        .sort({ createdAt: -1 })
        .limit(limit);
        if(!logs || logs.length ==0){
            return res.status(404).json({success:false, message:"User not found"})
        }
        return res.status(200).json({success:true, message:"User Log found",logs})
    } catch (error) {
        console.log("error getting logs of user",error);
        res.status(404).json({success:false,message:`Server error.. ${error.message}`});
        
    }
}

export const getUserDashboardData = async(req, res) => {
    const userId = req.userId
    try {
        const bookedServicesCount = await Appointment.countDocuments({ users: userId, status: { $ne: 'canceled' } });
        const totalServicesReceivedCount = await Log.countDocuments({ users: userId, status: { $in: ['paid'] } });
        const totalServicesRequestedCount = await Log.countDocuments({ users: userId, status: 'pending' });
        const ongoingServices = await Appointment.find({ user: userId, status: 'pending' }).populate('service').limit(5)
    
        res.status(200).json({
            success: true,
            data: {
              bookedServicesCount,
              totalServicesReceivedCount,
              totalServicesRequestedCount,
              ongoingServices,
            },
          });
    } catch (error) {
        console.log("error getting dashboard data of user",error);
        res.status(404).json({success:false,message:`Server error.. ${error.message}`});
    }
}
//**TODO get provider dashboarddetails for user
//**TODO get provider dashboarddetails for provider