// src/modules/breeder/breeder.interface.ts
export interface IBreeder {
  loftName: string;
  breederName: string;
  country: string;
  email: string;
  phone: string;
  status: string;
  experience: number;
  gender: "Male" | "Female" | "Other";
}
