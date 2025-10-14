import { Schema, model } from "mongoose";

const userLoftSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pigeon: {
      type: Schema.Types.ObjectId,
      ref: "Pigeon",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// prevent same pigeon multiple times in same user loft
userLoftSchema.index({ user: 1, pigeon: 1 }, { unique: true });

export const UserLoft = model("UserLoft", userLoftSchema);
