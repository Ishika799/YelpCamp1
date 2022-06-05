const mongoose = require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewURLParser: true,
   // useCreateIndex:true,
    useUnifiedTopology: true
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");
});
const sample=array=>array[Math.floor(Math.random()*array.length)];
const seedDB=async()=>{
    await Campground.deleteMany({});
    // const c=new Campground({title:'purple field'});
    // await c.save();
    for(let i=0;i<100;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp= new Campground({
          author:'628f369b9084ba5d67baf96d',
          location:`${cities[random1000].city}, ${cities[random1000].state}`,
          title:`${sample(descriptors)} ${sample(places)}`,
        //   image:'https://source.unsplash.com/collection/483251',
          description:'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint, suscipit!',
          price,
          geometry: {
            type: "Point",
            coordinates: [
              cities[random1000].longitude,
              cities[random1000].latitude,
            ]
        },
     images: [
        {
            url: 'https://res.cloudinary.com/dmuomnxqr/image/upload/v1653987339/YelpCamp/igj5j1xnwyztywxd1err.jpg',
            filename: 'YelpCamp/igj5j1xnwyztywxd1err',
          },

    {
        url: 'https://res.cloudinary.com/dmuomnxqr/image/upload/v1654091942/YelpCamp/zbestw46fuwtgvfifgxo.jpg',
        filename: 'YelpCamp/rmjajfdrwb2mtq9sye0w',
      }
    ],
       })
       await camp.save();
    }
}
// seedDB();
seedDB().then(()=>{
    mongoose.connection.close();
})