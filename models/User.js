import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Нэрээ оруулна уу"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Утасны дугаар оруулна уу"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{7}$/, "Утасны дугаар буруу байна (8 оронтой, 6-9-аар эхэлнэ)"],
    },
    password_hash: {
      type: String,
      required: [true, "Нууц үг оруулна уу"],
      minlength: [6, "Нууц үг дор хаяж 6 тэмдэгт байна"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Нууц үгийг хадгалахаас өмнө hash хийнэ
userSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Нууц үг шалгах method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password_hash);
};

// JSON хариуд password_hash хасна
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;