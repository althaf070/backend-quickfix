import express from 'express';
import { checkAuth, login, logout,signup } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifytoken.js';
import { checkProviderAuth, profilepicUpload, providerLogin, providerlogout, providerSignin } from '../controllers/serviceProviderController.js';
import { verifyProviderToken } from '../middleware/verifyProviderToken.js';
import multerConfig from '../middleware/multerconfig.js';

const router = express.Router();
// to get current logged in user
router.get("/check-auth",verifyToken,checkAuth);
// user authentication
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)


// service provider authentication
router.get("/provider/check",verifyProviderToken,checkProviderAuth)

router.post("/provider/signup",providerSignin)
router.patch("/provider/profile",verifyProviderToken,multerConfig.single('profilepic'),profilepicUpload)

router.post("/provider/login",providerLogin)
router.post("/provider/logout",verifyProviderToken,providerlogout)
// admin authentication
export default router