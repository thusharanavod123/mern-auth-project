import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyOtp: { type: String, default: "" },
  verifyOypExpireAt: { type: Number, default: 0 },
  isAccountVeried: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
});

const userModel = mongoose.models.user || mongoose.model("User", UserSchema);
export default userModel;
