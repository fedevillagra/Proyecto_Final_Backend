import mongoose from "mongoose";

const usersPasswordCollection = "usersPassword";

const userPasswordSchema = new mongoose.Schema({
  email: { type: String, ref: "users" },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expireAfterSeconds: 3600 },
});

mongoose.set("strictQuery", false);
export const userPasswordModel = mongoose.model(
  usersPasswordCollection,
  userPasswordSchema
);
