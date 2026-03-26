import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import sleepRouter from "./sleep.js";
import habitsRouter from "./habits.js";
import profileRouter from "./profile.js";
import predictionsRouter from "./predictions.js";
import authRouter from "./auth.js";
import statisticsRouter from "./statistics.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(sleepRouter);
router.use(habitsRouter);
router.use(profileRouter);
router.use(predictionsRouter);
router.use(statisticsRouter);

export default router;
