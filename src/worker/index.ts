import { prisma } from "@/lib/prisma";
import { processOrder } from "@/services/order.service";

const POLL_INTERVAL_MS = 2000;

let running = true;

async function tick() {
  const pending = await prisma.order.findMany({
    where: { status: "PENDING" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  for (const o of pending) {
    try {
      await processOrder(o.id);
    } catch (e) {
      console.error("processOrder error", o.id, e);
    }
  }
}

async function loop() {
  console.log("Worker started");
  while (running) {
    try {
      await tick();
    } catch (e) {
      console.error("tick error", e);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

process.on("SIGINT", () => { running = false; });
process.on("SIGTERM", () => { running = false; });

loop().then(() => {
  console.log("Worker stopped");
  process.exit(0);
});
