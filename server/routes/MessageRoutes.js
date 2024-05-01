import { Router } from "express";
import {
  addAudioMessage,
  addImageMessage,
  addMessage,
  getInitialContactswithMessages,
  getMessages,
} from "../controllers/MessageController.js";
import multer from "multer";

const router = Router();

const uploads = multer({dest:"uploads/recordings"})
const uploadImage = multer({ dest: "uploads/images" });

router.post("/add-message", addMessage);
router.get("/get-messages/:from/:to", getMessages);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);
router.post("/add-audio-message", uploads.single("audio"), addAudioMessage);
router.get("/get-intial-contacts/:from", getInitialContactswithMessages);

export default router;
