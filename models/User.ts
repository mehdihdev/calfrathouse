import mongoose, { Schema } from "mongoose"

const ChoreSchema = new Schema({
  name: String,
  dueDate: String,
  completed: Boolean
})

const CostSchema = new Schema({
  name: String,
  amount: Number,
  appliedTo: [String], // List of UIDs, -1 for everyone
  timeframe: Number // -1 for one-time costs
})

const UserSchema = new Schema({
  userId: { type: String, unique: true },
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  admin: { type: Boolean, default: false },
  password: String,
  phoneNumber: String,
  roomNumber: String,
  rentAmount: Number,
  rentPaid: [String],
  chores: [ChoreSchema],
  avatarUrl: { type: String, default: '' }, // Add avatarUrl field
})

export default mongoose.models.User || mongoose.model("User", UserSchema)