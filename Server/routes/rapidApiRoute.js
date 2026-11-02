// rapidApiRoute.js
import express from 'express';
import { rapidApiCompileController, rapidApiDetailController, rapidApiResultController } from '../controllers/rapidApicontroller.js';
import { requireSignIn } from '../middleware/authmiddleware.js';
import { compilerLimiter } from '../middleware/security.js';
const router = express.Router();

router.get("/",requireSignIn ,rapidApiDetailController);

router.post("/judge",compilerLimiter,requireSignIn ,rapidApiCompileController);

router.get("/judge/:id",compilerLimiter,requireSignIn ,rapidApiResultController);

export default router;
