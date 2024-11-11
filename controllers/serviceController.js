import mongoose from 'mongoose';
import { Providers } from "../models/serviceProviderSchema.js";
import { Service } from "../models/serviceSchema.js";
import { users } from '../models/userSchema.js';

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all services
export const getAllServices = async (req, res) => {
    const email = req.email
    try {
        const services = await Service.find({available:true}).populate('providerId');
        const filteredServices = services.filter(service => service.providerId.email !== email);
        if(filteredServices.length ==0 || !filteredServices){
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, message: "Services found", services:filteredServices });
    } catch (error) {
        console.log("Error in getting all services", error);
        res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}

// Get service by name
export const getServiceByName = async (req, res) => {
    const { sname } = req.params;
    const email = req.email
    try {
        const services = await Service.find({ servicename: sname,available:true }).populate('providerId');
        if (!services || services.length === 0) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        const filteredServices = services.filter(service => service.providerId.email !== email);
        if(filteredServices.length ==0 || !filteredServices){
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, message: "Service found", services:filteredServices });
    } catch (error) {
        console.log("Error in getting service by name", error);
        res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
};

// Get services excluding current provider's
export const getServiceWithOutCurrentProvider = async (req, res) => {
    const {pid}=req.params

    try {
        const services = await Service.find({ providerId: { $ne: pid } })
            .populate('providerId'); // Populate to get provider details

        res.status(200).json({ success: true, message: "Services found", services });
    } catch (error) {
        console.log("Error in getting services without provider", error);
        res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
};

// Create service
export const createService = async (req, res) => {
    const { servicename, description, price } = req.body;
    const providerId = req.providerId;

    try {
        if (!servicename || !description || !price) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const isExistingService = await Service.findOne({ providerId, servicename });
        if (isExistingService) {
            return res.status(400).json({ success: false, message: "This service already exists" });
        }

        const newService = new Service({ servicename, description, price, providerId });
        await newService.save();
        await Providers.findByIdAndUpdate(providerId, { $push: { services: newService._id } });

        res.status(201).json({ success: true, message: 'Service created successfully', services: newService });
    } catch (error) {
        console.log("Error in creating service", error);
        res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
};


export const getProviderServices = async (req, res) => {
    const { pid } = req.params;

    if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ success: false, message: "Invalid provider ID" });
    }
  
    try {
      const services = await Service.find({ providerId: pid });
  
      if (!services || services.length === 0) {
        return res.status(404).json({ success: false, message: "No services found for this provider" });
      }
  
      res.status(200).json({ success: true, message: "Services found", services });
    } catch (error) {
      console.error("Error fetching provider services:", error);
      res.status(500).json({ success: false, message: "Server error, unable to fetch provider services" });
    }
  };
// Edit service
export const editProviderService = async (req, res) => {
    const { sid } = req.params;
    const { description, price, available } = req.body;
    const providerId = req.providerId;

    if (!isValidObjectId(sid)) {
        return res.status(400).json({ success: false, message: "Invalid service ID format" });
    }

    try {
        const service = await Service.findOne({ providerId, _id: sid });
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        service.description = description || service.description;
        service.price = price || service.price;
        if (available !== undefined) service.available = available;

        await service.save();
        res.status(200).json({ success: true, message: "Service updated successfully", service });
    } catch (error) {
        console.log("Error in updating service", error);
        res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
};

// Delete service
export const deleteProviderService = async (req, res) => {
    const { sid } = req.params;
    const providerId = req.providerId;

    try {
        const service = await Service.findOne({ providerId, _id: sid });
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


export const getServiceById = async (req, res) => {
    const { sid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sid)) {
        return res.status(400).json({ success: false, message: "Invalid service ID" });
    }

    try {
        const service = await Service.findById(sid).populate('providerId', '-password');
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.status(200).json({
            success: true,
            message: "Service found",
            service
        });
    } catch (error) {
        console.log("Error in getting service by id", error);
        res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
};

export const getUsedServicesWithProviders = async (req, res) => {
  const userId = req.userId; 

  try {
    // fetching services with provider details
    const user = await users.findById(userId).populate({
      path: 'usedServices', // Populate the usedServices field
      select: 'servicename price', 
      populate: {
        path: 'providerId',
        select: 'username profilepic' 
      }
    }).populate('reviews')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.status(200).json({
      success: true,
      usedServices: user.usedServices, 
    });
    
  } catch (error) {
    console.log("Error in fetching used services:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later."
    });
  }
};
