const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const slougify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true,'Please add an name'],
        unique:true,
        trim:true,
        maxlength:[30,'not more than 30 charachters']
    },
    slug:String,
    description:{
        type:String,
        required: [true,'Please add a description'],
        
        
        maxlength:[500,'not more than 500 charachters']

    },
    website:{
        type:String
    },
    phone:{
        type:String,
        maxlength:[20,'not more than 10 charachters']

    },
    email:{
        type:String
    }
    ,
    address:{
        type:String,
        required:[true,'Please add an address']
    },
    location:{
        //GeoJson point
        type:{
            type:String,
            enum :['Point'],
         //   required:true
        },
        coordinates:{
            type:[Number],
          //  required:true,
            index:'2dsphere'
        },
        formattedAddress:String,
        street:String,
        city:String,
        state:String,
        zipcode:String,
        zipcode:String,
        country:String


    },
    careers:{
        //array of strings
        type:[String],
        required:true,
        enum:[
             "Web Development",
             "UI/UX",
             "Mobile Development",
             "Data Science",
             "Business"
        ]
    },
    averageRating:{
        type:Number,
        min:[1,'rating must be at least 1'],
        max:[10,'ratint can not be more than 10']
    },
    averageCost:Number,
    photo:{
        type:String,
        default:'no-photo.jpg'
    },
    housing:{
        type:Boolean,
        default:false
    },
    jobAssistance:{
        type:Boolean,
        default:false
    }
    ,
    jobGuarantee:{
        type:Boolean,
        default:false
    }
    ,
    acceptGi:{
        type:Boolean,
        default:false
    } 
    ,
    createdAt:{
        type:Date,
        default:Date.now
    }


});

//create bootcap slug
BootcampSchema.pre('save',function(next){
   this.slug = slugify(this.name,{lower:true})
    next();
})

//geocode create location field
BootcampSchema.pre('save',async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location  = {
        type:'Point',
        coordinates:[loc[0].longitude,loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street:loc[0].streetName,
        city:loc[0].city,
        state:loc[0].stateCode,
        zipCode:loc[0].zipcode,
        country:loc[0].country,
    }

    //do not save address in db
    this.address = undefined;
    next();

});

module.exports = mongoose.model('Bootcamp',BootcampSchema);