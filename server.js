import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB(); // <-- Add this line

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

//API ENDPOINTS

app.get("/", (req, res) => res.send("api working bor this mern-authetication "));
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("api working hello"));

app.listen(port, () => console.log(`Server is running on port :${port}`));
