import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import bcrypt from "bcrypt";

const router = express.Router();
const secretKey = "your-secret-key"; // Replace with your actual secret key

router.use(async (req: Request, res: Response, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    jwt.verify(token, secretKey, (err) => {
        if (err) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        next();
    });
});

router.get("/", async (req: Request, res: Response) => {
    const users = await User.find();
    res.json(users);
});

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
});

router.put("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, password } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();

        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the user" });
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the user" });
    }
});

export default router;
