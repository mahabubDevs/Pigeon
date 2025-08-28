import { Request, Response } from "express";
import { Role } from "./role.model";

// Create Role
export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create role",
      error,
    });
  }
};

// Get All Roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();
    res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch roles",
      error,
    });
  }
};
