import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

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
    req.userId = decoded.userId
    req.email = decoded.email
    next();
  } catch (error) {
    console.log("Error in verifying token: ", error);
    return response
      .status(401)
      .json({ success: false, message: "Servere error" });
  }
};
