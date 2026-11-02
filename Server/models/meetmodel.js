import mongoose from "mongoose";

const meetschema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    meeting_members: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      validate: [(members) => members.length <= 4, "A meeting supports up to four members"],
    },
    meeting_id: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

meetschema.index({ createdBy: 1 }, { unique: true });

meetschema.methods.checkmeetExpiry = async function() {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  if (this.createdAt < twentyFourHoursAgo) {
    await this.model('Meet').deleteOne({ _id: this._id });
  }
};
export default mongoose.model("Meet", meetschema);
