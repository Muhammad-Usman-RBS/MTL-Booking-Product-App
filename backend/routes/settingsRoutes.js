import express from "express";
import {
  getAllZones,
  createZone,
  updateZone,
  deleteZone,
} from "../controllers/settings/zoneController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCoverage,
  deleteCoverage,
  getAllCoverage,
  getCoverageById,
  updateCoverage,
} from "../controllers/settings/coverageController.js";
import { createLocation, deleteLocationbyId, getAllLocations, getLocationById, updateLocationById } from "../controllers/settings/locationsController.js";
import { createBookingRestriction, deleteBookingRestriction, getAllBookingRestrictions, getBookingRestrictionById, updateBookingRestriction } from "../controllers/settings/BookingRestrictionDateController.js";

const router = express.Router();

// ZONES CRUD
router.get("/zones", protect, getAllZones);
router.post("/zones", protect, createZone);
router.put("/zones/:id", protect, updateZone);
router.delete("/zones/:id", protect, deleteZone);


// COVERAGE CRUD 
router.post("/create-coverage", createCoverage);

router.get("/get-all-coverages", getAllCoverage);

router.get("/get-single-coverage/:id", getCoverageById);

router.put("/update-coverage/:id", updateCoverage);

router.delete("/delete-coverage/:id", deleteCoverage);


// LOCATIONS CRUD 
router.post('/create-location', createLocation);
router.get('/get-all-locations', getAllLocations);
router.get('/get-location/:id', getLocationById);
router.put('/update-location/:id', updateLocationById);
router.delete('/delete-location/:id', deleteLocationbyId);

// BOOKINGRESTRICIONDATE CRUD 
router.post('/create-booking-registration', createBookingRestriction);
router.get('/get-all-booking-registration', getAllBookingRestrictions);
router.get('/get-booking-registration/:id', getBookingRestrictionById  );
router.put('/update-booking-registration/:id', updateBookingRestriction  );
router.delete('/delete-booking-registration/:id', deleteBookingRestriction  );

export default router;
