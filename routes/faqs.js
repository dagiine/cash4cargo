import express from "express";
import Faq from "../models/Faq.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Public FAQ list — user талд харагдана
router.get("/", async (req, res) => {
  try {
    const filter = req.user?.role === "admin" ? {} : { is_active: true };
    const faqs = await Faq.find(filter).sort({ createdAt: -1 });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// Admin FAQ нэмэх
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { question, answer, category, is_active } = req.body;

    const faq = await Faq.create({
      question,
      answer,
      category: category || "Ерөнхий",
      is_active: is_active ?? true,
    });

    res.status(201).json(faq);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: msgs.join(", ") });
    }
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// Admin FAQ шинэчлэх
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!faq) return res.status(404).json({ message: "FAQ олдсонгүй" });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// Admin FAQ устгах
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ олдсонгүй" });
    res.json({ message: "FAQ устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

export default router;
