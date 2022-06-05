const express=require('express');
const router=express.Router({mergeParams:true});

const Campground=require('../models/campground');
const Review=require('../models/review');
const {reviewSchema}=require('../schemas.js');
const catchAsync=require('../utilis/catchAsync');
const ExpressError=require('../utilis/ExpressError');
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware');
const reviews=require('../controllers/reviews');

router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview));
module.exports=router;