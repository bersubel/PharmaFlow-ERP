require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://<username>:<password>@cluster.mongodb.net/pharmaflow?retryWrites=true&w=majority";

async function resetAdmin() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const rolesCollection = db.collection("roles");

    // 1. Ensure Admin Role Exists
    let adminRole = await rolesCollection.findOne({ name: "Admin" });
    if (!adminRole) {
      const roleResult = await rolesCollection.insertOne({
        name: "Admin",
        description: "Full system control",
        permissions: [
          "dashboard.view",
          "products.view",
          "products.manage",
          "inventory.view",
          "inventory.manage",
          "sales.view",
          "sales.create",
          "reports.view",
          "users.manage",
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      adminRole = { _id: roleResult.insertedId };
      console.log("Created Admin Role");
    }

    // 2. Hash Plaintext Password "Admin@12345"
    const plainPassword = "Admin@12345";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Upsert Admin User with email "systemadmin@pharmaflow.com"
    const filter = { email: "systemadmin@pharmaflow.com" };
    const update = {
      $set: {
        firstName: "System",
        lastName: "Admin",
        email: "systemadmin@pharmaflow.com",
        password: hashedPassword,
        phone: "+251 91 123 4567",
        role: adminRole._id,
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    };

    const result = await usersCollection.updateOne(filter, update, {
      upsert: true,
    });

    console.log("\n==========================================");
    console.log("Admin account successfully configured!");
    console.log("Email:    systemadmin@pharmaflow.com");
    console.log("Password: Admin@12345");
    console.log("==========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Error resetting admin:", err);
    process.exit(1);
  }
}

resetAdmin();