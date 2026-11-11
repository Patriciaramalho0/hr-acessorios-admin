
import { Pagination } from "@/types/pagination";

export type StaffStatus = "active" | "inactive";

// Modelo de apresentação legado; não representa tabelas da loja atual.
export type SBStaff = { id: string; email: string; name: string; phone: string | null; image_url: string | null; created_at: string; joining_date: string; updated_at: string; published: boolean; role_id: number };
type SBStaffRole = { name: "super_admin" | "admin" | "cashier"; display_name: string };

export type Staff = SBStaff & {
  staff_roles: {
    name: string | null;
    display_name: string | null;
  } | null;
};

export interface FetchStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface FetchStaffResponse {
  data: Staff[];
  pagination: Pagination;
}

export type StaffRolesDropdown = Pick<SBStaffRole, "name" | "display_name">;
