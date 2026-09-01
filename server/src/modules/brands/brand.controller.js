const brandService = require("./brand.service");



const getBrands = async(req,res)=>{


    try{


        const brands =
            await brandService.getBrands();



        res.json({

            success:true,

            data:brands

        });


    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






const getBrand = async(req,res)=>{


    try{


        const brand =
            await brandService.getBrand(
                req.params.id
            );



        if(!brand){

            return res.status(404).json({

                success:false,

                message:"Brand not found"

            });

        }



        res.json({

            success:true,

            data:brand

        });


    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};







const createBrand = async(req,res)=>{


    try{


        const brand =
            await brandService.createBrand(

                req.body,

                req.user._id

            );



        res.status(201).json({

            success:true,

            message:"Brand created successfully",

            data:brand

        });


    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};








const updateBrand = async(req,res)=>{


    try{


        const brand =
            await brandService.updateBrand(

                req.params.id,

                req.body

            );



        res.json({

            success:true,

            message:"Brand updated successfully",

            data:brand

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


        const brand =
            await brandService.updateStatus(

                req.params.id,

                req.body.status

            );



        res.json({

            success:true,

            message:"Brand status updated successfully",

            data:brand

        });


    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};








const deleteBrand = async(req,res)=>{


    try{


        await brandService.deleteBrand(
            req.params.id
        );



        res.json({

            success:true,

            message:"Brand deleted successfully"

        });


    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






module.exports={


    getBrands,

    getBrand,

    createBrand,

    updateBrand,

    updateStatus,

    deleteBrand


};