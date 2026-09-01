const manufacturerService = require("./manufacturer.service");



const getManufacturers = async (req, res) => {


    try {


        const manufacturers =

            await manufacturerService.getManufacturers();



        res.json({

            success: true,

            data: manufacturers

        });



    } catch(error) {


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};





const getManufacturer = async (req,res)=>{


    try {


        const manufacturer =

            await manufacturerService.getManufacturer(
                req.params.id
            );



        if(!manufacturer){


            return res.status(404).json({

                success:false,

                message:"Manufacturer not found"

            });


        }



        res.json({

            success:true,

            data:manufacturer

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






const createManufacturer = async(req,res)=>{


    try {


        const manufacturer =

            await manufacturerService.createManufacturer(

                req.body,

                req.user._id

            );



        res.status(201).json({

            success:true,

            message:"Manufacturer created successfully",

            data:manufacturer

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






const updateManufacturer = async(req,res)=>{


    try{


        const manufacturer =

            await manufacturerService.updateManufacturer(

                req.params.id,

                req.body

            );



        res.json({

            success:true,

            message:"Manufacturer updated successfully",

            data:manufacturer

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};







const updateStatus = async(req,res)=>{


    try{


        const manufacturer =

            await manufacturerService.updateStatus(

                req.params.id,

                req.body.status

            );



        res.json({

            success:true,

            message:"Manufacturer status updated successfully",

            data:manufacturer

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






const deleteManufacturer = async(req,res)=>{


    try{


        await manufacturerService.deleteManufacturer(
            req.params.id
        );



        res.json({

            success:true,

            message:"Manufacturer deleted successfully"

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






module.exports = {


    getManufacturers,

    getManufacturer,

    createManufacturer,

    updateManufacturer,

    updateStatus,

    deleteManufacturer


};