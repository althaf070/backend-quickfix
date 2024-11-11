import express from 'express'
import { acceptProvider, adminlogin, adminlogout, adminregister, checkAuth, deleteService, getAdminDashboard, getAllAppointments, getAllLogs, getAllReviews, getAllServices, getAllusers, getProviderById, getProviders, getUsersById } from '../controllers/adminController.js'
import adminjwtmiddleware from '../middleware/adminjwt.js'
import { deleteProvider } from '../controllers/serviceProviderController.js'
import { deleteReview } from '../controllers/reviewsController.js'
const router = express.Router()
// auth
router.post('/register',adminregister)
router.post('/login',adminlogin)

router.get('/check',adminjwtmiddleware,checkAuth)
router.post('/logout',adminlogout)

// provider verification
router.patch('/verify/:pid',adminjwtmiddleware,acceptProvider)

// getting details

router.get('/users',adminjwtmiddleware,getAllusers)
router.get('/user/:id',adminjwtmiddleware,getUsersById)

router.get('/providers',adminjwtmiddleware,getProviders)
router.get('/provider/:pid',adminjwtmiddleware,getProviderById)
router.delete('/provider/delete/:pid',adminjwtmiddleware,deleteProvider)


router.get('/services',adminjwtmiddleware,getAllServices)
router.delete('/services/delete/:sid',adminjwtmiddleware,deleteService)

router.get('/appointments',adminjwtmiddleware,getAllAppointments)

router.get('/reviews',adminjwtmiddleware,getAllReviews)
router.delete('/reviews/delete/:rid',adminjwtmiddleware,deleteReview)
router.get('/logs',adminjwtmiddleware,getAllLogs)

router.get('/dashboard',adminjwtmiddleware,getAdminDashboard)

export default router