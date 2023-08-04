import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user";

const router = express.Router();

const secretKey = "your-secret-key";

router.post("/signup", async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Check all the required fields
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Create new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(400).json({ message: "User validation failed", error });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, secretKey);
    res.json({ token });
});

export default router;
