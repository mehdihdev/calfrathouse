import mongoose, { Schema } from "mongoose"

const DocumentSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., lease, agreement, addendum, vote, etc.
  filename: { type: String, required: true }, // Path to the file in public/documents
})

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema)
