var express    = require('express');
var router     = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');

//Index route
router.get('/', function(req, res) {
    Campground.find({}, function(err, allCampgrounds){
        if(err) {
            console.log(err);
        } else {
            res.render('campgrounds/index',{campgrounds: allCampgrounds});}
    });    
});

//Create logic
router.post('/', middleware.isLoggedIn, function(req, res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;

    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {
        name: name,
        image: image,
        description: desc,
        author: author
    };

    //Create a new campground and save to db
    Campground.create(newCampground, function(err, newCg){
        if(err) {
            req.flash('error', 'Opps, something went wrong. Campground not created');
        } else {
            req.flash('success', 'Campground created');
            res.redirect("/campgrounds");
        }
    });
});

//NEW -- show form to create campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
    res.render('campgrounds/new');
});

//SHOW -- shows info about the campground
router.get('/:id', function(req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCg){
        if(err || !foundCg){
            flash('error', 'Campground not found');
            res.redirect('back');
        } else {
            res.render('campgrounds/show', {campground: foundCg});
        }
    });
});

//Edit Campground(form)
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render('campgrounds/edit', {campground: foundCampground});            
    });
});

router.put('/:id', middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err) {
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res){ 
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds');
        }
    });
});

module.exports = router;