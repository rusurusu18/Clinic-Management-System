import express from 'express';
import authRoutes from '../module/auth/auth.route.js';

const router = express.Router();

router.get('/health', (req, res) => {
  return res.json({
    message: 'clinic management system',
    success: true,
  });
});

router.use('/auth', authRoutes);

export default router;