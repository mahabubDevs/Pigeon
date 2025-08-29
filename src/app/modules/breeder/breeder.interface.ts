// src/modules/breeder/breeder.interface.ts
export interface IBreeder {
  loftName: string;
  breederName: string;
  country: string;
  email: string;
  phone: string;
  status: boolean;
  experience: number;
  gender: "Male" | "Female" | "Other";
}
