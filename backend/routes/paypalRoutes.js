// routes/paypalRoutes.js
import express from 'express';
import { getConfig, createOrder, captureOrder } from '../controllers/settings/paypalController.js';

const router = express.Router();

router.get('/config', getConfig);
router.post('/create-order', createOrder);
router.post('/capture-order', captureOrder);

export default router;