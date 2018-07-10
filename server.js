const path = require('path');

// server
const port = 5000;

// express
var express = require('express');
var app = express();

// bodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 

// view engine
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// static files
app.use(express.static(path.join(__dirname, './static')));

// use falsh messages
const flash = require('express-flash');
app.use(flash());

// session
var session = require('express-session');
app.use(session({
    secret: 'love you',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))

// require mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mongooseDashboard');

// create new Schema
var mongooseDashboard = new mongoose.Schema({
    type: { type: String, required: [true, 'Type of the Animal is required'],  minlength: [3, "Animal needs to have a type"] },
    name: { type: String, required: [true, 'Name is required'], minlength: [2, "You're Animal don't have any name? :("] },
    age: Number
}, {timestamps: true} );
// create collection
mongoose.model('Animal', mongooseDashboard);
var Animal = mongoose.model('Animal');


// routing
app.get('/', function(req, res){
    Animal.find({}, function(err, allAnimals){
        res.render('index', {allAnimals : allAnimals});
    })
})

// get to the page to create a new animal
app.get('/new', function(req, res){
    res.render('createNew');
})

// create new animal
app.post('/newAnimal', function(req, res){
    var addAnimal = new Animal({ type: req.body.type, name: req.body.name, age: req.body.age})
    
    // if error exists
    addAnimal.save(function(err){
        if(err){
            for(var key in err.errors){
                req.flash('addNewAnimal', err.errors[key].message);
            }
            res.redirect('/new');
        }
        else{
            res.redirect('/');
        }
    })
})

// show the information about the animal
app.get('/info/:id', function(req, res){
    // console.log(req.params.id);
    Animal.find({'_id' : req.params.id}, function(err, useAnimal){
        console.log('_id');
        if(err){
            for(var key in err.errors){
                req.flash('infoAbout', err.errors[key].message);
            }
            res.redirect('/');
        }
        else{
            console.log(useAnimal);
            res.render('animalInfo', {useAnimal : useAnimal});
        }
    })
})

// delete
app.get('/delete/:id', function(req, res){
    Animal.remove({'_id' : req.params.id}, function(deleteAnimal){
        res.redirect('/');
    })
})

// go to the page to edit 
app.get('/edit/:id', function(req, res){
    Animal.find({'_id' : req.params.id}, function(err, specAnimal){
        console.log(specAnimal);
        res.render('edit', {specAnimal : specAnimal});
    })
})


// update animal
app.post('/updateAnimal/:id', function(req, res){
    Animal.update({'_id' : req.params.id}, {$set: {type: req.body.type, name: req.body.name, age: req.body.age}}, {runValidators: true}, function(err, editAnimal){
        // console.log("I'm inside");
        // console.log(req.params.id);
        // console.log("@@@@@@@ err", err)
        if(err){
            // console.log("@@@@@@@ if")
            // console.log('You have an error', err);
            for(var key in err.errors){
                req.flash('editAnimal', err.errors[key].message);
            }
            return res.redirect('/edit/' + req.params.id);
        }
        else{
            // console.log("@@@@@@@ else")
            return res.redirect('/');
        }
    })
})

// going back
app.get('/back', function(req, res){
    res.redirect('/');
})







const server = app.listen(port)
