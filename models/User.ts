import mongoose, { Schema } from "mongoose"

const ChoreSchema = new Schema({
  name: String,
  dueDate: String,
  completed: Boolean
})

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phoneNumber: String,
  roomNumber: String,
  rentAmount: Number,
  rentPaid: [String],
  chores: [ChoreSchema]
})

export default mongoose.models.User || mongoose.model("User", UserSchema)