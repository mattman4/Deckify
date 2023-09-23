const mysql = require("mysql");

class Util {

    constructor(host, user, pass, database) {
        this.host = host;
        this.user = user;
        this.pass = pass;
        this.database = database;
    }

    connectToDB() {

        this.con = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.pass,
            database: this.database
        });

        this.con.connect((err) => {
            if(err) {
                console.log("Error while connecting to Database")
                console.log(err)
                process.exit()
            } else {
                console.log("Successfully connected to database!")
            }
        });
    }

    createNewUser(email, pass, user) {
        var sql = "INSERT INTO accounts (email, password, username) VALUES ('" + email + "', '" + pass + "', '" + user + "')"
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while inserting user")
                console.log(err)
                return false;
            } else {
                console.log("Successfully added user!")
                return true;
            }
        })
    }

    checkUserAvailable(user, callback) {
        var sql = "SELECT userID FROM accounts WHERE username = '" + user + "'"
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while checking user availability")
                console.log(err)
                callback(false);
            } else {
                var found = result.length;
                if(found > 0) {
                    console.log("User already exists")
                    callback(false);
                } else {
                    console.log("User doesn't exists")
                    callback(true);
                }
            }
        })
    }

    getPassFromUsername(username, callback) {
        var sql = "SELECT userID,password FROM accounts WHERE username = '" + username + "'"
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while retrieving password")
                console.log(err)
                callback(false);
            } else {
                console.log("Successfully retrieved password!")
                callback(result[0]);
            }
        })
    }

    getPassFromID(userID, callback) {
        var sql = "SELECT userID,password FROM accounts WHERE userID = " + userID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while retrieving password")
                console.log(err)
                callback(false);
            } else {
                console.log("Successfully retrieved password!")
                callback(result[0]);
            }
        })
    }

    setEmail(userID, email) {
        var sql = "UPDATE accounts SET email = '" + email + "' WHERE userID = " + userID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while updating email")
                console.log(err)
                return false;
            } else {
                console.log("Successfully updated email!")
                return true;
            }
        })
    }

    setPass(userID, password) {
        var sql = "UPDATE accounts SET password = '" + password + "' WHERE userID = " + userID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while updating password")
                console.log(err)
                return false;
            } else {
                console.log("Successfully updated password!")
                return true;
            }
        })
    }

    setUsername(userID, username) {
        var sql = "UPDATE accounts SET username = '" + username + "' WHERE userID = " + userID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while updating username")
                console.log(err)
                return false;
            } else {
                console.log("Successfully updated username!")
                return true;
            }
        })
    }

    createNewCard(userID, deckID, front, back, rating) {
        var sql = "INSERT INTO cards (userID, deckID, front, back, rating) VALUES (" + userID + ", " + deckID + ", '" + front + "', '" + back + "', " + rating + ")" 
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while inserting card")
                console.log(err)
                return false;
            } else {
                console.log("Successfully added card!")
                return true;
            }
        })
    }

    setCardInfo(userID, cardID, front, back) {
        var sql = "UPDATE cards SET front = '" + front + "', back = '" + back + "' WHERE userID = " + userID + " AND cardID = " + cardID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while updating card info")
                console.log(err)
                return false;
            } else {
                console.log("Successfully updated card!")
                return true;
            }
        })
    }

    setCardRating(userID, cardID, rating) {
        var sql = "UPDATE cards SET rating = " + rating + " WHERE userID = " + userID + " AND cardID = " + cardID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while updating card rating")
                console.log(err)
                return false;
            } else {
                console.log("Successfully updated card rating!")
                return true;
            }
        })
    }

    createNewDeck(userID, name, description, isFolder, parentDeckID) {
        if(isFolder == true) isFolder = 1;
        if(isFolder == false) isFolder = 0;
        if(parentDeckID == null || parentDeckID == -1) parentDeckID = "NULL";
        var sql = "INSERT INTO decks (userID, name, description, isFolder, parentDeckID) VALUES (" + userID + ", '" + name + "', '" + description + "', '" + isFolder + "', " + parentDeckID + ")" 
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while inserting deck")
                console.log(err)
                return false;
            } else {
                console.log("Successfully added deck!")
                return true;
            }
        })
    }

    setDeckInfo(userID, deckID, name, description) {
        var sql = "UPDATE decks SET name = '" + name + "', description = '" + description + "' WHERE userID = " + userID + " AND deckID = " + deckID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while updating deck info")
                console.log(err)
                return false;
            } else {
                console.log("Successfully updated deck!")
                return true;
            }
        })
    }

    getDecksFromID(userID, parentID, callback) {
        if(parentID == -1) {
            var sql = "SELECT decks.isFolder,decks.name,decks.deckID,count(cards.deckID) as deckSize,(SELECT count(*) FROM decks d2 WHERE d2.parentDeckID = decks.deckID) as folderSize FROM decks LEFT JOIN cards ON (decks.deckID = cards.deckID) WHERE decks.userID = " + userID + " AND decks.parentDeckID IS NULL GROUP BY decks.deckID ORDER BY decks.isFolder DESC, decks.name ASC;"
        } else {
            var sql = "SELECT decks.isFolder,decks.name,decks.deckID,count(cards.deckID) as deckSize,(SELECT count(*) FROM decks d2 WHERE d2.parentDeckID = decks.deckID) as folderSize FROM decks LEFT JOIN cards ON (decks.deckID = cards.deckID) WHERE decks.userID = " + userID + " AND decks.parentDeckID = " + parentID + " GROUP BY decks.deckID ORDER BY decks.isFolder DESC, decks.name ASC;"
        }
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while searching decks")
                console.log(err)
                callback(false);
            } else {
                console.log("Successfully retrieved decks!")
                callback(result);
            }
        })
    }

    getDeckInfoFromID(userID, deckID, callback) {
        var sql = "SELECT name,description FROM decks WHERE userID = " + userID + " AND deckID = " + deckID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while searching deck info")
                console.log(err)
                callback(false);
            } else {
                console.log("Successfully retrieved deck info!")
                callback(result[0]);
            }
        })
    }

    getCardsFromID(userID, deckID, callback) {
        var sql = "SELECT cardID,front,back,rating FROM cards WHERE userID = " + userID + " AND deckID = " + deckID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while searching cards")
                console.log(err)
                callback(false);
            } else {
                console.log("Successfully retrieved cards!")
                callback(result);
            }
        })
    }

    deleteCardFromID(userID, cardID) {
        var sql = "DELETE FROM cards WHERE userID = " + userID + " AND cardID = " + cardID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while deleting card")
                console.log(err)
                return false;
            } else {
                console.log("Successfully deleted card!")
                return true;
            }
        })  
    }

    deleteDeckFromID(userID, deckID) {
        var sql = "DELETE FROM decks WHERE userID = " + userID + " AND deckID = " + deckID
        this.con.query(sql, (err, result) => {
            if(err) {
                console.log("Error while deleting deck")
                console.log(err)
                return false;
            } else {
                console.log("Successfully deleted deck!")
                return true;
            }
        })  
    }

    validate(email, username, password, callback) {
        // Blank field test
        if(email.length <= 0 || username.length <= 0 || password.length <= 0) {
            return false;
        }
        //Email validation
        else if(email.indexOf("@") == -1 || email.indexOf(".") == -1) {
            return false; 
        }
        // Password validation
        else if(password.length < 8) { // checks if it's under 8 characters 
            return false;
        }
        else if(password.search(/\d/) == -1) { //checks if no numbers
            return false;
        }
        else if(password.search(/[a-z]/) == -1) { //checks if no lower case
            return false;
        }
        else if(password.search(/[A-Z]/) == -1) { //checks if no upper case
            return false;
        }
        else if(password.search(/[^A-Za-z0-9]/) == -1) { //checks if no special characters
            return false;
        }
        // Username validation
        if(username.search(/[^A-Za-z0-9]/) != -1) { //checks if special characters
            return false;
        }

        return true;
    }





}


module.exports = {Util};
