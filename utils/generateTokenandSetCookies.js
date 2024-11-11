import jwt from 'jsonwebtoken'

export const generateTokenandsetCookie = (res,userId,email)=> {
const token = jwt.sign({userId,email},process.env.JWT_SECRET,{
    expiresIn:"7d"
})
res.cookie("token",token,{
   httpOnly:true, //by setting this prevent attack called xss xss-crosscripting attack
   secure:process.env.NODE_ENV === "production",
   sameSite: 'Strict',
   maxAge:7*24*60*60*1000
})
return token
}

// for provider
export const generateProviderTokenandsetCookie = (res,providerId)=> {
const providertoken = jwt.sign({providerId},process.env.JWT_SECRET,{
    expiresIn:"7d"
})
res.cookie("providertoken",providertoken,{
   httpOnly:true, //by setting this prevent attack called xss xss-crosscripting attack
   secure:process.env.NODE_ENV === "production",
   sameSite: 'Strict',
   maxAge:7*24*60*60*1000
})
return providertoken
}

// admin token
export const generateAdminTokenandsetCookie = (res,adminId)=> {
const adminToken = jwt.sign({adminId},process.env.JWT_SECRET,{
    expiresIn:"7d"
})
res.cookie("adminToken",adminToken,{
   httpOnly:true, //by setting this prevent attack called xss xss-crosscripting attack
   secure:process.env.NODE_ENV === "production",
   sameSite: 'Strict',
   maxAge:7*24*60*60*1000
})
return adminToken
}