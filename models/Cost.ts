import mongoose, { Schema } from 'mongoose'

const CostSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  appliedTo: [{ type: String }], // List of UIDs, -1 for everyone
  timeframe: { type: Number, required: true }, // -1 for one-time costs
  createdBy: { type: String, required: true }, // User ID of the admin who created the cost
})

export default mongoose.models.Cost || mongoose.model('Cost', CostSchema)
