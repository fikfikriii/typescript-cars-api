import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import carRoutes from "./routes/car";

const app = express();

const mongoURI =
    "mongodb+srv://fikri249:fikri249@clustertst.n4coabk.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");

        mongoose.connection.db
            .listCollections()
            .toArray()
            .then((collections) => {
                console.log("Collections in the database:");
                collections.forEach((collection) => {
                    console.log(collection.name);
                });
            })
            .catch((err) => {
                console.error("Error listing collections:", err);
            });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB Atlas:", err);
    });

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, welcome to the API!");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use(carRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});