import mongoose from "mongoose";

const faqCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ангиллын нэр оруулна уу"],
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      default: "help",
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const FaqCategory = mongoose.model("FaqCategory", faqCategorySchema);
export default FaqCategory;