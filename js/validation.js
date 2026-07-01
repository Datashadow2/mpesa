/*
==========================================
M-PESA Message Generator
validation.js
==========================================
*/

"use strict";

/* ==========================================
   INITIALIZE
========================================== */

function initializeValidation(){

    addLiveValidation();

}

/* ==========================================
   VALIDATE FORM
========================================== */

function validateForm(data){

    clearErrors();

    let valid=true;

    switch(data.type){

        case "send":

            if(!validateRecipient()) valid=false;
            if(!validatePhone()) valid=false;
            break;

        case "pochi":

            if(!validateBusiness()) valid=false;
            break;

        case "buygoods":

            if(!validateBusiness()) valid=false;
            if(!validateTill()) valid=false;
            break;

    }

    if(!validateAmount()) valid=false;

    if(!validateBalance()) valid=false;

    return valid;

}

/* ==========================================
   RECIPIENT
========================================== */

function validateRecipient(){

    const input=document.getElementById("recipient");

    if(!input.value.trim()){

        showError(

            input,

            "Recipient name is required."

        );

        return false;

    }

    return true;

}

/* ==========================================
   PHONE
========================================== */

function validatePhone(){

    const input=document.getElementById("phone");

    const phone=normalizePhone(

        input.value

    );

    if(phone.length!==10){

        showError(

            input,

            "Enter a valid phone number."

        );

        return false;

    }

    input.value=phone;

    return true;

}

/* ==========================================
   BUSINESS
========================================== */

function validateBusiness(){

    const input=document.getElementById("business");

    if(!input.value.trim()){

        showError(

            input,

            "Business name is required."

        );

        return false;

    }

    input.value=capitalize(

        input.value

    );

    return true;

}

/* ==========================================
   TILL
========================================== */

function validateTill(){

    const input=document.getElementById("tillNumber");

    if(!input.value.trim()){

        showError(

            input,

            "Till number is required."

        );

        return false;

    }

    return true;

}

/* ==========================================
   AMOUNT
========================================== */

function validateAmount(){

    const input=document.getElementById("amount");

    if(

        !isPositiveNumber(

            input.value

        )

    ){

        showError(

            input,

            "Invalid amount."

        );

        return false;

    }

    return true;

}

/* ==========================================
   BALANCE
========================================== */

function validateBalance(){

    const input=document.getElementById("balance");

    if(

        Number(input.value)<0 ||

        input.value===""

    ){

        showError(

            input,

            "Invalid balance."

        );

        return false;

    }

    return true;

}

/* ==========================================
   SHOW ERROR
========================================== */

function showError(input,message){

    input.classList.add(

        "invalid"

    );

    let error=input.parentElement.querySelector(

        ".error"

    );

    if(!error){

        error=document.createElement(

            "small"

        );

        error.className="error";

        input.parentElement.appendChild(

            error

        );

    }

    error.textContent=message;

}

/* ==========================================
   CLEAR ERRORS
========================================== */

function clearErrors(){

    document

        .querySelectorAll(".error")

        .forEach(

            error=>error.remove()

        );

    document

        .querySelectorAll(".invalid")

        .forEach(

            field=>field.classList.remove(

                "invalid"

            )

        );

}

/* ==========================================
   LIVE VALIDATION
========================================== */

function addLiveValidation(){

    document

        .querySelectorAll("input")

        .forEach(input=>{

            input.addEventListener(

                "input",

                clearErrors

            );

        });

}

console.log("Validation initialized.");
