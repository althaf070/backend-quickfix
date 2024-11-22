import { Appointment } from "../models/appointmentSchema.js";
import { Providers } from "../models/serviceProviderSchema.js";
import { Service } from "../models/serviceSchema.js";
import {  users } from "../models/userSchema.js";
import { Log } from "../models/logSchema.js";

// get user appointments
export const getuserAppointments = async(req,res)=> {
    const userid = req.userId

    try {
        const user = await users.findOne({_id: userid})
        if(!user){
            return res.status(404).json({success:false, message:"User not found"})
        }
        const appointment = await Appointment.find({users:userid}).populate('service')
        if(!appointment || appointment.length == 0){
            return res.status(404).json({success:false,message:"No appointment found"})
        }
        res.status(200).json({success:true,message:"Appointments found successfully",appointment})
    } catch (error) {
        console.error("Error in fetching appointment:", error);
        res.status(400).json({ success: false, message: "Server error, please try again." });
    }
}

// create appointments
export const createAppointment = async (req, res) => {
    const { serviceId, appointmentDate, notes, payment } = req.body; 
    const userId = req.userId;

    try {
        // validate
        if (!serviceId || !appointmentDate) {
            return res.status(400).json({ success: false, message: "Please provide service ID and appointment date." });
        }

        // check if service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found." });
        }

        // Check if service is available
        if (!service.available) {
            return res.status(400).json({ success: false, message: "Service is currently unavailable." });
        }

        // check if the user already has an appointment for the given service
        const existingAppointment = await Appointment.findOne({
            users: userId,
            service: serviceId,
        });

        if (existingAppointment) {
            return res.status(409).json({ success: false, message: "You already have an appointment for this service." });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            users: userId, 
            service: serviceId,
            providers: service.providerId,
            appointmentDate: new Date(appointmentDate), 
            notes,
            payment: payment || 'cash',
            bookingDate: new Date(), 
        });

        // Save the appointment
        await newAppointment.save();

        // Update provider's appointment list
        await Providers.findByIdAndUpdate(
            service.providerId, 
            { $push: { appointments: newAppointment._id } }, 
            { new: true }
        );

        // Update user's appointment list
        await users.findByIdAndUpdate(
            userId,
            { $push: { appointments: newAppointment._id } },
            { new: true }
        );
        const newLog = new Log({
            users:userId,
            service:serviceId,
            providers:service.providerId,
            status:"pending"
        })
        await newLog.save();
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully.',
            appointment: newAppointment
        });
    } catch (error) {
        console.error("Error in creating appointment:", error);
        res.status(400).json({ success: false, message: "Server error, please try again." });
    }
};

// get provider appointments
export const getProviderAppointments = async (req, res) => {
    const {aid}=req.params;
    try {
        const appointment=await Appointment.find({providers:aid}).populate('users').populate('service')
        if(!appointment || appointment.length === 0) {
          return res.status(404).json({success: false,message:"No appointment found"})
        }
        res.status(200).json({success: true,message:"Appintments fetched successfully",appointment})
    } catch (error) {
        console.error("Error in fetching appointment:", error);
        res.status(400).json({ success: false, message: "Server error, please try again." });
    }
} 

// update status by provider
export const updateAppointmentStatus = async (req, res) => {
    const { aid } = req.params;
    const { status,price } = req.body;

    try {
        const appointment = await Appointment.findById(aid);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Cannot find appointment" });
        }
        // updating status
        appointment.status = status;

        if (status === "paid") {
            const newLog = new Log({
                users: appointment.users,
                service: appointment.service,
                providers: appointment.providers,
                status: "paid",
            });
            // creating log
            await newLog.save();   

            await Providers.findByIdAndUpdate(
                appointment.providers,
                {   
                    $inc: { totalEarning: Number(price) },
                    $pull: { appointments: appointment._id } 
                },
                { new: true }
            );

            await users.findByIdAndUpdate(
                appointment.users,
                { 
                    $push: { usedServices: appointment.service },
                    $pull: { appointments: appointment._id }
                },
                { new: true }
            );
            
            await Appointment.findByIdAndDelete(aid);
            return res.status(200).json({ success: true, message: "Appointment deleted as 'paid'.",appointment });
        }
        const newLog = new Log({
            users: appointment.users,
            service: appointment.service,
            providers: appointment.providers,
            status
        });
        // creating log
        await newLog.save(); 
        await appointment.save();
        res.status(200).json({ success: true, message: "Appointment updated successfully", appointment });
    } catch (error) {
        console.error("Error in updating appointment status:", error);
        res.status(500).json({ success: false, message: "Server error, please try again." });
    }
};

// cancel delete by provider
export const cancelAppointmentByprovider = async (req, res) => {
    const { aid } = req.params;

    try {
        const appointment = await Appointment.findById(aid);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Cannot find appointment" });
        }

        // Create a log entry for the cancellation
        const newLog = new Log({
            users: appointment.users,
            service: appointment.service,
            providers: appointment.providers,
            status: "canceled",
            cancelledByProvider:true
        });
        await newLog.save();

        // Update provider and user appointment lists
        await Providers.findByIdAndUpdate(
            appointment.providers,
            { $pull: { appointments: appointment._id } },
            { new: true }
        );

        await users.findByIdAndUpdate(
            appointment.users,
            { $pull: { appointments: appointment._id } },
            { new: true }
        );

        // Delete the appointment
        await Appointment.findByIdAndDelete(aid);

        res.status(200).json({
            success: true,
            message: "Appointment canceled successfully."
        });
    } catch (error) {
        console.error("Error in canceling appointment:", error);
        res.status(500).json({ success: false, message: "Server error, please try again." });
    }
};

// delete/cancel by user
export const deleteAppointment = async (req, res) => {
    const { aid } = req.params; 
    const userId = req.userId

    try {
        const appointment = await Appointment.findById(aid);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        if (appointment.users.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this appointment." });
        }
        await Providers.findByIdAndUpdate(
            appointment.providers,
            { $pull: { appointments: appointment._id } },
            { new: true }
        );

        await users.findByIdAndUpdate(
            userId,
            { $pull: { appointments: appointment._id } },
            { new: true }
        );

        const newLog =new Log({
            users:userId,
            service:appointment.service,
            providers:appointment.providers,
            status:"canceled",
            cancelledByProvider:false
        
        })
        await newLog.save();
        await Appointment.findByIdAndDelete(aid);

        res.status(200).json({
            success: true,
            message: "Appointment deleted successfully."
        });
    } catch (error) {
        console.error("Error in deleting appointment:", error);
        res.status(500).json({ success: false, message: "Server error, please try again." });
    }
};
