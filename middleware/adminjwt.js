import jwt from 'jsonwebtoken';
import { Admin } from '../models/adminSchema.js';

const adminjwtmiddleware = async(req, res, next) => {
  const token = req.cookies.adminToken;
  
  // Check if the token is present
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
  }

  try {
    // Verify the token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If the decoded token is invalid, respond with an error
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token provided" });
    }
    const admin = await Admin.findById(decoded.adminId)
    if (!admin) {
      return res.status(404).json({ success: false, message: "admin not found" });
    }
    // Add the adminId from the decoded token to the request object
    req.adminId = decoded.adminId;

    // Call the next middleware function
    next();
  } catch (error) {
    // Log the error for debugging
    console.error(error);
    
    // Respond with a 403 error if there's any issue with the token
    res.status(403).json({ success: false, message: "Please Login - Invalid or expired token" });
  }
};

export default adminjwtmiddleware;
