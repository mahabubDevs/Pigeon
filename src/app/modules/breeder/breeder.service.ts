import { Breeder } from "./breeder.model";
import { IBreeder } from "./breeder.interface";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";

export const BreederService = {
  createBreeder: async (data: IBreeder): Promise<IBreeder> => {
    const result = await Breeder.create(data);
    return result;
  },

  getAllBreeders: async (): Promise<IBreeder[]> => {
    return Breeder.find().lean();
  },

  getBreederById: async (id: string): Promise<IBreeder | null> => {
    return Breeder.findById(id).lean();
  },

  updateBreeder: async (id: string, data: Partial<IBreeder>): Promise<IBreeder | null> => {
    const updated = await Breeder.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, "Breeder not found");
    return updated;
  },

  deleteBreeder: async (id: string): Promise<IBreeder | null> => {
    const deleted = await Breeder.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, "Breeder not found");
    return deleted;
  },
};
