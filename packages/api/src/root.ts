import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { workerRouter } from "./routers/worker";
import { hirerRouter } from "./routers/hirer";
import { trustRouter } from "./routers/trust";
import { consentRouter } from "./routers/consent";
import { incidentRouter } from "./routers/incident";
import { adminRouter } from "./routers/admin";
import { storageRouter } from "./routers/storage";

export const appRouter = router({
  auth: authRouter,
  worker: workerRouter,
  hirer: hirerRouter,
  trust: trustRouter,
  consent: consentRouter,
  incident: incidentRouter,
  admin: adminRouter,
  storage: storageRouter,
});

export type AppRouter = typeof appRouter;
