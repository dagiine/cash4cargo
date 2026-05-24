/**
 * seed.js — MongoDB-д жишээ өгөгдөл оруулах
 * Ажиллуулах: node seed.js
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Shipment from "./models/Shipment.js";
import Faq from "./models/Faq.js";

const users = [
  {
    name: "Бат",
    phone: "99112233",
    password_hash: await bcrypt.hash("password123", 10),
    role: "user",
  },
  {
    name: "Сараа",
    phone: "99447176",
    password_hash: await bcrypt.hash("password123", 10),
    role: "user",
  },
  {
    name: "Admin",
    phone: "88000001",
    password_hash: await bcrypt.hash("admin123", 10),
    role: "admin",
  },
];

const faqs = [];

const shipments = [
  {
    user_phone: "99112233",
    tracking_code: "MN-12345",
    sender_name: "Бат",
    receiver_name: "Бат",
    receiver_phone: "99112233",
    origin_country: "Хятад",
    destination_country: "Монгол",
    items: [
      { item_name: "Гутал", quantity: 2, weight: 6.5, price: 20000, description: "Nike гутал" },
      { item_name: "Хувцас", quantity: 3, weight: 6.0, price: 15000, description: "Өмд, цамц" },
    ],
    total_weight: 12.5,
    shipping_price: 35000,
    status: "Улаанбаатарт ирсэн",
    payment_status: "Төлөгдсөн",
    estimated_delivery: new Date("2026-05-20"),
    status_history: [
      { status: "Захиалга үүсгэсэн", description: "Захиалга бүртгэгдлээ", updatedAt: new Date("2026-05-01") },
      { status: "Хятадын агуулахад", description: "Хятад агуулахад хүлээн авлаа", updatedAt: new Date("2026-05-02") },
      { status: "Замын Үүд дээр", description: "Замын Үүд хилийн боомт дээр", updatedAt: new Date("2026-05-04") },
      { status: "Улаанбаатарт ирсэн", description: "УБ агуулахад хүрлээ", updatedAt: new Date("2026-05-06") },
    ],
  },
  {
    user_phone: "99447176",
    tracking_code: "MN-67890",
    sender_name: "Сараа",
    receiver_name: "Сараа",
    receiver_phone: "99447176",
    origin_country: "Хятад",
    destination_country: "Монгол",
    items: [
      { item_name: "Цүнх", quantity: 1, weight: 5.0, price: 15000, description: "Luxury bag" },
    ],
    total_weight: 5.0,
    shipping_price: 15000,
    status: "Замын Үүд дээр",
    payment_status: "Төлөгдөөгүй",
    estimated_delivery: new Date("2026-05-22"),
    status_history: [
      { status: "Захиалга үүсгэсэн", description: "Захиалга бүртгэгдлээ", updatedAt: new Date("2026-05-02") },
      { status: "Хятадын агуулахад", description: "Хятад агуулахад хүлээн авлаа", updatedAt: new Date("2026-05-03") },
      { status: "Замын Үүд дээр", description: "Замын Үүд хилийн боомт дээр", updatedAt: new Date("2026-05-05") },
    ],
  },
  {
    user_phone: "99112233",
    tracking_code: "MN-11111",
    sender_name: "Бат",
    receiver_name: "Бат",
    receiver_phone: "99112233",
    origin_country: "Хятад",
    destination_country: "Монгол",
    items: [
      { item_name: "Электроник", quantity: 1, weight: 2.0, price: 50000, description: "Ухаалаг гар утас" },
    ],
    total_weight: 2.0,
    shipping_price: 8000,
    status: "Олгогдсон",
    payment_status: "Төлөгдсөн",
    estimated_delivery: new Date("2026-05-10"),
    status_history: [
      { status: "Захиалга үүсгэсэн", description: "", updatedAt: new Date("2026-04-28") },
      { status: "Хятадын агуулахад", description: "", updatedAt: new Date("2026-04-29") },
      { status: "Замын Үүд дээр", description: "", updatedAt: new Date("2026-05-01") },
      { status: "Улаанбаатарт ирсэн", description: "", updatedAt: new Date("2026-05-03") },
      { status: "Олгогдсон", description: "Хэрэглэгчид олгогдлоо", updatedAt: new Date("2026-05-05") },
    ],
  },
];

async function seed() {
  await connectDB();
  
  for (const user of users) {
    await User.updateOne(
      { phone: user.phone },
      { $setOnInsert: user },
      { upsert: true }
    );
  }

  for (const shipment of shipments) {
    await Shipment.updateOne(
      { tracking_code: shipment.tracking_code },
      { $setOnInsert: shipment },
      { upsert: true }
    );
  }

  for (const faq of faqs) {
    await Faq.updateOne(
      { question: faq.question },
      { $setOnInsert: faq },
      { upsert: true }
    );
  }

  console.log("Seed амжилттай дууслаа.");
  console.log("\nНэвтрэх мэдээлэл:");
  console.log("  Хэрэглэгч 1: 99112233 / password123");
  console.log("  Хэрэглэгч 2: 99447176 / password123");
  console.log("  Admin:       88000001 / admin123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed алдаа:", err);
  process.exit(1);
});