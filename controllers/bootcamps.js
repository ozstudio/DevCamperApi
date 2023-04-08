const path =require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');



//@desc  Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public

exports.getBootcamps =asyncHandler(async (req,res,next) =>{
        res.status(200).json(res.advancedResults);
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

    //Add user to req.body
    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user:req.user.id});

    //if the user is not an admin,they can only add one bootcamp
if(publishedBootcamp && req.user.role != 'admin'){
    return next(
        new ErrorResponse(`The user with Id ${req.user.id} has already published a bootcamp`,400));

}

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
  
    
      let bootcamp = await Bootcamp.findById(req.params.id);
if(!bootcamp){
    return next (
        new ErrorResponse(`Bootcamp not found with id of ${req.params.is}`,404)
    )
}

//make sure logged in user is the owner of the bootcamp
if(bootcamp.user.toString() != req.user.id && req.user.role != 'admin'){
    return next (
        new ErrorResponse(`User with id of ${req.params.is} not an owner of this bootcamp`,401)
    )
}

bootcamp =await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
})

    res.status(200).json({success:true,data:bootcamp});
     
   
});


//@desc  Delete  bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access Private

exports.deleteBootcamp =asyncHandler(async (req,res,next) =>{
    
         const bootcamp = await Bootcamp.findById(req.params.id);
if(!bootcamp){
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
}



//make sure logged in user is the owner of the bootcamp
if(bootcamp.user.toString() != req.user.id && req.user.role != 'admin'){
    return next (
        new ErrorResponse(`User with id of ${req.params.is} not an owner of this bootcamp`,401)
    )
}

        bootcamp.deleteOne();
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
//@desc  upload photo  bootcamp
//@route PUT /api/v1/bootcamps/:id/photo
//@access Private

exports.bootcampPhotoUpload =asyncHandler(async (req,res,next) =>{
    
    const bootcamp = await Bootcamp.findById(req.params.id);
if(!bootcamp){
return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
}

//make sure logged in user is the owner of the bootcamp
if(bootcamp.user.toString() != req.user.id && req.user.role != 'admin'){
    return next (
        new ErrorResponse(`User with id of ${req.params.is} not an owner of this bootcamp`,401)
    )
}

if(!req.files){
    return next(new ErrorResponse(`Please upload a file ${req.params.id}`,400));
}

const file =req.files.file;

//make sure the file is a photo
// you have properties in 'file' variable(mimetype,size)
if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse(`Please upload an image file ${req.params.id}`,400));
}
//check file size
if(file.size > process.env.MAX_FILE_UPLOAD){
    return next(new ErrorResponse(`Please upload an image file less then ${req.params.id}`,400));

}

//create custom filename
//${path.parse(file.name).ext} 
//path has method  - 'parse'
//ext method comes from node path module
file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;


file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,
async err =>{
    if(err){
        console.log(err);
        return next(new ErrorResponse(`Problem with file upload`,500));
    } 

    await Bootcamp.findByIdAndUpdate(req.params.id,{
        photo:file.name
    })
res.status(200).json({
    success:true,
    data:file.name
})

});

})




