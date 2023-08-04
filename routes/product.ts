import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const secretKey = "your-secret-key";

interface Product {
  id: string;
  name: string;
  price: number;
}

const products: Product[] = [];

router.use((req: Request, res: Response, next) => {
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

router.get("/", (req: Request, res: Response) => {
  res.json(products);
});

router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

router.post("/", (req: Request, res: Response) => {
  const { name, price } = req.body;
  const id = uuidv4();

  const newProduct: Product = { id, name, price };
  products.push(newProduct);

  res.status(201).json({ message: "Product created successfully" });
});

router.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  product.name = name || product.name;
  product.price = price || product.price;
  res.json({ message: "Product updated successfully" });
});

router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  products.splice(index, 1);
  res.json({ message: "Product deleted successfully" });
});

export default router;
