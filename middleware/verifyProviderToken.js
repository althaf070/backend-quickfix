import jwt from "jsonwebtoken";
import { Providers } from "../models/serviceProviderSchema.js";
export const verifyProviderToken =async (req, res, next) => {
  const token = req.cookies.providertoken;

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return response
        .status(401)
        .json({
          success: false,
          message: "Unauthorized - Invalid token provided"
        });
    const provider = await Providers.findById(decoded.providerId)
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }
    if (!provider.verified) {
      return res.status(403).json({ success: false, message: "Access denied - Provider not verified" });
    }
    req.providerId = decoded.providerId;
    next();
  } catch (error) {
    console.log("Error in verifying token: ", error);
    return res.status(401).json({ success: false, message: "Servere error" });
  }
};
