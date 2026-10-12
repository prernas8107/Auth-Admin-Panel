const User = require('../models/User');

//  Get all users (with search & filters)
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

//  Create a new user by Admin
//  POST /api/v1/admin/users
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'user', // Admin can assign admin or user role
            status: 'active',
        });

        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userData,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//    Update user status or role
//    PATCH /api/v1/admin/users/:id
exports.updateUser = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@auth.com';
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Primary admin cannot be modified or blocked
        if (targetUser.email === adminEmail) {
            return res.status(400).json({ success: false, message: 'Primary administrator account cannot be modified' });
        }

        // Admin cannot modify themselves (block/role change)
        if (targetUser._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot modify your own account' });
        }

        const { status, role } = req.body;

        if (status) {
            targetUser.status = status;
        }
        if (role && (role === 'admin' || role === 'user')) {
            targetUser.role = role;
        }

        await targetUser.save();
        const userData = targetUser.toObject();
        delete userData.password;

        res.status(200).json({ success: true, message: 'User updated successfully', data: userData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//    Delete user
//    DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@auth.com';
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Primary admin cannot be deleted
        if (user.email === adminEmail) {
            return res.status(400).json({ success: false, message: 'Primary administrator account cannot be deleted' });
        }

        // Admin cannot delete themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
