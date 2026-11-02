import express from "express";
import { requireSignIn } from "../middleware/authmiddleware.js";
import { uploadFileController } from "../controllers/filecontroller.js";
import { getFilesController } from "../controllers/filecontroller.js";
import { getFileByIdController } from "../controllers/filecontroller.js";
import { deleteFileController } from "../controllers/filecontroller.js";
import { updateFileController } from "../controllers/filecontroller.js";
import { getPublicFileController } from "../controllers/filecontroller.js";

const router = express.Router();

router.post("/files", requireSignIn, uploadFileController);
router.get("/files", getFilesController);
router.get("/files/:meetingid", getPublicFileController);
router.get("/getfiles", requireSignIn, getFileByIdController);
router.delete("/deletefiles",requireSignIn,deleteFileController ); 
router.put("/updatefiles",requireSignIn ,updateFileController) ;


export default router;
