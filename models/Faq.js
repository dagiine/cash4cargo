import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Асуулт оруулна уу"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Хариулт оруулна уу"],
      trim: true,
    },
    category: {
      type: String,
      default: "Захиалга",
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Faq = mongoose.model("Faq", faqSchema);
export default Faq;