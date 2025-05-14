import express from 'express';
import { submitWidgetForm } from '../controllers/widgetController.js';

const router = express.Router();

router.post('/submit', submitWidgetForm);

export default router;
