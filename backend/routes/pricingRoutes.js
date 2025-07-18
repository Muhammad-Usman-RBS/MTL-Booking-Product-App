import express from "express";
import { getUploader } from "../middleware/cloudinaryUpload.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getGeneralPricing, updateGeneralPricing, getGeneralPricingWidget } from "../controllers/pricings/generalController.js";
import { createVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehiclesByCompanyId } from "../controllers/pricings/vehicleController.js";
import { createHourlyPackage, deleteHourlyPackage, getAllHourlyPackages, getHourlyPackageById, updateHourlyPackage } from "../controllers/pricings/hourlyPackageController.js";
import { getAllFixedPrices, createFixedPrice, updateFixedPrice, deleteFixedPrice, getFixedPricesByCompanyId } from "../controllers/pricings/fixedPriceController.js";
import { getAllExtras, createExtra, updateExtra, deleteExtra, getExtrasByCompanyId } from "../controllers/pricings/extrasController.js";
import { getAllPostcodePrices, createPostcodePrice, updatePostcodePrice, deletePostcodePrice, getAllPostcodePricesWidget } from "../controllers/pricings/postcodePriceController.js";
import { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount, getDiscountsByCompanyId } from "../controllers/pricings/discountController.js";
import { getAllVouchers, createVoucher, updateVoucher, deleteVoucher, getVoucherByCode } from "../controllers/pricings/voucherController.js";
import { getAllZones, createZone, updateZone, deleteZone } from "../controllers/pricings/zoneController.js";

const router = express.Router();
const vehicleUploader = getUploader("vehicle");

// VEHICLE PRICING
router.post("/vehicles", protect, authorize("superadmin", "clientadmin"), vehicleUploader.single("image"), createVehicle);
router.get("/vehicles", protect, getAllVehicles);
router.put("/vehicles/:id", protect, authorize("superadmin", "clientadmin"), vehicleUploader.single("image"), updateVehicle);
router.delete("/vehicles/:id", protect, authorize("superadmin", "clientadmin"), deleteVehicle);
router.get("/vehicles/public", getVehiclesByCompanyId);

// GENERAL
router.get("/general", protect, getGeneralPricing);
router.get("/general/widget", protect, getGeneralPricingWidget);        // For Widget
router.post("/general", protect, authorize("superadmin", "clientadmin"), updateGeneralPricing);

// HOURLY PACKAGES
router.post("/addHourlyPackage", createHourlyPackage);
router.get("/getAllHourlyRates", getAllHourlyPackages);
router.get("/getHourlyRateById/:id", getHourlyPackageById);
router.put("/updateHourlyPackage/:id", updateHourlyPackage);
router.delete("/delHourlyPackage/:id", deleteHourlyPackage);

// FIXED PRICING
router.get("/fixed-prices", protect, getAllFixedPrices);
router.get("/fixed-widget", getFixedPricesByCompanyId);                   // For Widget
router.post("/fixed-prices", protect, createFixedPrice);
router.put("/fixed-prices/:id", protect, updateFixedPrice);
router.delete("/fixed-prices/:id", protect, deleteFixedPrice);

// POSTCODE PRICING
router.get("/postcode-prices", protect, getAllPostcodePrices);
router.get("/widget/postcode-prices", getAllPostcodePricesWidget);    // For Widget
router.post("/postcode-prices", protect, createPostcodePrice);
router.put("/postcode-prices/:id", protect, updatePostcodePrice);
router.delete("/postcode-prices/:id", protect, deletePostcodePrice);

// ZONES CRUD
router.get("/zones", protect, getAllZones);
router.post("/zones", protect, createZone);
router.put("/zones/:id", protect, updateZone);
router.delete("/zones/:id", protect, deleteZone);

// EXTRAS PRICING
router.get("/extras", protect, getAllExtras);
router.get("/extras-widget", getExtrasByCompanyId);                  // For Widget
router.post("/extras", protect, createExtra);
router.put("/extras/:id", protect, updateExtra);
router.delete("/extras/:id", protect, deleteExtra);

// DISCOUNT PRICING
router.get("/discount", protect, getAllDiscounts);
router.get("/discount/widget", getDiscountsByCompanyId);    // For Widget
router.post("/discount", protect, createDiscount);
router.put("/discount/:id", protect, updateDiscount);
router.delete("/discount/:id", protect, deleteDiscount);

// VOUCHERS PRICING
router.get("/vouchers", protect, getAllVouchers);
router.get("/vouchers/widget", getVoucherByCode);    // For Widget
router.post("/vouchers", protect, createVoucher);
router.put("/vouchers/:id", protect, updateVoucher);
router.delete("/vouchers/:id", protect, deleteVoucher);

export default router;
