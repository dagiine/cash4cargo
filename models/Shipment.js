import mongoose from "mongoose";

const STATUS_VALUES = [
  "Захиалга үүсгэсэн",
  "Хятадын агуулахад",
  "Замын Үүд дээр",
  "Улаанбаатарт ирсэн",
  "Олгогдсон",
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS_VALUES, required: true },
    description: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    item_name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    weight: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    // Хэрэглэгчтэй холбоо (нэвтэрсэн хэрэглэгчийн утасны дугаар)
    user_phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Tracking
    tracking_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: [/^MN-\d{5}$/, "Tracking код буруу (MN-XXXXX)"],
    },

    // Илгээгч / Хүлээн авагч
    sender_name: { type: String, required: true },
    receiver_name: { type: String, required: true },
    receiver_phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{7}$/, "Утасны дугаар буруу"],
    },

    // Газар
    origin_country: { type: String, default: "Хятад" },
    destination_country: { type: String, default: "Монгол" },

    // Ачаанууд
    items: [orderItemSchema],

    // Нийлбэр
    total_weight: { type: Number, required: true },
    shipping_price: { type: Number, required: true },

    // Төлөв
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "Захиалга үүсгэсэн",
    },

    // Төлбөр
    payment_status: {
      type: String,
      enum: ["Төлөгдөөгүй", "Төлөгдсөн"],
      default: "Төлөгдөөгүй",
    },

    // Статусын түүх
    status_history: [statusHistorySchema],

    estimated_delivery: { type: Date },
  },
  { timestamps: true }
);

// Индекс — утасны дугаараар хурдан хайх (tracking_code-д unique:true байгаа тул давхар нэмэхгүй)
shipmentSchema.index({ user_phone: 1 });

const Shipment = mongoose.model("Shipment", shipmentSchema);
export default Shipment;
