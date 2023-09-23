function createDeck() {
    var name = prompt("Name this deck:")
    if(name == null || name.trim() == "") return;
    window.location.pathname = "/createDeck/" + name.trim()
}

function createFolder() {
    var name = prompt("Name this folder:")
    if(name == null || name.trim() == "") return;
    window.location.pathname = "/createFolder/" + name.trim()
}

function confirmDelete(id) {
    var response = confirm("Are you sure you want to delete this?")
    if(response == true) {
        window.location.pathname = "/deleteDeck/" + id
    }
}