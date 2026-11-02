import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, required: true }, // sanitized rich-text HTML
  },
  { timestamps: true } // createdAt / updatedAt
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
