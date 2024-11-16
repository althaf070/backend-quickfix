import bcrypt from "bcryptjs";
import { users } from "../models/userSchema.js";
import { generateTokenandsetCookie } from "../utils/generateTokenandSetCookies.js";


export const signup = async (req, res) => {
  const { username, email, password, address, district, phoneNumber } = req.body;
  try {
    if (!username || !email || !password || !address ||!district || !phoneNumber) {
      throw new Error("All feilds are required");
    }
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "user already exists" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    
    const newUser = new users({
      username,
      email,
      password: hashedpassword,
      address,
      district,
      phoneNumber
    });
    
    await newUser.save();
    // jwt token generation
    generateTokenandsetCookie(res,newUser._id,newUser.email)

    // sendimg mail confirmation
    // await sendVerificationEmail(newUser.email,newUser.verficationToken)

    res.status(201).json({
			success: true,
			message: "User created successfully",
      user: {
        ...newUser._doc,
        password: undefined,
      },
		});
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
	try {
		const user = await users.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenandsetCookie(res, user._id,user.email);

		user.lastlogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
  res.clearCookie("token",{
   httpOnly:true, 
   secure:process.env.NODE_ENV === "production",
   sameSite: 'None',
});
  res.status(200).json({ success: true, message: "Logout success" });
};


export const checkAuth = async (req, res) => {
	try {
		const user = await users.findById(req.userId).select("-password").populate('usedServices')
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

//**TODO edit

//**TODO delete


