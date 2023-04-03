const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
});

//static method get avg xourse tuition
CourseSchema.statics.getAverageCost = async function(bootcampId){
   
    const obj = await this.aggregate([
        {
            $match:{bootcamp :bootcampId}
        },
        {
            $group:{
                _id:'$bootcamp',
                averageCost:{$avg:'$tuition'}

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
            averageCost:Math.ceil(obj[0].averageCost/10)*10
        })
        
    } catch (error) {
        console.error(err);
    }

}

//call getAverageCost after save
CourseSchema.post('save',function(){
    this.constructor.getAverageCost(this.bootcamp);

});

//call getAverageCost before save
CourseSchema.pre('save',function(){
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);