import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import sleepRouter from "./sleep.js";
import habitsRouter from "./habits.js";
import profileRouter from "./profile.js";
import predictionsRouter from "./predictions.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sleepRouter);
router.use(habitsRouter);
router.use(profileRouter);
router.use(predictionsRouter);

export default router;
