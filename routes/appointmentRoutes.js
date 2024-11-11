import express from 'express';
import { verifyToken } from '../middleware/verifytoken.js';
import { cancelAppointmentByprovider, createAppointment, deleteAppointment, getProviderAppointments, getuserAppointments, updateAppointmentStatus } from '../controllers/appointmentControllers.js';
import { verifyProviderToken } from '../middleware/verifyProviderToken.js';

const router = express.Router();
// user routes
router.post('/create',verifyToken,createAppointment)
router.get('/get',verifyToken,getuserAppointments)
router.delete('/delete/:aid',verifyToken,deleteAppointment)

// provider routes
router.get('/get/:aid',verifyProviderToken,getProviderAppointments)
router.patch('/update/:aid',verifyProviderToken,updateAppointmentStatus)
router.delete('/cancel/:aid',verifyProviderToken,cancelAppointmentByprovider)
export default router