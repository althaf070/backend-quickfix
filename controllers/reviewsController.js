import { Review } from "../models/reviewsSchema.js";
import { Providers } from "../models/serviceProviderSchema.js";
import { users } from "../models/userSchema.js";
import { Log } from "../models/logSchema.js";

export const createReview = async (req, res) => {
  const { providerId, serviceId, rating, feedback } = req.body;
  const userId = req.userId;

  // Validate required fields
  if (!providerId || !serviceId || !rating || !feedback) {
    return res.status(400).json({
      success: false,
      message: "Provider ID, service ID, rating, and review text are required."
    });
  }

  try {
    // Find user and provider in the database
    const user = await users.findById(userId);
    const provider = await Providers.findById(providerId);

    if (!user || !provider) {
      return res.status(404).json({
        success: false,
        message: "User or provider not found."
      });
    }

    // Check if user has used the service before
    if (!user.usedServices.includes(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "You must use the service before reviewing this provider."
      });
    }

    // Check for duplicate reviews from the same user for the same service
    const existingReview = await Review.findOne({ providerId, userId, serviceId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this service from this provider."
      });
    }

    // Create a new review
    const review = new Review({ providerId, serviceId, userId, rating, feedback });
    await review.save();

    // Update user and provider with review ID
    user.reviews.push(review._id);
    await user.save();
    provider.reviews.push(review._id);
    await provider.save();

    // Log the review action
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
    console.log("Error in creating review:", error);
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