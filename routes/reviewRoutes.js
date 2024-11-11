import express from 'express';
import { verifyToken } from '../middleware/verifytoken.js';
import { createReview, deleteReview, getAllUserReviews, getProviderAllReviews, getProviderreviews, getTopRatedReviews } from '../controllers/reviewsController.js';
import { verifyProviderToken } from '../middleware/verifyProviderToken.js';

const router = express.Router();

router.post('/create',verifyToken,createReview)
router.get('/top/:providerId',verifyToken,getTopRatedReviews)
router.get('/all/:providerId',verifyToken,getProviderAllReviews)
router.get('/user',verifyToken,getAllUserReviews)
router.delete('/delete/:rid',verifyToken,deleteReview)
router.patch('/edit/:rid',verifyToken,deleteReview)


router.get('/getproviderreview',verifyProviderToken,getProviderreviews)

export default router