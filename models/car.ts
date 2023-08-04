import { Schema, model, Document } from "mongoose";

export interface ICar extends Document {
  perusahaan: string;
  nama_mobil: string;
  tahun: number;
  odo: number;
  jenis_transmisi: string;
  harga: number;
}

const carSchema = new Schema<ICar>({
  perusahaan: String,
  nama_mobil: String,
  tahun: Number,
  odo: Number,
  jenis_transmisi: String,
  harga: Number,
});

const Car = model<ICar>("Car", carSchema);

export default Car;
