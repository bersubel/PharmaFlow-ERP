const User = require("../modules/users/user.model");
const Role = require("../modules/roles/role.model");



const createAdmin = async()=>{


    const adminExists = await User.findOne({
        email:"admin@pharmaflow.com"
    });



    if(adminExists){

        return;

    }



    const adminRole = await Role.findOne({
        name:"Admin"
    });



    await User.create({

        firstName:"System",

        lastName:"Admin",

        email:"admin@pharmaflow.com",

        password:"Admin@123",

        role:adminRole._id,

        phone:"0000000000"

    });



    console.log(
        "Default admin created"
    );


};



module.exports = createAdmin;