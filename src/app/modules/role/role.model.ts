import { Schema, model, Document } from "mongoose";

export interface IRole extends Document {
  roleName: string;
  permissions: string[];
}

const roleSchema = new Schema<IRole>(
  {
    roleName: { type: String, required: true, unique: true },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

export const Role = model<IRole>("Role", roleSchema);
