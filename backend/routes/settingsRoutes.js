import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createCoverage, deleteCoverage, getAllCoverage, getCoverageById, updateCoverage } from "../controllers/settings/coverageController.js";
import { createLocation, deleteLocationbyId, getAllLocations, getLocationById, updateLocationById } from "../controllers/settings/locationsController.js";
import { createBookingRestriction, deleteBookingRestriction, getAllBookingRestrictions, getBookingRestrictionById, updateBookingRestriction } from "../controllers/settings/BookingRestrictionDateController.js";
import { createLocationCategory, deleteLocationCategory, getAllLocationCategories, getLocationCategoryById, updateLocationCategory } from "../controllers/settings/locationCategoryController.js";
import { saveTheme, getTheme, getCurrentTheme, applyTheme, deleteTheme, getThemeHistory } from "../controllers/settings/themeController.js";

const router = express.Router();

// COVERAGE CRUD
router.post("/create-coverage", createCoverage);
router.get("/get-all-coverages", getAllCoverage);
router.get("/get-single-coverage/:id", getCoverageById);
router.put("/update-coverage/:id", updateCoverage);
router.delete("/delete-coverage/:id", deleteCoverage);

// LOCATIONS CRUD
router.post("/create-location", createLocation);
router.get("/get-all-locations", getAllLocations);
router.get("/get-location/:id", getLocationById);
router.put("/update-location/:id", updateLocationById);
router.delete("/delete-location/:id", deleteLocationbyId);

// BOOKING RESTRICION DATE CRUD
router.post("/create-booking-registration", createBookingRestriction);
router.get("/get-all-booking-registration", getAllBookingRestrictions);
router.get("/get-booking-registration/:id", getBookingRestrictionById);
router.put("/update-booking-registration/:id", updateBookingRestriction);
router.delete("/delete-booking-registration/:id", deleteBookingRestriction);

// LOCATION CATEGORY CRUD
router.post("/create-location-category", createLocationCategory);
router.get("/get-all-location-category", getAllLocationCategories);
router.get("/get-location-category/:id", getLocationCategoryById);
router.put("/update-location-category/:id", updateLocationCategory);
router.delete("/delete-location-category/:id", deleteLocationCategory);

// THEME CRUD
router.post("/save-theme", protect, authorize("superadmin", "clientadmin"), saveTheme);
router.get("/get-theme/:companyId", protect, authorize("superadmin", "clientadmin"), getTheme);
router.delete("delete-theme/:id", protect, authorize("superadmin", "clientadmin"), deleteTheme);
router.get("/theme-history/:companyId", protect, authorize("superadmin", "clientadmin"), getThemeHistory);
router.get("/current-theme/:companyId", protect, authorize("clientadmin", "driver", "customer"), getCurrentTheme);
router.post("/apply-them/:companyId/:themeId", protect, authorize("clientadmin"), applyTheme);

export default router;
