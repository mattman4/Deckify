var cards = document.getElementById("cardsContainer");
var card = document.getElementById("cardToCopy");
var deletionsInput = document.getElementById("deletions");
var cardNo = 1;
var deletions = [];

function del(cardNo) {
    document.getElementById(cardNo).parentNode.removeChild(document.getElementById(cardNo));
    if(cardNo.startsWith("e")) {
        deletions.push(cardNo.slice(1)); // removes the e part.
        deletionsInput.value = deletions;
    }
}

function createCard() {
    var newCard = card.cloneNode(true);
    newCard.removeAttribute("hidden");
    newCard.removeAttribute("id");
    newCard.setAttribute("id", "n" + cardNo);
    newCard.getElementsByTagName("h4")[0].innerHTML = "[NEW] Card " + cardNo
    newCard.getElementsByTagName("input")[0].setAttribute("name", "n" + cardNo);
    newCard.getElementsByTagName("input")[1].setAttribute("name", "n" + cardNo);
    newCard.getElementsByTagName("button")[0].setAttribute("name", "n" + cardNo);
    newCard.getElementsByTagName("button")[0].setAttribute("onclick", "del(\"n" + cardNo + "\")");
    cards.appendChild(newCard);
    cardNo += 1;
}