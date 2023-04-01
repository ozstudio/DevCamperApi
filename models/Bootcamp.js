const mongoose = require('mongoose');

const BootcampSchema = new mongoose.Schema({
    name:{
        type:String,
      //  required: [true,'Please add an name'],
        unique:true,
        trim:true,
        maxlength:[30,'not more than 30 charachters']
    },
    slug:String,
    description:{
        type:String,
      //  required: [true,'Please add a description'],
        
        
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


})
module.exports = mongoose.model('Bootcamp',BootcampSchema);