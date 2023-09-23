//////// Imports ////////
const express = require("express"); //express.js
const bcrypt = require("bcrypt"); //bcrypt
const session = require('express-session'); // express-session
const sessionSQL = require('express-mysql-session')(session); // express-mysql-session
const util = require("./util.js"); //util.js file
const arrayShuffle = require("shuffle-array");
//const { render } = require("ejs");
var config; //initialises config

try { // attempts to retrieve file
    config = require("./config/config.json")
    console.log("config.json successfully loaded");   
} catch { // err if file doesn't exist
    console.log("Error reading config.json file\n=> Make sure it exists by making a config.json file in config folder")
    process.exit()
}

//bcrypt.hash("Pass123_", 10, function (err,hash) {
//    console.log(hash)
//})

// gets all the parameters of the config file
const db_host = config.db_host;
const db_user = config.db_user;
const db_pass = config.db_pass;
const db_database = config.db_database;
if(db_host == undefined || db_user == undefined || db_pass == undefined || db_database == undefined) { //tests if the values exists
    console.log("Error reading config.json file\n=> Make sure there are db_host, db_user, db_pass and db_database values")
    process.exit()
}

// make express web server
const app = express()
const port = 3000;

app.use(express.json()); // allows express.js to use JSON format
app.use(express.urlencoded({extended: true})); // allows express.js to see HTML <form> values
app.set("view engine", "ejs"); // allows express.js to use template engines to make a dynamic website
app.use("/js", express.static("pages/js"));
app.use("/img", express.static("pages/img"));

//connect to database
var db = new util.Util(db_host, db_user, db_pass, db_database); // using parameters in config.json
db.connectToDB();

const sessionStore = new sessionSQL({}, db.con);
app.use(
    session({
        secret: 'JMF8lkf3f@{}f3.ap[f3fpl[3w',
        resave: false,
        saveUninitialized: false,
        store: sessionStore      // assigning the sql session as storage
    })
);

// This is when it receives a request from a user to load the root website
// req => info about request + form data given by user
// res => allows us to send pages to the user
app.get('/', (req, res) => {
    if(req.session.userid) {
        res.redirect("/decks");
    } else {
        res.render(__dirname + "/pages/login.ejs", {errMsg:"",successMsg:""}); //sends the login.html file in the pages folder
    }
})

app.post('/signup', (req, res) => {
    const email = req.body.email; // get values from form
    const username = req.body.username;
    const password = req.body.password;

    var validateTest = db.validate(email, username, password); // validates data
    var handleAccCreation = (valid) => { // this function runs if data is valid
        if(!valid) { // if username already exists
            res.render(__dirname + "/pages/login.ejs", {errMsg:"Username already exists. Please choose another.",successMsg:""});
            return;
        }
        bcrypt.hash(password, 10, function (err,hash) {
            if(err) { // if hash for whatever reason doesn't work
                console.log("Error while hashing password")
                console.log(err)
                res.render(__dirname + "/pages/login.ejs", {errMsg:"Server side hashing error. Please try again.",successMsg:""});
                return;
            }
            db.createNewUser(email, hash, username); // create the new user now that all validations are done
            res.render(__dirname + "/pages/login.ejs", {errMsg:"",successMsg:"Successfully created account! You may now login."});
        })
    }
    if(!validateTest) { //if server side validation returns false
        res.render(__dirname + "/pages/login.ejs", {errMsg:"Server side validation error. Please try again.",successMsg:""});
        return;
    } else {
        db.checkUserAvailable(username, handleAccCreation) // checks if username is available
    }
})

app.post('/signin', (req, res) => {
    const username = req.body.username; // get values from form
    const password = req.body.password;
    var actualPassword;
    var checkPass = (valid) => {
        if(!valid) {
            res.render(__dirname + "/pages/login.ejs", {errMsg:"Server side retrieval error - try again.",successMsg:""});
            return;
        } // valid returns the first user found in format {userID, password}
        bcrypt.compare(password, valid.password, function(err, result) {
            if(err) { // if hash for whatever reason doesn't work
                console.log("Error while comparing hashes")
                console.log(err)
                res.render(__dirname + "/pages/login.ejs", {errMsg:"Server side hashing error. Please try again.",successMsg:""});
                return;
            }
            if(!result) {
                res.render(__dirname + "/pages/login.ejs", {errMsg:"Wrong password. Please try again.",successMsg:""});
                return;
            }
            req.session.userid = valid.userID;
            res.redirect("/decks");
            //res.render(__dirname + "/pages/login.ejs", {errMsg:"",successMsg:"Successfully logged in!"});
        })
    }
    var userCheck = (valid) => {
        // in this case this being true is invalid
        // this is because if true, it means the username DOESN'T exist
        // but we need it to exist
        if(valid) {
            res.render(__dirname + "/pages/login.ejs", {errMsg:"Username doesn't exist - try again.",successMsg:""});
            return;
        }
        db.getPassFromUsername(username, checkPass);
    }
    db.checkUserAvailable(username, userCheck) // checks if username exists
})

app.post('/deckedit', (req, res) => {
    if(req.body.deckName.trim() != "") db.setDeckInfo(req.session.userid, req.session.editing, req.body.deckName.trim(), req.body.deckDesc);
    for(key in req.body) {
        if(key == "template" || key == "deckName" || key == "deckDesc") continue;
        if(key.startsWith("e")) { // card EXISTS - have to update it
            var cardData = req.body[key];
            var cardID = key.substring(1);
            db.setCardInfo(req.session.userid, cardID, cardData[0], cardData[1]);
        }
        if(key.startsWith("n")) { // card IS NEW - have to create it
            var cardData = req.body[key];
            db.createNewCard(req.session.userid, req.session.editing, cardData[0], cardData[1], 0);
        }
        if(key.startsWith("d")) {
            var toDelete = req.body[key].split(",");
            toDelete.forEach(id  => {
                db.deleteCardFromID(req.session.userid, id);
            })
        }
    }
    if(req.session.currentfolder == -1) {
        res.redirect("/decks");
    } else {
        res.redirect("/decks/" + req.session.currentfolder);
    }
})

app.post('/folderedit', (req, res) => {
    db.setDeckInfo(req.session.userid, req.session.editing, req.body.folderName, "");
    if(req.session.currentfolder == -1) {
        res.redirect("/decks");
    } else {
        res.redirect("/decks/" + req.session.currentfolder);
    }
})

app.post('/settingsUpdate', (req, res) => {
    var passToCheck = req.body.currPass;
    var newUser = req.body.newUser;
    var newPass = req.body.newPass;
    var actualPassword;
    var newUserValid = false; // Validates both the user and password
    var newPassValid = false;
    var userCallback = (valid) => { newUserValid = valid }
    var passCallback = (valid) => { newPassValid = valid }

    if((newUser == "") && (newPass == "")) {
        res.render(__dirname + "/pages/settings.ejs", {errMsg:"You need to change at least the username or the password!",successMsg:""});
        return;
    }

    if(newUser != "") {
        newUserValid = db.validate("@.", newUser, "Aa1_aaaa", userCallback);
    }
    if(newPass != "") {
        newPassValid = db.validate("@.", "a", newPass, passCallback);
    }
    
    if((newUser != "" && !newUserValid) || (newPass != "" && !newPassValid)) {
        res.render(__dirname + "/pages/settings.ejs", {errMsg:"User or password invalid. Make sure password meets requirements.",successMsg:""});
        return;
    }

    var userCheck = (valid) => { // Checks if the new username hasn't been taken already.
        if(!valid) {
            res.render(__dirname + "/pages/settings.ejs", {errMsg:"Username already taken - try again.",successMsg:""});
            return;
        }
        db.setUsername(req.session.userid, newUser);
        res.render(__dirname + "/pages/settings.ejs", {errMsg:"",successMsg:"Successfully updated info!"});
    }

    var checkPass = (valid) => { // Checks if entered password matches current password.
        if(!valid) {
            res.render(__dirname + "/pages/settings.ejs", {errMsg:"Server side retrieval error - try again.",successMsg:""});
            return;
        } // valid returns the first user found in format {userID, password}
        bcrypt.compare(passToCheck, valid.password, function(err, result) {
            if(err) { // if hash for whatever reason doesn't work
                console.log("Error while comparing hashes")
                console.log(err)
                res.render(__dirname + "/pages/settings.ejs", {errMsg:"Server side hashing error. Please try again.",successMsg:""});
                return;
            }
            if(!result) {
                res.render(__dirname + "/pages/settings.ejs", {errMsg:"Wrong password. Please try again.",successMsg:""});
                return;
            }

            // If the new password field has a value, hash + update
            if(newPass != "") {
                bcrypt.hash(newPass, 10, function (err,hash) {
                    if(err) { // if hash for whatever reason doesn't work
                        console.log("Error while hashing password")
                        console.log(err)
                        res.render(__dirname + "/pages/settings.ejs", {errMsg:"Server side hashing error. Please try again.",successMsg:""});
                        return;
                    }
                    db.setPass(req.session.userid, hash);
                })
            }

            if(newUser != "") {
                db.checkUserAvailable(newUser, userCheck);
            } else {
                res.render(__dirname + "/pages/settings.ejs", {errMsg:"",successMsg:"Successfully updated info!"});
            }

        })
    }

    db.getPassFromID(req.session.userid, checkPass);
})


app.post('/editRatings', (req, res) => {
    var ratings = req.body.ratings.split(","); //splits string by , to get an array
    var ratingsLength = (ratings.length)/2; //gets length of array and halves to find pairs
    for(i=0; i<ratings.length; i+=2) { //loops from 0 until length of array, + 2 each time
        var cardID = ratings[i];
        var cardRating = ratings[i+1];
        db.setCardRating(req.session.userid, cardID, cardRating);
    }
    res.redirect("/")
})

app.get('/decks/:deckID?', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    var storeFolderName = (name) => {
        req.session.foldername = name.name;
        req.session.save()
    }
    var renderDecks = (decks) => {
        res.render(__dirname + "/pages/decks.ejs", {deckList: decks});
        if(req.params.deckID == undefined) {
            req.session.foldername = "Root";
            req.session.save()
        } else {
            db.getDeckInfoFromID(req.session.userid, req.params.deckID, storeFolderName);
        }
    }
    var deckID = req.params.deckID;
    if(deckID == undefined) deckID = -1;
    req.session.currentfolder = deckID;
    db.getDecksFromID(req.session.userid, deckID, renderDecks);
})

app.get('/createDeck/:deckName', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    db.createNewDeck(req.session.userid, req.params.deckName, "", false, req.session.currentfolder);
    res.redirect("back")
})

app.get('/createFolder/:folderName', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    db.createNewDeck(req.session.userid, req.params.folderName, "", true, req.session.currentfolder);
    res.redirect("back")
})

app.get('/signout', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    req.session.destroy();
    res.redirect("/")
})

app.get('/editDeck/:deckID', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    req.session.editing = req.params.deckID;
    var deckName;
    var deckDesc;
    var renderCardsList = (cards) => {
        res.render(__dirname + "/pages/deckedit.ejs", {cardsList: cards, folderName: req.session.foldername, deckName: deckName, deckDesc: deckDesc});
    }
    var retrieveDeckInfo = (info) => {
        deckName = info.name;
        deckDesc = info.description;
        db.getCardsFromID(req.session.userid, req.params.deckID, renderCardsList);
    }
    db.getDeckInfoFromID(req.session.userid, req.params.deckID, retrieveDeckInfo);
})

app.get('/editFolder/:folderID', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    req.session.editing = req.params.folderID;
    var folderName;
    var retrieveFolderInfo = (info) => {
        folderName = info.name;
        res.render(__dirname + "/pages/folderedit.ejs", {folderName: folderName});
    }
    db.getDeckInfoFromID(req.session.userid, req.params.folderID, retrieveFolderInfo);
})

app.get('/study/:deckID', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    res.render(__dirname + "/pages/deckoptions.ejs", {deckid: req.params.deckID});
})

app.get('/studyNormal/:deckID', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    var renderCards = (cards) => {
        var size = cards.length;
        var cardsArr = [];
        for(var i = 0; i < size; i++) {
            var card = [];
            card.push(cards[i].cardID, cards[i].front, cards[i].back, cards[i].rating);
            cardsArr.push(card);
        }
        cardsArr = arrayShuffle(cardsArr);
        // 0 = normal    1 = spaced
        res.render(__dirname + "/pages/deckstudy.ejs", {cards: cardsArr, size: size, type: 0});
    }
    
    db.getCardsFromID(req.session.userid, req.params.deckID, renderCards);
})

app.get('/studySpaced/:deckID', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    var renderCards = (cards) => {
        var size = cards.length;
        var cardsArr = [];
        for(var i = 0; i < size; i++) {
            var card = [];
            card.push(cards[i].cardID, cards[i].front, cards[i].back, cards[i].rating);
            cardsArr.push(card);
        }
        // 0 = normal    1 = spaced
        res.render(__dirname + "/pages/deckstudy.ejs", {cards: cardsArr, size: size, type: 1});
    }
    
    db.getCardsFromID(req.session.userid, req.params.deckID, renderCards);
})

app.get('/deleteDeck/:deckID', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    db.deleteDeckFromID(req.session.userid, req.params.deckID);
    res.redirect("back")
})

app.get('/stats', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    res.send("Statistics page");
})

app.get('/instructions', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    res.sendFile(__dirname + "/pages/instructions.html");
})

app.get('/settings', (req, res) => {
    if(!req.session.userid) {
        res.redirect("/")
        return;
    }
    res.render(__dirname + "/pages/settings.ejs", {errMsg:"",successMsg:""});
})

// Starts up the website on the specified port
app.listen(port, () => {
    console.log(`Website is live on port ${port}`) // lets us know in the console when website is live
})
