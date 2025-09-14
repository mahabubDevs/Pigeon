import { Breeder } from "./breeder.model";
import { IBreeder } from "./breeder.interface";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../../util/queryBuilder";



interface getAllBreeders {
  searchTerm?: string;
  sort?: string;
  page?: number;
  limit?: number;
  fields?: string;
  [key: string]: any;
}



export const BreederService = {
  createBreeder: async (data: IBreeder): Promise<IBreeder> => {
    const result = await Breeder.create(data);
    return result;
  },

  getAllBreeders: async (query:getAllBreeders = {}): Promise<{
    breeder: IBreeder[];
    pagination: {
      total: number;
      limit: number;
      page: number;
      totalPage: number;
    }
  }> => {

  const builder = new QueryBuilder<IBreeder>(Breeder.find(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();
    const breeder = await builder.modelQuery;
    const pagination = await builder.getPaginationInfo();

    return {pagination, breeder};
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
