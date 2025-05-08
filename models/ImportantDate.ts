import mongoose, { Schema } from "mongoose"

const ImportantDateSchema = new Schema({
  title: { type: String, required: true }, // Title of the important date
  date: { type: Date, required: true }, // Date of the event
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the date was created
  updatedAt: { type: Date, default: Date.now }, // Timestamp for when the date was last updated
})

export default mongoose.models.ImportantDate || mongoose.model("ImportantDate", ImportantDateSchema)
