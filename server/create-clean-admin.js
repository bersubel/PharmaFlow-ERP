require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://<username>:<password>@cluster.mongodb.net/pharmaflow?retryWrites=true&w=majority";

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);

    const db = mongoose.connection.db;
    const usersCol = db.collection("users");
    const rolesCol = db.collection("roles");

    // 1. Ensure Admin Role exists
    let adminRole = await rolesCol.findOne({ name: "Admin" });
    if (!adminRole) {
      const inserted = await rolesCol.insertOne({
        name: "Admin",
        description: "Full Administrator Access",
        permissions: ["all"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      adminRole = { _id: inserted.insertedId };
    }

    // 2. Hash plain text "Admin@12345"
    const hashedPassword = await bcrypt.hash("Admin@12345", 10);

    // 3. Clear existing conflicting entries
    await usersCol.deleteMany({
      email: { $in: ["admin@pharmaflow.com", "systemadmin@pharmaflow.com"] },
    });

    // 4. Create both admin@pharmaflow.com and systemadmin@pharmaflow.com
    await usersCol.insertMany([
      {
        firstName: "System",
        lastName: "Admin",
        email: "admin@pharmaflow.com",
        password: hashedPassword,
        phone: "0000000000",
        role: adminRole._id,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "System",
        lastName: "Admin",
        email: "systemadmin@pharmaflow.com",
        password: hashedPassword,
        phone: "0000000000",
        role: adminRole._id,
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log("\n==============================================");
    console.log("Admin accounts ready:");
    console.log(" 1) admin@pharmaflow.com       / Admin@12345");
    console.log(" 2) systemadmin@pharmaflow.com / Admin@12345");
    console.log("==============================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Error creating clean admin:", err);
    process.exit(1);
  }
}

run();