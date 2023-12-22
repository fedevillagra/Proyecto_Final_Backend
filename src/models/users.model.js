import mongoose from "mongoose";

const usersCollection = "users";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: false },
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  role: { type: String, enum: ["user", "premium", "admin"], default: "user" },
  documents: {
    type: [
      {
        name: { type: String },
        reference: { type: String },
      },
    ],
    default: [],
  },
  status: { type: Boolean, default: false },
  profilePicture: { type: String },
  last_connection: { type: Date },
});

mongoose.set("strictQuery", false);
export const userModel = mongoose.model(usersCollection, userSchema);
