if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

// console.log(process.env.SECRET);
// console.log(process.env.API_KEY);
const express=require('express');
const app=express();
const mongoose = require('mongoose');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const methodOverride=require('method-override');
const Campground=require('./models/campground');
const path=require('path');
//const Joi=require('joi');
const ExpressError=require('./utilis/ExpressError');
//const catchAsync=require('./utilis/catchAsync');
const {campgroundSchema,reviewSchema}=require('./schemas.js');
const Review=require('./models/review');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {MongoStore}=require('connect-mongo');
const MongoDBStore = require('connect-mongo')(session);



app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


const userRoutes=require('./routes/users');
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
// const dbUrl=process.env.DB_URL; 
const dbUrl='mongodb://localhost:27017/yelp-camp'  
mongoose.connect(dbUrl,{
    useNewURLParser: true,
    // useCreateIndex:true,
    useUnifiedTopology: true,
    // useFindAndModify:false
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");
});
app.engine('ejs',ejsMate);
// const validateCampground=(req,res,next)=>{
    // const campgroundSchema=joi.object({
    //         campground:joi.object({
    //             title:joi.string().required(),
    //             price:joi.number().required().min(0),
    //             image:joi.string().required(),
    //             location:joi.string().required(),
    //             description:joi.string().required()

    //         }).required()
    //     })
//         const {error}=campgroundSchema.validate(req.body);
//         if(error){
//             const msg=error.details.map(el=>el.message).join(',')
//             throw new ExpressError(msg,400)
//         }
//         else{
//             next();
//         }
//         // console.log(result);
      
// }
// const validateReview=(req,res,next)=>{
//     const {error}=reviewSchema.validate(req.body);
//     if(error){
//         const msg=error.details.map(el=>el.message).join(',')
//         throw new ExpressError(msg,400)
//     }
//     else{
//         next();
//     }
// }
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})



const sessionConfig={
    store,
    name: 'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
      httpOnly:true,
     // secure:true,
      expires:Date.now()*1000*60*60*24*7,
      maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());






app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    // console.log(req.session);
    console.log(req.query);
    res.locals.currentUser=req.user;
   res.locals.success=req.flash('success');
   res.locals.error=req.flash('error');
   next();
})

// app.get('/fakeUser',async(req,res)=>{
//    const user=new User({email:'ishu@gmail.com',username:'ishu'});
//   const newUser=await User.register(user,'ishika');
//   res.send(newUser);
// })


app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get('/',(req,res)=>{
    // res.send('HELLO FROM YELP CAMP')
    res.render('home');
})
// app.get('/makecampground',async (req,res)=>{
//     const camp=new Campground({title:'My Backyard',description:'cheap camping!!'});
//     await camp.save();
//     res.send(camp)
// })
// app.get('/campgrounds',catchAsync(async (req,res)=>{
//     const campgrounds=await Campground.find({});
//     res.render('campgrounds/index',{campgrounds})
//  }))
//  app.get('/campgrounds/new',(req,res)=>{
//     res.render('campgrounds/new');
// })
//app.post('/campgrounds',validateCampground,catchAsync(async (req,res,next)=>{
   // res.send(req.body);
//    try{
   
// const campgroundSchema=joi.object({
//             campground:joi.object({
//                 title:joi.string().required(),
//                 price:joi.number().required().min(0),
//                 image:joi.string().required(),
//                 location:joi.string().required(),
//                 description:joi.string().required()

//             }).required()
//         })
//         const {error}=campgroundSchema.validate(req.body);
//         if(error){
//             const msg=error.details.map(el=>el.message).join(',')
//             throw new ExpressError(msg,400)
//         }
//         console.log(result);
//    const campground=new Campground(req.body.campground);
//    await campground.save();
//    res.redirect(`/campgrounds/${campground._id}`)
//    }catch(e){
//        naxt(e);
//    }
// }))
//  app.get('/campgrounds/:id',catchAsync(async(req,res)=>{
//     const campground=await Campground.findById(req.params.id).populate('reviews');
//     //console.log(campground);
//     res.render('campgrounds/show',{campground});
//     // res.render('campgrounds/show');
// }));
// app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
//     const campground=await Campground.findById(req.params.id)
//     res.render('campgrounds/edit',{campground});
// }));
// app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
//     // res.send("IT WORKED!!");
//     const {id}=req.params;
//     const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
//     res.redirect(`/campgrounds/${campground._id}`)
// }));
// app.delete('/campgrounds/:id',catchAsync(async(req,res)=>{
//     const {id}=req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect('/campgrounds');
// }))
// app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res)=>{
//     // res.send('you made it!!')
//    const campground =await Campground.findById(req.params.id);
//    const review=new Review(req.body.review);
//    campground.reviews.push(review);
//    await review.save();
//    await campground.save();
//    res.redirect(`/campgrounds/${campground._id}`);
// }))
// app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res)=>{
//     const {id,reviewId}=req.params;
//     await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}`);
//     //res.send("Delete Me!!");
// }))
app.all('*',(req,res,next)=>{
    // res.send("404!!!");
    next(new ExpressError('Page Not Found',404))
})
app.use((err,req,res,next)=>{
    const {statusCode=500,message='Something went wrong'}=err;
    // const {statusCode=500}=err;
    if(!err.message) err.message='oh No,Something went wrong!!'
    res.status(statusCode).render('error',{err});
    res.send('Oh,something went wrong');
})
app.listen(3000,()=>{
    console.log('Serving on port 3000')
})
