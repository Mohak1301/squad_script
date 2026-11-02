import crypto from "crypto";
import meetmodel from "../models/meetmodel.js";

const createMeetingId = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const values = crypto.randomBytes(12);
  return Array.from(values, (value) => letters[value % letters.length])
    .map((letter, index) => index > 0 && index % 3 === 0 ? `-${letter}` : letter)
    .join("");
};

export const createmeetController = async (req, res) => {
  try {
    let meeting_id;
    do meeting_id = createMeetingId();
    while (await meetmodel.exists({ meeting_id }));

    const meet = await meetmodel.findOneAndUpdate(
      { createdBy: req.user._id },
      { $set: { meeting_id }, $setOnInsert: { createdBy: req.user._id, meeting_members: [] } },
      { new: true, upsert: true, runValidators: true }
    );
    return res.status(200).json({ success: true, message: "Meeting created successfully", meeting_id, meet });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to create meeting" });
  }
};

export const joinmeetController = async (req, res) => {
  try {
    const { meet_id } = req.params;
    if (!/^[a-z-]{12,20}$/.test(meet_id)) return res.status(400).json({ success: false, message: "Invalid meeting ID" });
    const meet = await meetmodel.findOne({ meeting_id: meet_id });
    if (!meet) return res.status(404).json({ success: false, message: "No such meeting!" });
    const memberId = String(req.user._id);
    const members = meet.meeting_members.map(String);
    if (!members.includes(memberId) && members.length >= 4) return res.status(409).json({ success: false, message: "Meeting members can't be greater than 4" });
    if (!members.includes(memberId)) {
      meet.meeting_members.push(req.user._id);
      await meet.save();
    }
    return res.status(200).json({ success: true, message: "Joined meeting" });
  } catch {
    return res.status(500).json({ success: false, message: "Unable to join meeting" });
  }
};

export const meetingTokenController = (req, res) => {
  if (!process.env.VIDEO_SDK_TOKEN) return res.status(503).json({ success: false, message: "Video service is not configured" });
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ success: true, token: process.env.VIDEO_SDK_TOKEN });
};
