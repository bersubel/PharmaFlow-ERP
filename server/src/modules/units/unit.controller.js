const unitService = require("./unit.service");



const getUnits = async(req,res)=>{

    try{

        const units =
            await unitService.getUnits();


        res.json({

            success:true,

            data:units

        });


    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};





const getUnit = async(req,res)=>{

    try{


        const unit =
            await unitService.getUnit(
                req.params.id
            );


        if(!unit){

            return res.status(404).json({

                success:false,

                message:"Unit not found"

            });

        }



        res.json({

            success:true,

            data:unit

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};






const createUnit = async(req,res)=>{


    try{


        const unit =
            await unitService.createUnit(

                req.body,

                req.user._id

            );



        res.status(201).json({

            success:true,

            message:"Unit created successfully",

            data:unit

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






const updateUnit = async(req,res)=>{


    try{


        const unit =
            await unitService.updateUnit(

                req.params.id,

                req.body

            );



        res.json({

            success:true,

            message:"Unit updated successfully",

            data:unit

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


        const unit =
            await unitService.updateStatus(

                req.params.id,

                req.body.status

            );



        res.json({

            success:true,

            message:"Unit status updated successfully",

            data:unit

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






const deleteUnit = async(req,res)=>{


    try{


        await unitService.deleteUnit(
            req.params.id
        );



        res.json({

            success:true,

            message:"Unit deleted successfully"

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};





module.exports={

    getUnits,

    getUnit,

    createUnit,

    updateUnit,

    updateStatus,

    deleteUnit

};