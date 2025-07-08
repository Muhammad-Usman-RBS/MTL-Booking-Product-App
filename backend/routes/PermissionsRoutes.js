import express from "express";
import {  updateSuperAdminPermissions } from "../controllers/PermissionsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch(
  "/superadmin-permissions",
  protect,
  authorize("superadmin"),
  updateSuperAdminPermissions
);



export default router;
