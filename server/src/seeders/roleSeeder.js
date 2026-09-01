const Role = require("../modules/roles/role.model");



const roles = [

{
    name:"Admin",
    description:"Full system access",
    permissions:[
        "users.manage",
        "products.manage",
        "inventory.manage",
        "sales.manage",
        "reports.view"
    ]
},


{
    name:"Manager",
    description:"Pharmacy manager",
    permissions:[
        "products.manage",
        "inventory.manage",
        "sales.manage",
        "reports.view"
    ]
},


{
    name:"Pharmacist",
    description:"Handles medicine operations",
    permissions:[
        "products.view",
        "sales.create",
        "inventory.view"
    ]
},


{
    name:"Cashier",
    description:"Handles sales",
    permissions:[
        "sales.create",
        "products.view"
    ]
},


{
    name:"Inventory Staff",
    description:"Manages stock",
    permissions:[
        "inventory.manage",
        "products.view"
    ]
}


];





const seedRoles = async()=>{


    for(const role of roles){


        const exists = await Role.findOne({
            name:role.name
        });



        if(!exists){

            await Role.create(role);

            console.log(
                `${role.name} role created`
            );

        }

    }


};



module.exports = seedRoles;