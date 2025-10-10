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
import { getAllZones, createZone, updateZone, deleteZone, syncZoneToDependents, syncAllZones } from "../controllers/pricings/zoneController.js";

const router = express.Router();
const vehicleUploader = getUploader("vehicle");

router.post("/vehicles", protect, authorize("superadmin", "clientadmin", "associateadmin"), vehicleUploader.single("image"), createVehicle);
router.get("/vehicles", protect, getAllVehicles);
router.put("/vehicles/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), vehicleUploader.single("image"), updateVehicle);
router.delete("/vehicles/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteVehicle);
router.get("/vehicles/public", getVehiclesByCompanyId);

router.get("/general", protect, authorize("superadmin", "clientadmin", "associateadmin"), getGeneralPricing);
router.get("/general/widget", protect, getGeneralPricingWidget);
router.post("/general", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateGeneralPricing);

router.post("/addHourlyPackage", protect, authorize("superadmin", "clientadmin", "associateadmin"), createHourlyPackage);
router.get("/getAllHourlyRates", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllHourlyPackages);
router.get("/getHourlyRateById/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), getHourlyPackageById);
router.put("/updateHourlyPackage/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateHourlyPackage);
router.delete("/delHourlyPackage/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteHourlyPackage);

router.get("/fixed-prices", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllFixedPrices);
router.get("/fixed-widget", getFixedPricesByCompanyId);
router.post("/fixed-prices", protect, authorize("superadmin", "clientadmin", "associateadmin"), createFixedPrice);
router.put("/fixed-prices/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateFixedPrice);
router.delete("/fixed-prices/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteFixedPrice);

router.get("/postcode-prices", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllPostcodePrices);
router.get("/widget/postcode-prices", getAllPostcodePricesWidget);
router.post("/postcode-prices", protect,  authorize("superadmin", "clientadmin", "associateadmin"), createPostcodePrice);
router.put("/postcode-prices/:id", protect,  authorize("superadmin", "clientadmin", "associateadmin"), updatePostcodePrice);
router.delete("/postcode-prices/:id", protect,  authorize("superadmin", "clientadmin", "associateadmin"), deletePostcodePrice);

router.get("/zones", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllZones);
router.post("/zones", protect, authorize("superadmin", "clientadmin", "associateadmin"), createZone);
router.put("/zones/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateZone);
router.delete("/zones/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteZone);
router.post("/zones/:id/sync", protect, authorize("superadmin", "clientadmin", "associateadmin"), syncZoneToDependents);
router.post("/zones/sync-all", protect, authorize("superadmin", "clientadmin", "associateadmin"), syncAllZones);

router.get("/extras", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllExtras);
router.get("/extras-widget", getExtrasByCompanyId);
router.post("/extras", protect, authorize("superadmin", "clientadmin", "associateadmin"), createExtra);
router.put("/extras/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateExtra);
router.delete("/extras/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteExtra);

router.get("/discount", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllDiscounts);
router.get("/discount/widget", getDiscountsByCompanyId);
router.post("/discount", protect, authorize("superadmin", "clientadmin", "associateadmin"), createDiscount);
router.put("/discount/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateDiscount);
router.delete("/discount/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteDiscount);

router.get("/vouchers", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllVouchers);
router.get("/vouchers/widget", getVoucherByCode);
router.post("/vouchers", protect, authorize("superadmin", "clientadmin", "associateadmin"), createVoucher);
router.put("/vouchers/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateVoucher);
router.delete("/vouchers/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteVoucher);

export default router;
