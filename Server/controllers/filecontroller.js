import filemodel from "../models/filemodel.js";
import { cleanText } from "../helpers/validation.js";

const validLanguage = (value) => typeof value === "string" && value.trim().length > 0 && value.length <= 100;
const validMeetingId = (value) => typeof value === "string" && /^[A-Za-z0-9_-]{3,80}$/.test(value);

export const uploadFileController = async (req, res) => {
  try {
    const title = cleanText(req.body.title, 120);
    const language = cleanText(req.body.language, 100);
    const content = typeof req.body.content === "string" ? req.body.content : "";
    const meetingid = cleanText(req.body.meetingid, 80);
    const access = req.body.access === true;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    if (!validLanguage(language)) return res.status(400).json({ success: false, message: "Language is required" });
    if (!content || content.length > 500_000) return res.status(400).json({ success: false, message: "Content is required and must be under 500 KB" });
    if (!validMeetingId(meetingid)) return res.status(400).json({ success: false, message: "Invalid meeting ID" });

    await filemodel.create({ title, language, content, author: req.user._id, meetingid, access });
    return res.status(201).json({ success: true, message: "File saved" });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "File already exists" });
    return res.status(500).json({ success: false, message: "Unable to save file" });
  }
};

export const getFilesController = async (req, res) => {
  try {
    const files = await filemodel.find({ access: true }).select("title language content meetingid createdAt updatedAt").sort({ updatedAt: -1 }).limit(100).lean();
    return res.status(200).json({ success: true, message: "Files retrieved successfully", files });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to retrieve files" });
  }
};

export const getPublicFileController = async (req, res) => {
  try {
    const meetingid = cleanText(req.params.meetingid, 80);
    if (!validMeetingId(meetingid)) return res.status(400).json({ success: false, message: "Invalid meeting ID" });
    const file = await filemodel.findOne({ meetingid, access: true }).select("title language content meetingid createdAt updatedAt").lean();
    if (!file) return res.status(404).json({ success: false, message: "File not found" });
    return res.status(200).json({ success: true, message: "File retrieved successfully", file });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to retrieve file" });
  }
};

export const getFileByIdController = async (req, res) => {
  try {
    const file = await filemodel.findOne({ author: req.user._id }).sort({ updatedAt: -1 }).lean();
    if (!file) return res.status(404).json({ success: false, message: "File not found" });
    return res.status(200).json({ success: true, message: "File retrieved successfully", file });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to retrieve file" });
  }
};

export const deleteFileController = async (req, res) => {
  try {
    const meetid = cleanText(req.body.meetid, 80);
    if (!validMeetingId(meetid)) return res.status(400).json({ success: false, message: "Invalid meeting ID" });
    const result = await filemodel.deleteOne({ meetingid: meetid, author: req.user._id });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "File not found or access denied" });
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to delete file" });
  }
};

export const updateFileController = async (req, res) => {
  try {
    const meetid = cleanText(req.body.meetid || req.body.meetingid, 80);
    if (!validMeetingId(meetid)) return res.status(400).json({ success: false, message: "Invalid meeting ID" });
    const updates = {};
    if (req.body.title !== undefined) updates.title = cleanText(req.body.title, 120);
    if (req.body.language !== undefined) updates.language = cleanText(req.body.language, 100);
    if (req.body.content !== undefined) {
      if (typeof req.body.content !== "string" || req.body.content.length > 500_000) return res.status(400).json({ success: false, message: "Content must be under 500 KB" });
      updates.content = req.body.content;
    }
    if (req.body.access !== undefined) updates.access = req.body.access === true;
    const file = await filemodel.findOneAndUpdate({ meetingid: meetid, author: req.user._id }, { $set: updates }, { new: true, runValidators: true }).lean();
    if (!file) return res.status(404).json({ success: false, message: "File not found or access denied" });
    return res.status(200).json({ success: true, message: "Updated successfully", file });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to update file" });
  }
};
