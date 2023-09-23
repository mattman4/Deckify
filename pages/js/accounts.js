function validateSignUp() {
    // gets the inputs for the form
    var email = document.getElementById("emailInput").value;
    var username = document.getElementById("userInput").value;
    var password = document.getElementById("passInput").value;

    if(email.length <= 0 || username.length <= 0 || password.length <= 0) {
        makeError("One or more fields are blank")
        return false;
    }
    //Email validation
    if(email.indexOf("@") == -1 || email.indexOf(".") == -1) {
        makeError("Email must contain @ and a .")
        return false; 
    }
    // Password validation
    if(password.length < 8) { // checks if it's under 8 characters 
        makeError("Password must contain at least 8 characters")
        return false;
    }
    if(password.search(/\d/) == -1) { //checks if no numbers
        makeError("Password must contain at least 1 number")
        return false;
    }
    if(password.search(/[a-z]/) == -1) { //checks if no lower case
        makeError("Password must contain at least 1 lower case letter")
        return false;
    }
    if(password.search(/[A-Z]/) == -1) { //checks if no upper case
        makeError("Password must contain at least 1 upper case letter")
        return false;
    }
    if(password.search(/[^A-Za-z0-9]/) == -1) { //checks if no special characters
        makeError("Password must contain at least 1 special character")
        return false;
    }
    // Username validation
    if(username.search(/[^A-Za-z0-9]/) != -1) { //checks if special characters
        makeError("Username cannot contain special characters")
        return false;
    }


    makeError("reset");
    return true;
}

function makeError(err, color = "alert-danger", appendErr = true) {
    var errDiv = document.getElementById("errors"); //gets div to append errors to
    var error = document.createElement("div");

    errDiv.innerHTML = ""; //clears existing errors
    if(err == "reset") return; //if the err parameter is reset, dont add the error

    error.classList.add("alert");
    error.classList.add(color);
    if(appendErr) error.innerHTML = "<b>Error: </b>";
    error.innerHTML += err;

    errDiv.appendChild(error); //appends error to div
}