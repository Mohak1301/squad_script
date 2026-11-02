import crypto from "crypto";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import usermodel from "../models/usermodel.js";
import filemodel from "../models/filemodel.js";
import meetmodel from "../models/meetmodel.js";
import { hashPassword, comparePassword } from "../helpers/authhelper.js";
import {
  cleanText,
  isStrongPassword,
  isValidEmail,
  isValidUsername,
  normalizeEmail,
  publicUser,
} from "../helpers/validation.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.SESSION_COOKIE_SAME_SITE || "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.EMAIL || !process.env.PASSWORD) throw new Error("Email service is not configured");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  await transporter.sendMail({
    from: { name: "SquadScript", address: process.env.EMAIL },
    to,
    subject,
    text,
  });
};

const createOtp = async (user, purpose) => {
  const otp = String(crypto.randomInt(100000, 1000000));
  user.otp = await hashPassword(otp);
  user.otpPurpose = purpose;
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  await user.save();
  return otp;
};

const clearOtp = (user) => {
  user.otp = undefined;
  user.otpPurpose = undefined;
  user.otpExpiresAt = undefined;
};

export const registerController = async (req, res) => {
  try {
    const username = cleanText(req.body.username, 30);
    const name = cleanText(req.body.name, 80);
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!isValidUsername(username)) return res.status(400).json({ success: false, message: "Username must be 3-30 characters and use only letters, numbers, _ or -" });
    if (name.length < 2) return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
    if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "Enter a valid email address" });
    if (!isStrongPassword(password)) return res.status(400).json({ success: false, message: "Password must be 8-128 characters with uppercase, lowercase and a number" });

    const existing = await usermodel.findOne({ $or: [{ email }, { username }] }).lean();
    if (existing) return res.status(409).json({ success: false, message: "Email or username is already registered" });

    const user = await usermodel.create({ username, name, email, password: await hashPassword(password) });
    return res.status(201).json({ success: true, message: "User registered successfully", user: publicUser(user) });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Registration failed:", error);
    }
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "Email or username is already registered" });
    if (error instanceof mongoose.Error.ValidationError) {
      const firstMessage = Object.values(error.errors || {})[0]?.message;
      return res.status(400).json({ success: false, message: firstMessage || "Enter valid account details" });
    }
    if (!process.env.MONGOURL || /buffering timed out|MongoNotConnectedError|topology was destroyed/i.test(String(error?.message || ""))) {
      return res.status(503).json({
        success: false,
        message: process.env.NODE_ENV === "production"
          ? "Registration is temporarily unavailable. Please try again shortly."
          : "Database is not connected. Add MONGOURL to Server/.env and restart the API.",
      });
    }
    return res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

export const loginController = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!isValidEmail(email) || typeof password !== "string") return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await usermodel.findOne({ email }).select("+password");
    const valid = user ? await comparePassword(password, user.password) : false;
    if (!valid) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = JWT.sign({ _id: user._id, scope: "access" }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "squad-script-api",
      audience: "squad-script-client",
    });
    res.cookie("ss_session", token, sessionCookieOptions);
    return res.status(200).json({ success: true, message: "Logged in successfully", user: publicUser(user), token });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

export const mailcontroller = async (req, res) => {
  try {
    const user = await usermodel.findById(req.user._id).select("+otp +otpPurpose +otpExpiresAt");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const requestedEmail = normalizeEmail(req.body.email);
    if (requestedEmail && requestedEmail !== user.email) return res.status(403).json({ success: false, message: "You can only verify your own email" });

    const otp = await createOtp(user, "email-verification");
    await sendEmail({ to: user.email, subject: "Verify your SquadScript email", text: `Your SquadScript verification code is ${otp}. It expires in 10 minutes. Do not share it.` });
    return res.status(200).json({ success: true, message: "Verification code sent" });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to send verification code" });
  }
};

export const forgotpasswordcontroller = async (req, res) => {
  const genericResponse = { success: true, message: "If an account exists, a reset code has been sent" };
  try {
    const email = normalizeEmail(req.body.email);
    if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "Enter a valid email address" });
    const user = await usermodel.findOne({ email }).select("+otp +otpPurpose +otpExpiresAt");
    if (!user) return res.status(200).json(genericResponse);
    const otp = await createOtp(user, "password-reset");
    await sendEmail({ to: user.email, subject: "Reset your SquadScript password", text: `Your SquadScript password reset code is ${otp}. It expires in 10 minutes. Do not share it.` });
    return res.status(200).json(genericResponse);
  } catch {
    return res.status(500).json({ success: false, message: "Unable to process password reset" });
  }
};

export const verifyotpcontroller = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = cleanText(String(req.body.otp || ""), 12);
    const user = await usermodel.findOne({ email }).select("+otp +otpPurpose +otpExpiresAt");
    if (!user || !user.otp || !user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ success: false, message: "Invalid or expired verification code" });
    }
    const valid = user.otp.startsWith("$2") ? await comparePassword(otp, user.otp) : otp === String(user.otp);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid or expired verification code" });

    const purpose = user.otpPurpose || "email-verification";
    clearOtp(user);
    if (purpose === "email-verification") {
      user.isVerified = true;
      user.lastVerified = new Date();
      await user.save();
      return res.status(200).json({ success: true, message: "Verified successfully" });
    }
    await user.save();
    const resetToken = JWT.sign({ _id: user._id, scope: "password-reset" }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "10m",
      issuer: "squad-script-api",
      audience: "squad-script-client",
    });
    return res.status(200).json({ success: true, message: "Code verified", resetToken });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to verify code" });
  }
};

export const getpasswordcontroller = async (req, res) => {
  try {
    const token = req.body.resetToken || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const decoded = JWT.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (decoded.scope !== "password-reset") return res.status(403).json({ success: false, message: "Invalid reset authorization" });
    if (!isStrongPassword(req.body.password)) return res.status(400).json({ success: false, message: "Password must be 8-128 characters with uppercase, lowercase and a number" });
    const user = await usermodel.findById(decoded._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.password = await hashPassword(req.body.password);
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch {
    return res.status(401).json({ success: false, message: "Reset authorization is invalid or expired" });
  }
};

export const changepasswordcontroller = async (req, res) => {
  try {
    const user = await usermodel.findById(req.user._id).select("+password");
    const valid = user && await comparePassword(req.body.password || "", user.password);
    return res.status(valid ? 200 : 401).json({ success: Boolean(valid), message: valid ? "User can change password" : "Wrong password" });
  } catch {
    return res.status(400).json({ success: false, message: "Unable to verify current password" });
  }
};

export const verifychangepasswordcontroller = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).json({ success: false, message: "Passwords do not match" });
    if (!isStrongPassword(newPassword)) return res.status(400).json({ success: false, message: "Password must be 8-128 characters with uppercase, lowercase and a number" });
    const user = await usermodel.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.password = await hashPassword(newPassword);
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch {
    return res.status(400).json({ success: false, message: "Unable to change password" });
  }
};

export const contactcontroller = async (req, res) => {
  try {
    const user = await usermodel.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const content = cleanText(req.body.content, 5000);
    const type = cleanText(req.body.type, 40);
    if (content.length < 10 || !["complaint", "suggestion", "enquiry"].includes(type)) return res.status(400).json({ success: false, message: "Select a message type and enter at least 10 characters" });
    const recipients = [process.env.DEV1, process.env.DEV2].filter(Boolean);
    if (!recipients.length) throw new Error("Contact recipients are not configured");
    await sendEmail({ to: recipients, subject: `SquadScript ${type} from ${user.email}`, text: `From: ${user.email}\nType: ${type}\n\n${content}` });
    return res.status(200).json({ success: true, message: "Message sent" });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

export const islogincontroller = async (req, res) => {
  try {
    const user = await usermodel.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const name = cleanText(req.body.name, 80);
    const email = req.body.email ? normalizeEmail(req.body.email) : "";
    const username = cleanText(req.body.username, 30);
    if (email && !isValidEmail(email)) return res.status(400).json({ success: false, message: "Enter a valid email address" });
    if (username && !isValidUsername(username)) return res.status(400).json({ success: false, message: "Invalid username" });
    if (name) user.name = name;
    if (email && email !== user.email) { user.email = email; user.isVerified = false; user.lastVerified = new Date(); }
    if (username) user.username = username;
    if (name || email || username) await user.save();
    return res.status(200).json({ success: true, message: name || email || username ? "User updated successfully" : "User found successfully", data: [user.username, user.name, user.email, String(user.isVerified)] });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "Email or username is already in use" });
    return res.status(500).json({ success: false, message: "Unable to load user" });
  }
};

export const deleteusercontroller = async (req, res) => {
  try {
    await Promise.all([
      filemodel.deleteMany({ author: req.user._id }),
      meetmodel.deleteMany({ createdBy: req.user._id }),
      usermodel.deleteOne({ _id: req.user._id }),
    ]);
    res.clearCookie("ss_session", { ...sessionCookieOptions, maxAge: undefined });
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to delete user" });
  }
};

export const logoutcontroller = (req, res) => {
  res.clearCookie("ss_session", { ...sessionCookieOptions, maxAge: undefined });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};
