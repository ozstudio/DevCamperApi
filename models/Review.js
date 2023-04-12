const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength:100
  },
  text: {
    type: String,
    required: [true, 'Please add a some text']
  },
  rating: {
    type: Number,
    min:1,
    max:10,
    required:[true,'Please add arating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

//Prevent user from submiting more than one review per bootcamp
ReviewSchema.index ({bootcamp:1,user:1},{unique:true});


//static method get avg rating
ReviewSchema.statics.getAverageCost = async function(bootcampId){
   
  const obj = await this.aggregate([
      {
          $match:{bootcamp :bootcampId}
      },
      {
          $group:{
              _id:'$bootcamp',
              averageRating:{$avg:'$rating'}

          }
      }
  ])
  try {
          //obj returns (1) array,after we extracting 'obj[0].averageCost'
          //
      //(1) [
      //     { _id: new ObjectId("5d725a1b7b292f5f8ceff788"), averageCost: 9000 }
      //   ]
      //obj returns array
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
          averageRating:obj[0].averageRating
      })
      
  } catch (error) {
      console.error(err);
  }

}

//call getAverageCost after save
ReviewSchema.post('save',function(){
  this.constructor.getAverageRating(this.bootcamp);

});

//call getAverageCost before save
ReviewSchema.pre('save',function(){
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review',ReviewSchema);