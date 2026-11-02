import mongoose from "mongoose";

const fileschema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },
      language: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      content: {
        type: String,
        required: true,
        maxlength: 500000,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
      access: {
        type: Boolean,
        required: true,
        default: false, 
      },
      access_id:{
        type : Array,
        default: [],
      },
      meetingid:{
        type: String,
        required:true,
        unique : true,
        trim: true,
        maxlength: 80,
      }
    },
    {
      timestamps: true,
    }
  );

  fileschema.index({ author: 1, updatedAt: -1 });
  fileschema.index({ access: 1, updatedAt: -1 });
  
  fileschema.methods.checkExpiry = async function() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    if (this.createdAt < twentyFourHoursAgo) {
      await this.model('files').deleteOne({ _id: this._id });
    }
  };

  export default mongoose.model("files", fileschema);
