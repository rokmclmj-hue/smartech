import { prisma } from "@/lib/db";

// 수리접수(OfflineRepairJob) 8단계 → 온라인수리(RepairRequest) 3단계 — 2026-10-02 대표님 승인
const ONLINE_STATUS: Record<string, string> = {
  RECEIVED: "RECEIVED",
  ITEM_RECEIVED: "RECEIVED",
  SENT_TO_SUB: "IN_PROGRESS",
  WORKING: "IN_PROGRESS",
  UPLOADED: "IN_PROGRESS",
  QUOTE_SENT: "IN_PROGRESS",
  CONFIRMED: "IN_PROGRESS",
  DELIVERED: "DELIVERED",
};

// 온라인수리에서 "수리중"으로 함께 취급하는 상태값 (app/api/admin/repairs/route.ts 참고)
const IN_PROGRESS_GROUP = ["IN_PROGRESS", "INSPECTION", "COMPLETED"];

// "수리접수로 등록"으로 넘어온 건이면, 수리접수 상태를 온라인수리(고객 마이페이지에 보이는 상태)에 맞춘다.
// 수리접수 상태를 바꾼 직후에 호출한다. 실패해도 호출한 쪽 작업은 그대로 성공해야 하므로 오류를 던지지 않는다.
export async function syncOnlineRepairStatus(jobIds: number | number[]): Promise<void> {
  try {
    const ids = Array.isArray(jobIds) ? jobIds : [jobIds];
    const jobs = await prisma.offlineRepairJob.findMany({
      where: { id: { in: ids }, sourceRepairId: { not: null } },
      select: { jobNo: true, status: true, sourceRepair: { select: { id: true, status: true } } },
    });

    for (const job of jobs) {
      const online = job.sourceRepair;
      const target = ONLINE_STATUS[job.status];
      if (!online || !target || online.status === "CANCELLED") continue;
      if (online.status === target) continue;
      if (target === "IN_PROGRESS" && IN_PROGRESS_GROUP.includes(online.status)) continue;

      await prisma.repairRequest.update({
        where: { id: online.id },
        data: {
          status: target,
          statusLogs: {
            create: {
              fromStatus: online.status,
              toStatus: target,
              note: `수리접수 ${job.jobNo} 상태 연동`,
              changedBy: "system",
            },
          },
        },
      });
    }
  } catch (e) {
    console.error("[온라인수리 상태 연동 오류]", e);
  }
}
