const User = require('../models/User');

//  Get all users (with search & pagination)
// GET /api/v1/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const { search, role, status } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (role) query.role = role;
        if (status) query.status = status;

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//   Get Dashboard Statistics
//   GET /api/v1/admin/stats
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const blockedUsers = await User.countDocuments({ status: 'blocked' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        res.status(200).json({
            success: true,
            data: { totalUsers, activeUsers, blockedUsers, adminCount },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//    Update user status or role
//    PATCH /api/v1/admin/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { role, status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, status },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//    Delete user
//    DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
