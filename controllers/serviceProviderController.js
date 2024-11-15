import bcrypt from "bcryptjs";
import { Providers } from "../models/serviceProviderSchema.js";
import { generateProviderTokenandsetCookie } from "../utils/generateTokenandSetCookies.js";
import { Service } from "../models/serviceSchema.js";
import { Review } from "../models/reviewsSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import {Log} from '../models/logSchema.js'

// signin
export const providerSignin = async(req, res) => {
  const { username, email, password,address,district,phoneNumber } = req.body;
  try {
    if (!username || !password || !email || !address || !district || !phoneNumber) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const existingProvider = await Providers.findOne({ email });
    if (existingProvider) {
       return res.status(400).json({ success: false, message: "Service Provider already exists" });
    }

      const hashedpassword = await bcrypt.hash(password, 10);
      const newProvider = new Providers({
        username,
        email,
        address,
        district,
        phoneNumber,
        password: hashedpassword,
      });
      await newProvider.save();
      generateProviderTokenandsetCookie(res, newProvider._id);

      res.status(201).json({
        success: true,
        message: "Service Provider created successfully",
        provider: {
          ...newProvider._doc,
          password: undefined
        }
      });

  } catch (error) {
    console.log("Error in service Provider registaration", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// login
export const providerLogin = async(req, res) => {
    const { email, password } = req.body;
  
    try {
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      const provider = await Providers.findOne({ email })
      if (!provider) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, provider.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
  
      generateProviderTokenandsetCookie(res, provider._id);
      provider.lastlogin = new Date();
      await provider.save();
  
      return res.status(200).json({ 
        success: true, 
        message: "Login successful", 
        provider:{
            ...provider._doc,
            password: undefined
        }
      });
      
    } catch (error) {
      console.error("Error in provider login:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
//   logout
  export const providerlogout = async(req, res) => {
    res.clearCookie('providertoken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'None', 
    });
    res.status(200).json({ success: true, message: "Logout successful" });
  };

  export const checkProviderAuth = async(req, res) => {
	try {
		const user = await Providers.findById(req.providerId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
}
// profilepic-upload
export const profilepicUpload = async (req, res) => {
  const profilepic = req.file.filename;  //gtting pic name
  const providerId = req.providerId; 

  try {
    const user = await Providers.findByIdAndUpdate(
      { _id: providerId },
      { profilepic },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Failed to upload profile pic:", error);
    res.status(400).json({ success: false, message: "Failed to upload profile pic" });
  }
};

//**TODO edit

//**TODO delete provider

export const deleteProvider =async(req, res) => {
  const {pid} = req.params
  try {
    const provider = await Providers.findById(pid)
    if(!provider){
      return res.status(404).json({success: false,message:"Couldn't find provider"})
    }
    await Service.deleteMany({ _id: { $in: provider.services } });
    await Review.deleteMany({ _id: { $in: provider.reviews } });
    await Appointment.deleteMany({ _id: { $in: provider.appointments } });

    // Delete the provider itself
    await Providers.findByIdAndDelete(pid);
    res.status(200).json({success: true,message:"Provider deleted successfully"})
  } catch (error) {
    console.error("Error deteing provider :", error);
    res.status(500).json({ success: false, message: "Error deteing provider" });
  }
}

// get dashboard data
export const getServiceProviderDashboard = async (req, res) => {
  try {
    const { providerId } = req.params; // assuming providerId is passed as a route parameter

    const [
      providerServicesCount,
      totalAppointmentsCount,
      pendingAppointmentsCount,
      completedAppointmentsCount,
      committedAppointmentsCount,
      providerReviewsCount
    ] = await Promise.all([
      Service.countDocuments({ providerId }),
      Appointment.countDocuments({providers: providerId }), 
      Appointment.countDocuments({ providers:providerId, status: "pending" }),
      Log.countDocuments({providers:providerId, status: "paid"}),
      Appointment.countDocuments({providers:providerId, status: "confirmed"}),
      Review.countDocuments({ providerId }) 
    ]);

    res.status(200).json({
      success: true,
      data: {
        services: providerServicesCount,
        appointments: {
          total: totalAppointmentsCount,
          pending: pendingAppointmentsCount,
          ongoing:committedAppointmentsCount,
          completed: completedAppointmentsCount
        },
        reviews: providerReviewsCount
      }
    });
  } catch (error) {
    console.error("Error fetching service provider dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Error in getting service provider dashboard details",
      error: error.message
    });
  }
};
