import express from "express";
import Faq from "../models/Faq.js";
import FaqCategory from "../models/FaqCategory.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Public category list — user FAQ дээр ангилал болж харагдана.
router.get("/categories", async (_req, res) => {
  try {
    const categories = await FaqCategory.find({ is_active: true }).sort({ createdAt: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: "FAQ ангилал ачаалахад алдаа гарлаа" });
  }
});

// Admin шинэ FAQ ангилал нэмнэ.
router.post("/categories", protect, adminOnly, async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Ангиллын нэр оруулна уу" });

    const category = await FaqCategory.findOneAndUpdate(
      { name: name.trim() },
      { name: name.trim(), icon: icon || "help", is_active: true },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "FAQ ангилал хадгалахад алдаа гарлаа" });
  }
});

// Public FAQ list — user талд харагдана.
router.get("/", async (_req, res) => {
  try {
    const faqs = await Faq.find({ is_active: true }).sort({ createdAt: -1 });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: "Серверийн алдаа" });
  }
});

// Admin FAQ нэмэх.
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { question, answer, category, is_active } = req.body;
    const categoryName = category?.trim() || "Захиалга";

    await FaqCategory.findOneAndUpdate(
      { name: categoryName },
      { name: categoryName, icon: "help", is_active: true },
      { upsert: true, new: true }
    );

    const faq = await Faq.create({
      question,
      answer,
      category: categoryName,
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

// Admin FAQ шинэчлэх.
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

// Admin FAQ устгах.
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