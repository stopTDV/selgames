import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { noteSchema, userSchema } from "../../../utils/types";
import { NoteSchema } from "./NoteModel";

export interface INote extends z.infer<typeof noteSchema> {}
export interface IUser extends z.infer<typeof userSchema> {}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true },
  lowercaseEmail: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  label: { type: String, required: true },
  markedToDelete: { type: Date, default: undefined },
  notes: {
    type: [NoteSchema],
    default: [],
  },
  tracked: { type: Boolean, default: true },
});

const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ??
  mongoose.model("User", UserSchema);

export default UserModel;
