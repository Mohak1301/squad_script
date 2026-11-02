import express from 'express'
import { createmeetController, joinmeetController, meetingTokenController } from '../controllers/meetcontroller.js';
import { requireSignIn } from '../middleware/authmiddleware.js';
const router=express.Router();
router.post("/createmeet",requireSignIn,createmeetController);
router.post("/joinmeet/:meet_id",requireSignIn,joinmeetController);
router.get("/token",requireSignIn,meetingTokenController);
export default router;
