import bcrypt from "bcryptjs";
import {users} from '../models/userSchema.js'
import { Admin } from "../models/adminSchema.js";
import { generateAdminTokenandsetCookie } from "../utils/generateTokenandSetCookies.js";
import {Providers} from '../models/serviceProviderSchema.js'
import {Service} from "../models/serviceSchema.js"
import { Review } from "../models/reviewsSchema.js";
import {Appointment} from "../models/appointmentSchema.js"
import {Log  } from "../models/logSchema.js";
// authentication
export const adminregister = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const existingUser = await Admin.findOne({ email });
    
    if (existingUser) {
      return res.status(406).json("User already exists. Please login.");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); 

    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword, // Store the hashed password
    });
    
    await newAdmin.save();
    res.status(200).json({
      success: true,
      message: "Successfully created Admin",
      admin: newAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error });
  }
};

export const adminlogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const existingUser = await Admin.findOne({ email });
    
    if (!existingUser) {
      return res.status(406).json("Invalid email or password");
    }
    // comparing passwords with existing passwords
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    
    if (!isPasswordValid) {
      return res.status(406).json("Invalid email or password");
    }

   generateAdminTokenandsetCookie(res,existingUser._id)
  
    res.status(200).json({success:true,message:"Login Success", admin: existingUser });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
}

export const checkAuth = async (req, res) => {
    
	try {
		const admin = await Admin.findById(req.adminId).select("-password")
		if (!admin) {
			return res.status(400).json({ success: false, message: "Admin not found" });
		}

		res.status(200).json({ success: true, admin });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
}
export const adminlogout = async(req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({ success: true, message: "Logout success" });
};

// verify provider
export const acceptProvider = async (req, res) => {
  const { pid } = req.params;
  
  try {
    // Find the provider by ID
    const provider = await Providers.findOne({ _id: pid, verified: false }); // Only fetch unverified provider
    
    if (!provider) {
      return res.status(404).json({ success: false, message: "No unverified provider exists with this ID" });
    }

    // Update the provider's verification status
    provider.verified = true;
    await provider.save();
    
    res.status(200).json({ success: true, message: "Provider verified successfully",provider });
  } catch (error) {
    console.error("Error in provider verification:", error); 
    res.status(500).json({ success: false, message: "Error in provider verification" });
  }
};


// Fetch all providers with optional filtering based on verification status
export const getProviders = async (req, res) => {
  const { verified } = req.query; // Get the "verified" filter from query parameters

  try {
    let filter = {}; // Default filter to fetch all providers

    // If a verified filter is provided, add it to the filter
    if (verified === 'true') {
      filter.verified = true;
    } else if (verified === 'false') {
      filter.verified = false;
    }

    // Fetch providers based on the filter
    const providers = await Providers.find(filter).populate('services')
    if(!providers || providers.length === 0){
      return res.status(200).json({success:false,message:"No providers found"})
    }
    res.status(200).json({ success: true, providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ success: false, message: "Error fetching providers" });
  }
};
export const getProviderById=async(req,res)=> {
  const {pid} = req.params
  try {
    const provider = await Providers.findById(pid).populate('services').populate({path:'reviews',populate:{path:'userId',select:'username'}}).populate({
      path: 'appointments',
       populate: [
        { path: 'users', select: 'username' },         // Populate user details with only the username
        { path: 'service', select: 'servicename price' }    // Populate service details with only the servicename
      ] ,
    });
    if(!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    res.status(200).json({success: true,message: "Provider found",provider})
  } catch (error) {
    console.error("Error fetching provider details:", error);
    res.status(500).json({ success: false, message: "Error fetching provider details" });
  }
}
// delete provider


// getting all details

export const getAllusers = async(req, res) => {
  try {
    const user = await users.find()
    if(!user || user.length === 0){
      return res.status(404).json({success:false,message:"No Users found"})
    }
    res.status(200).json({success:true,message:"Users found",user})
  } catch (error) {
    res.status(500).json({success:false,message: "Errror in getting users"})
  }
}

export const getUsersById = async (req, res) => {
  const {id} = req.params
  try {
    const user = await users.findById(id)
    if(!user){
      return res.status(404).json({success:false,message:"No users found with this id"})
    }
    res.status(200).json({success:true,message:"user found",user})
  } catch (error) {
    res.status(500).json({success:false,message: "Errror in getting users"})
  }
}


export const getAllServices = async(req,res)=> {
  try {
    const services = await Service.find().populate('providerId')
    if(!services || services.length ==0){
      return res.status(404).json({success:false,message:"No Services found"})
    }
    res.status(200).json({success:true,message:"Services found",services})
  } catch (error) {
   res.status(500).json({success:false,message: "Errror in getting services"})
  }
}

export const deleteService = async (req, res) => {
  const { sid } = req.params;
  const {providerId} = req.body
  try {
      const service = await Service.findById(sid);
      if (!service) {
          return res.status(404).json({ success: false, message: "Service not found" });
      }

      await service.deleteOne();
      await Providers.findByIdAndUpdate(providerId, { $pull: { services: sid } });
      await Appointment.findByIdAndUpdate(sid, { $pull: {service: sid}})
      res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
      console.log("Error in deleting service", error);
      res.status(500).json({ success: false, message: "Server error, please try again later" });
  }
};


export const getAllReviews=async (req, res) => {
  try {
    const reviews = await Review.find().populate('providerId').populate('userId')
    if(!reviews || reviews.length ==0){
      return res.status(404).json({success:false,message:"No reviews found"})
    }
    res.status(200).json({success:true,message:"reviews found",reviews})
  } catch (error) {
    res.status(500).json({success:false,message: "Errror in getting reviews"})
  }
}

export const getAllAppointments = async(req,res)=> {
  try {
    const appointments = await Appointment.find().populate('users').populate('service').populate('providers')
    if(!appointments || appointments.length ==0){
      return res.status(404).json({success:false,message:"No appointments found"})
    }
    res.status(200).json({success:true,message:"appointments found",appointments})
  } catch {
    res.status(500).json({success:false,message: "Errror in getting reviews"})
  }
}

export const getAllLogs = async(req,res)=>{
try {
  const logs = await Log.find().populate('users').populate('service').populate('providers')
  if(!logs || logs.length ==0){
    return res.status(404).json({success:false,message:"No logs found"})
  }
  res.status(200).json({success:true,message:"logs found",logs})
} catch (error) {
  res.status(500).json({success:false,message: "Errror in getting reviews"})
}
} 

export const getAdminDashboard=async(req,res)=> {
  try {
    const [userCount, serviceCount, providerCount, appointmentCount,ReviewCount,  pendingAppointment, completedAppointment, verifiedProvider] = await Promise.all([
      users.countDocuments(),
      Service.countDocuments(),
      Providers.countDocuments(),
      Appointment.countDocuments(),
      Review.countDocuments(),
      Appointment.countDocuments({ status: "pending" }), 
      Appointment.countDocuments({ status: "paid" }), 
      Providers.countDocuments({ verified: false }) 
    ])
    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        services: serviceCount,
        providers: providerCount,
        appointments: appointmentCount,
        reviews:ReviewCount,
        appointmentsByStatus: {
          pending: pendingAppointment,
          completed: completedAppointment
        },
        verifiedProviders: verifiedProvider
      }
    });
  } catch (error) {
    res.status(500).json({success:false,message: "Errror in getting dashboard details"})
  }
}