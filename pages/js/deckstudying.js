var currCard = 0; //what index we are currently at
var side = 0; //0=front 1=back
var cardText = document.getElementById("cardText"); //get the actual card text
var ratingBtns = document.getElementById("ratingButtons"); //rating buttons
var promptText = document.getElementById("promptText"); //"click the card" text
var cardDisplay = document.getElementById("cardDisplay"); //card display
var results = document.getElementById("results"); //results
var cardsList = document.getElementById("cardsList"); //results showing card list text
var ratingsInput = document.getElementById("ratings"); //get card ratings update input box
var ratingsUpdate = [];
var spacedResultFlag = false;

function randomChance(chance) {
    chance = chance.toFixed(2); // turns into 2dp
    rand = Math.random().toFixed(2); // 0-1 random num 2dp
    if(rand < chance) {
        return true;
    } else {
        return false;
    }
}


// if it's spaced repetition, check through the cards
if(type == 1) {
    var newCards = [];
    // y = e^(-x/1.7)
    cards.forEach((card, i) => {
        var cardRating = card[3];
        if(cardRating > 0) { // only do this if card rating is more than 0
            var chance = Math.pow(Math.E, -1 * (cardRating/1.7));
            if(randomChance(chance)) { //if it doesn't succeed with the chance
                newCards.push(cards[i]);
            }
        } else {
            newCards.push(cards[i]);
        }
    })
    cards = newCards;
    if(cards.length == 0) {
        cardDisplay.hidden = true;
        ratingBtns.hidden = true;
        results.hidden = false;
        promptText.hidden = true;
        spacedResultFlag = true; //gives appropriate message at the end
        showResultsCard();
    }
}

//                  0     1      2      3
// cards array has [id, front, back, rating]
// Initially set the card to the front
cardText.innerHTML = cards[currCard][1];
ratingBtns.hidden = true;
promptText.hidden = false;


function cardFlip() {
    // if side is front, go to back
    if(side == 0) {
        cardText.innerHTML = cards[currCard][2];
        ratingBtns.hidden = false;
        promptText.hidden = true;
        side = 1;
    }
}

// 1 not at all - 3 very
function rating(num) {
    // rating update
    var ratingToUpdate = 0;
    var newRating = [];
    if(num == 1) {
        ratingToUpdate = -1;
    } else if(num == 3) {
        ratingToUpdate = 1;
    }
    newRating.push(cards[currCard][0]);
    newRating.push(cards[currCard][3] + ratingToUpdate);
    ratingsUpdate.push(newRating);
    // card update
    side = 0;
    currCard += 1;
    if(currCard > (cards.length-1)) {
        cardDisplay.hidden = true;
        ratingBtns.hidden = true;
        results.hidden = false;
        showResultsCard();
    } else {
        cardText.innerHTML = cards[currCard][1];
        ratingBtns.hidden = true;
        promptText.hidden = false;
    }

}

function showResultsCard() {
    var cardsToShow = [] // collects card IDs to show
    var cardFronts = []
    if(cards.length != 0) {
        ratingsUpdate.forEach((card, i) => { // checks ratings of ratings update array
            if(card[1] < 0) { // if they clicked "not at all", chooses it to be shown for improvement
                cardsToShow.push(card[0]);
            }
        })
        cards.forEach((card, i) => {
            // loops through all cards. If card ID is in cardsToShow, append to cardFronts to retrieve card front
            if(cardsToShow.includes(card[0])) {
                cardFronts.push(card[1]);
            }
        })
    }   
    var final = "" // contains final text to put in the <p> tag showing cards to improve
    cardFronts.forEach((front, i) => { //just appends the card front and <br> for new line
        final += front
        final += "<br>"
    })
    if(final == "") {
        if(spacedResultFlag) {
            final = "<b>You are seeing this because you know your cards too well. Try again tomorrow!</b>"
        } else {
            final = "<b>None for now! Keep it up</b>"
        }
    }
    cardsList.innerHTML = final; // show this in results <p> tag
    ratingsInput.value = ratingsUpdate;
}