const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAdminStats,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Sirf Admins ke liye protect karein
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
