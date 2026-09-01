const seedRoles = require("./roleSeeder");
const createAdmin = require("./adminSeeder");



const runSeeders = async()=>{


    await seedRoles();


    await createAdmin();



};



module.exports = runSeeders;