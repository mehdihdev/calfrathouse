import mongoose, { Schema } from "mongoose"

const ChoreSchema = new Schema({
  name: { type: String, required: true }, // Name of the chore
  assignedTo: [{ type: String }], // List of user IDs or room numbers, or "-1" for all roommates
  dueDate: { type: Date, required: true }, // Due date of the chore
  repeat: { type: String, enum: ['none', 'weekly', 'biweekly', 'monthly'], default: 'none' }, // Repeat frequency
  completed: { type: Boolean, default: false }, // Completion status
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the chore was created
  updatedAt: { type: Date, default: Date.now }, // Timestamp for when the chore was last updated
})

export default mongoose.models.Chore || mongoose.model("Chore", ChoreSchema)
