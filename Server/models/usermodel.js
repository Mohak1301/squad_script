import mongoose from "mongoose";

const userschema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
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
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpPurpose: {
      type: String,
      enum: ["email-verification", "password-reset"],
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default:false,
    },
    lastVerified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userschema.set("toJSON", {
  transform: (_document, value) => {
    delete value.password;
    delete value.otp;
    delete value.otpPurpose;
    delete value.otpExpiresAt;
    return value;
  },
});

userschema.methods.checkVerification = async function() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  if (this.lastVerified < sixMonthsAgo) {
    this.isVerified = false;
    await this.save();
  }
  if (!this.isVerified && this.lastVerified < oneMonthAgo) {
    await this.model('Users').deleteOne({ _id: this._id });
  }
};

export default mongoose.model("Users", userschema);
