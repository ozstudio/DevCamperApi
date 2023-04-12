const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const fileupload = require('express-fileupload');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


//load env
 dotenv.config({path :'./config/config.env'});

 const app = express();

 //connect to db
 connectDB();

 //file uploading
 app.use(fileupload());

 

 //set static folder (express)
 app.use(express.static(path.join(__dirname,'public')));


//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');


 //body parser
 app.use(express.json());

 //sanitize data
 app.use(mongoSanitize());

 //set security headers
 app.use(helmet());

 //prevent XSS cross site scripting
 app.use(xss());

 //Enable CORS
 app.use(cors())

 //Rate limiting
 const limiter =rateLimit({
    windowMs:10 * 60 * 1000,//10 min
    max:100
 })

 app.use(limiter);

 //Prevent http param polution
 app.use(hpp());


 app.use(cookieParser());



 //dev logging middleware
 if(process.env.NODE_ENV === 'development')
 {
    app.use(morgan('dev'));
 }

//mount routes
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);

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