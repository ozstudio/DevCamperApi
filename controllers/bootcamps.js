const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');



//@desc  Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public

exports.getBootcamps =asyncHandler(async (req,res,next) =>{
   
    let query;
    let queryStr = JSON.stringify(req.query);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match => `$${match}`);
    

        query =  Bootcamp.find(JSON.parse(queryStr));
        console.log(JSON.parse(queryStr));
        const bootcamps = await query;
        
        res.status(200).json({success:true,data:bootcamps});
}); 


//@desc  Get single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access Public

exports.getBootcamp = asyncHandler(async (req,res,next) =>{
    
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){

            //fires if id is correct but not found in db
          return   next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
        res.status(200).json({success:true,data:bootcamp});
    
   
})

//@desc  Create new bootcamp
//@route POST /api/v1/bootcamps
//@access Private

exports.createBootcamp =asyncHandler(async (req,res,next) =>{
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
        success:true,
        data:bootcamp
})
})


//@desc  Update  bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private

exports.updateBootcamp =asyncHandler(async (req,res,next) =>{
  
    
      const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,
    req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({success:true});
     
   
});


//@desc  Delete  bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access Private

exports.deleteBootcamp =asyncHandler(async (req,res,next) =>{
    
         const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
if(!bootcamp){
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
}
         return res.status(200).json({success:true});
})

//@desc  Get  bootcamps within a radius
//@route GET /api/v1/bootcamps/radius/:zipcode:/distance
//@access Public

exports.getBootcampsInRadius =asyncHandler(async (req,res,next) =>{
    const {zipcode,distance} = req.params;


    //get lat/lng geocoder
 const loc = await geocoder.geocode(zipcode);
 const lat = loc[0].latitude;
 const lng = loc[0].longitude;
 

 //calc raduis using radians
 //devide dist by radius of Earth
 //Earth radius = 3.963 mi / 6378km

 const radius = distance/3963;

 const bootcamps =await Bootcamp.find({
    location: {
       $geoWithin: { $centerSphere: [ [ lng, lat ],radius] }
    }
 })
 
 res.status(200).json({
    success:true,
    count:bootcamps.length,
    data:bootcamps
})



}); 



