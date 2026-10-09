const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
    try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        process.exit(1); // Server band kar dega agar DB connect na ho
    }
};

module.exports = connectDB;
