const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error')

//load env
 dotenv.config({path :'./config/config.env'});

 //connect to db
 connectDB();



//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');






 const app = express();



 //body parser
 app.use(express.json());



 //dev logging middleware
 if(process.env.NODE_ENV === 'development')
 {
    app.use(morgan('dev'));
 }

//mount routes
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);

//must be after 'mount routes'
app.use(errorHandler);



 const PORT = process.env.PORT || 5000 ;


 const server =  app.listen(PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    .yellow.bold));

    //handle rejections
    process.on('unhandledRejection',(err,promise) =>{
        console.log(`Error:${err.message}`.red);
        //close server
        server.close(()=>{
            process.exit(1)
        });
    })