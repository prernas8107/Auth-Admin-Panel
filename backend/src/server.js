require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./config/seedAdmin');

const PORT = process.env.PORT || 5000;

// Database Connect karo pehle, fir seed admin aur server start karo
connectDB().then(async () => {
    await seedAdmin();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
