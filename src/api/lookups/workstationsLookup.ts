import { workstationsRepo } from "@/api/repositories/workstationsRepo";
import { lookupsCache } from "./lookupsCache";

export const getWorkstationsOnce = async () => {
  if (lookupsCache.workstations.length > 0) {
    return lookupsCache.workstations;
  }

  try {
    const res = await workstationsRepo.list();
    if (res.success && res.data?.items) {
      lookupsCache.workstations = res.data.items.map((w: any) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        ...w
      }));
    }
    return lookupsCache.workstations;
  } catch (error) {
    console.error('Failed to load workstations lookup:', error);
    return [];
  }
};
