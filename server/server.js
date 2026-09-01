require("dotenv").config();
console.log("JWT SECRET:", process.env.JWT_SECRET);

const app = require("./src/app");

const connectDB = require("./src/config/db");

const runSeeders = require("./src/seeders");



const PORT = process.env.PORT || 5000;



const startServer = async()=>{


    await connectDB();


    await runSeeders();



    app.listen(PORT,()=>{

        console.log(
            `Server running on port ${PORT}`
        );

    });


};



startServer();