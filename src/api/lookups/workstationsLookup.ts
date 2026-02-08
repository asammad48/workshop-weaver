import { workstationsRepo } from "@/api/repositories/workstationsRepo";

let workstationsCache: any[] | null = null;

export const getWorkstationsOnce = async () => {
  if (workstationsCache) return workstationsCache;
  const res = await workstationsRepo.list();
  if (res.success && res.data?.items) {
    workstationsCache = res.data.items.map((w: any) => ({
      id: w.id,
      code: w.code,
      name: w.name,
    }));
  }
  return workstationsCache || [];
};
