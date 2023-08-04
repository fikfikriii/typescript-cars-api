import express, { Request, Response } from "express";
import Car, { ICar } from "../models/car";
import jwt from "jsonwebtoken";

const carRouter = express.Router();

const authenticateUser = (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    jwt.verify(token, "your-secret-key", (err) => {
        if (err) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        next();
    });
};

// Car serializer function
const carSerializer = (car: ICar): any => {
    return {
        id: car._id.toString(),
        perusahaan: car.perusahaan,
        nama_mobil: car.nama_mobil,
        tahun: car.tahun,
        odo: car.odo,
        jenis_transmisi: car.jenis_transmisi,
        harga: car.harga,
    };
};

// Cars serializer function
const carsSerializer = (cars: ICar[]): any => {
    return cars.map((car) => carSerializer(car));
};

// Get all cars
carRouter.get("/cars", async (req: Request, res: Response) => {
    try {
        const cars: ICar[] = await Car.find({});
        return res.json({ status: "ok", data: cars });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get cars by name
carRouter.get("/cars/search-nama", authenticateUser, async (req: Request, res: Response) => {
    const { nama_mobil } = req.body;

    // Optional: Validate if the required field exists in the body
    if (!nama_mobil) {
        return res.status(400).json({ message: "Car name is required in the request body" });
    }

    try {
        const cars: ICar[] = await Car.find({ nama_mobil: { $regex: new RegExp(nama_mobil, "i") } });
        return res.json(carsSerializer(cars));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get cars by year
carRouter.get("/cars/search/tahun/:tahun", authenticateUser, async (req: Request, res: Response) => {
    const { tahun } = req.params;
    try {
        const cars: ICar[] = await Car.find({ tahun: parseInt(tahun, 10) });
        return res.json(carsSerializer(cars));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get cars by company
carRouter.get("/cars/search-perusahaan/:nama_perusahaan", authenticateUser, async (req: Request, res: Response) => {
    const { nama_perusahaan } = req.params;
    try {
        const cars: ICar[] = await Car.find({ perusahaan: { $regex: new RegExp(nama_perusahaan, "i") } });
        return res.json(carsSerializer(cars));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get cars by transmission type
carRouter.get("/cars/search-transmisi/:transmisi", authenticateUser, async (req: Request, res: Response) => {
    const { transmisi } = req.params;
    try {
        const cars: ICar[] = await Car.find({ jenis_transmisi: transmisi });
        return res.json(carsSerializer(cars));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get cars by price range
carRouter.get("/cars/search-harga", authenticateUser, async (req: Request, res: Response) => {
    const { harga_min, harga_max } = req.query;

    if (!harga_min || !harga_max || isNaN(harga_min as any) || isNaN(harga_max as any)) {
        return res.status(400).json({ message: "Invalid price range" });
    }

    try {
        const cars: ICar[] = await Car.find({
            harga: { $gte: parseInt(harga_min as any), $lte: parseInt(harga_max as any) },
        });
        return res.json(carsSerializer(cars));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Add car
carRouter.post("/cars", async (req: Request, res: Response) => {
    try {
        const newCar: ICar = req.body;
        const car: ICar = await Car.create(newCar);
        return res.json({ status: "ok", data: car });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Delete car by ID
carRouter.delete("/cars/:id", authenticateUser, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deletedCar: ICar | null = await Car.findByIdAndDelete(id);

        if (!deletedCar) {
            return res.status(404).json({ message: "Car not found" });
        }

        return res.json({ message: "Car deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update car by ID
carRouter.put("/cars/:id", authenticateUser, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { perusahaan, nama_mobil, tahun, odo, jenis_transmisi, harga } = req.body;

    try {
        const updatedCar: ICar | null = await Car.findByIdAndUpdate(
            id,
            {
                perusahaan,
                nama_mobil,
                tahun,
                odo,
                jenis_transmisi,
                harga,
            },
            { new: true } // To return the updated car instead of the original one
        );

        if (!updatedCar) {
            return res.status(404).json({ message: "Car not found" });
        }

        return res.json(carSerializer(updatedCar));
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default carRouter;