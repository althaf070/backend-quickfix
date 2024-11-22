import { Review } from "../models/reviewsSchema.js";
import { Providers } from "../models/serviceProviderSchema.js";
import { users } from "../models/userSchema.js";
import { Log } from "../models/logSchema.js";
import mongoose from "mongoose";

// to find aveage review

export const calculateAverageRating =async (providerId)=> {
try {
  const result = await Review.aggregate([
    {$match:{providerId:mongoose.Types.ObjectId(providerId)}},
    {$group:{_id:null,averageRating:{$avg:"$rating"}}}
  ])
  const averageRating = result.length ? result[0].averageRating:0
  await Providers.findByIdAndUpdate(providerId,{averageRating},{new:true})
} catch (error) {
  console.error("Error updating average rating with aggregation:", error);
}
}

export const createReview = async (req, res) => {
  const { providerId, serviceId, rating, feedback } = req.body;
  const userId = req.userId;

  if (!providerId || !serviceId || !rating || !feedback) {
      return res.status(400).json({
          success: false,
          message: "Provider ID, service ID, rating, and review text are required."
      });
  }
  if (rating < 1 || rating > 5) {
      return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5."
      });
  }

  try {
      const [user, provider] = await Promise.all([
          users.findById(userId),
          Providers.findById(providerId)
      ]);

      if (!user || !provider) {
          return res.status(404).json({
              success: false,
              message: "User or provider not found."
          });
      }

      if (!user.usedServices.includes(serviceId)) {
          return res.status(400).json({
              success: false,
              message: "You must use the service before reviewing this provider."
          });
      }

      const existingReview = await Review.findOne({ providerId, userId, serviceId });
      if (existingReview) {
          return res.status(400).json({
              success: false,
              message: "You have already reviewed this service from this provider."
          });
      }

      const review = new Review({ providerId, serviceId, userId, rating, feedback });
      await review.save();

      await Promise.all([
          users.findByIdAndUpdate(userId, { $push: { reviews: review._id } }),
          Providers.findByIdAndUpdate(providerId, { $push: { reviews: review._id } })
      ]);

      await calculateAverageRating(providerId);

      const newLog = new Log({
          users: userId,
          providers: providerId,
          service: serviceId,
          status: "reviewed"
      });
      await newLog.save();

      res.status(201).json({
          success: true,
          message: "Review submitted successfully.",
          review
      });
  } catch (error) {
      console.error(`Error in creating review for provider ${providerId} by user ${userId}:`, error);
      res.status(500).json({
          success: false,
          message: "Server error, please try again later."
      });
  }
};


// get provider reviews 
export const getProviderreviews =async (req, res) =>{
  const providerId = req.providerId
  try {
    const reviews = await Review.find({ providerId }).populate('userId').select('-password -address -email')
    if (!reviews || reviews.length === 0) {
      return res.status(200).json({ success: false, message: "No reviews found for this provider" });
    }
    res.status(200).json({success:true,message:"Reviews found for this provider",reviews})
  } catch (error) {
    console.log("Error in getting provider review:", error);
    res.status(400).json({
      success: false,
      message: "Server error, please try again later."
    });
  }
}

// get user reviews of provider with top rated and limit
export const getTopRatedReviews = async(req, res) => {
  const providerId = req.params.providerId;
  if (!providerId) {
    return res.status(400).json({ success: false, message: 'Provider ID is required',reviews:[] });
  }

  try {
    const reviews = await Review.find({ providerId }).sort({ rating: -1 }).limit(3).populate({
      path: 'userId',  // Path to the user field
      select: 'username'  // Only retrieve the `username` field from User
    });
    if (!reviews || reviews.length === 0) {
      return res.status(200).json({ success: false, message: 'No reviews found',reviews:[] });
    }
    res.status(200).json({ success: true, message: 'Reviews found', reviews });
  } catch (error) {
    console.log("Error fetching top rated reviews:", error);
    res.status(500).json({ success: false, message: "Server error, please try again later." });
  }
};

// get all provider reviews
export const getProviderAllReviews = async(req, res) => {
  const{providerId} = req.params
  try {
    const reviews = await Review.find({providerId})
    if(!reviews){
      return res.status(200).json({success:false,message: 'Reviews not found',reviews:[]});
    }
    res.status(200).json({success:true,message: 'Review found',reviews});
  } catch (error) {
    console.log("Error in getting user top rated review:", error);
    res.status(400).json({
      success: false,
      message: "Server error, please try again later."
    });
  }
  }
  // get all user reviews

  export const getAllUserReviews = async(req, res) => {
    const userId = req.userId
    try {
      const reviews = await Review.find({userId}).populate({path:'providerId',select:'username'})
      if(!reviews){
        return res.status(200).json({success:false,message: 'Reviews not found',reviews:[]});
      }
      res.status(200).json({success:true,message: 'Review found',reviews});
    } catch (error) {
      console.log("Error in getting user reviews:", error);
      res.status(400).json({
        success: false,
        message: "Server error, please try again later."
      });
    }
    }

    // delete review 
    export const deleteReview = async (req, res) => {
      const { rid } = req.params;
    
      try {
        const review = await Review.findByIdAndDelete(rid);
        if (!review) {
          return res.status(404).json({ success: false, message: 'Review not found.' });
        }
    
        // Optionally, remove the review from user and provider documents
        await users.updateOne({ _id: review.userId }, { $pull: { reviews: rid } });
        await Providers.updateOne({ _id: review.providerId }, { $pull: { reviews: rid } });
        await calculateAverageRating(review.providerId)
        res.status(200).json({
          success: true,
          message: 'Review deleted successfully.',
          review
        });
      } catch (error) {
        console.error("Error in deleting review:", error);
        res.status(500).json({
          success: false,
          message: "Server error, please try again later."
        });
      }
    };
    
export const editReview = async(req, res) => {
  const { rid } = req.params;
  const {feedback,rating} = req.body
  try {
    const reviews = await Review.findByIdAndUpdate(rid,{
      feedback,rating
    })
    res.status(201).json({success:true, message:"The review was updated",reviews})
  } catch (error) {
    console.error("Error in editing review:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later."
    });
  }
}    