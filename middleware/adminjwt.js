import jwt from 'jsonwebtoken'
const adminjwtmiddleware = (req,res,next)=> {
    const token = req.cookies.adminToken;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return response.status(401).json({ success: false, message: "Unauthorized - Invalid token provided" })
          req.adminId = decoded.adminId
    next()
}  
 catch{
     res.status(403).json("Please Login")
    }
}

export default adminjwtmiddleware