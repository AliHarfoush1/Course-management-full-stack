require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail || !process.env.ADMIN_PASSWORD) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            admin = await User.create({
                firstName: process.env.ADMIN_FIRST_NAME || "System",
                lastName: process.env.ADMIN_LAST_NAME || "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN",
                avatar: "/uploads/profile.jpg",
                isEmailVerified: true
            });

            console.log("Admin account created successfully");
        } else {
            admin.firstName = process.env.ADMIN_FIRST_NAME || admin.firstName;
            admin.lastName = process.env.ADMIN_LAST_NAME || admin.lastName;
            admin.password = hashedPassword;
            admin.role = "ADMIN";
            admin.avatar = admin.avatar || "/uploads/profile.jpg";
            admin.isEmailVerified = true;
            await admin.save();

            console.log("Admin account updated successfully");
        }

        await User.updateMany(
            {
                role: "ADMIN",
                email: { $ne: adminEmail }
            },
            {
                role: "STUDENT"
            }
        );

        console.log("Only one admin account is active");
        process.exit(0);
    } catch (err) {
        console.error("Seed admin error:", err.message);
        process.exit(1);
    }
};

seedAdmin();