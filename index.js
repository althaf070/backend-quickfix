import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { connectToDb } from './db/connection.js';
import authRoutes from './routes/authRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import logRouters from './routes/logRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser()) //parse incoming cookies

app.use("/uploads",express.static('./uploads'))

app.use("/api/auth",authRoutes)
app.use("/api/service",serviceRoutes)
app.use("/api/appointments",appointmentRoutes)
app.use("/api/logs",logRouters)
app.use("/api/review",reviewRoutes)
app.use("/api/admin",adminRoutes)


app.listen(PORT,()=> {
    connectToDb()
    console.log("server listening on port ",PORT);
    
})