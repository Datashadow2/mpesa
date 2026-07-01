/* ==========================================
   MPESA Message Generator
   generator.js
   Part 1
   ========================================== */

"use strict";

/* ==========================================
   FORM ELEMENTS
   ========================================== */

const Generator={

    form:null,

    recipient:null,

    phone:null,

    amount:null,

    balance:null,

    business:null,

    tillNumber:null,

    generateButton:null

};

/* ==========================================
   CURRENT TRANSACTION
   ========================================== */

let currentTransaction={

    type:"",

    recipient:"",

    phone:"",

    business:"",

    tillNumber:"",

    amount:0,

    balance:0,

    transactionCost:0,

    newBalance:0,

    code:"",

    date:"",

    time:""

};

/* ==========================================
   INITIALIZE
   ========================================== */

function setupGenerator(){

    Generator.form=document.getElementById("generatorForm");

    Generator.recipient=document.getElementById("recipient");

    Generator.phone=document.getElementById("phone");

    Generator.business=document.getElementById("business");

    Generator.tillNumber=document.getElementById("tillNumber");

    Generator.amount=document.getElementById("amount");

    Generator.balance=document.getElementById("balance");

    Generator.generateButton=document.getElementById("generateButton");

    if(Generator.generateButton){

        Generator.generateButton.addEventListener(

            "click",

            generateTransaction

        );

    }

}

/* ==========================================
   GENERATE
   ========================================== */

function generateTransaction(){

    if(!validateForm()){

        return;

    }

    readForm();

    currentTransaction.code=createTransactionCode();

    currentTransaction.transactionCost=

        calculateTransactionCost(

            currentTransaction.amount,

            currentTransaction.type

        );

    currentTransaction.newBalance=

        calculateBalance();

    const date=new Date();

    currentTransaction.date=formatDate(date);

    currentTransaction.time=formatTime(date);

    const sms=generateSMS();

    saveGeneratedMessage(sms);

    displayConversation(sms);

    openConversation();

}

/* ==========================================
   READ FORM
   ========================================== */

function readForm(){

    currentTransaction.type=

        App.transactionType;

    currentTransaction.recipient=

        Generator.recipient ?

        Generator.recipient.value.trim() : "";

    currentTransaction.phone=

        Generator.phone ?

        Generator.phone.value.trim() : "";

    currentTransaction.business=

        Generator.business ?

        Generator.business.value.trim() : "";

    currentTransaction.tillNumber=

        Generator.tillNumber ?

        Generator.tillNumber.value.trim() : "";

    currentTransaction.amount=

        Number(

            Generator.amount.value

        );

    currentTransaction.balance=

        Number(

            Generator.balance.value

        );

}

/* ==========================================
   BALANCE
   ========================================== */

function calculateBalance(){

    return (

        currentTransaction.balance

        -

        currentTransaction.amount

        -

        currentTransaction.transactionCost

    );

}

/* ==========================================
   DISPLAY
   ========================================== */

function displayConversation(message){

    const container=

        document.getElementById(

            "generatedMessage"

        );

    if(!container){

        return;

    }

    container.innerHTML=`

<div class="mpesaLabel">

MPESA

</div>

<div class="sms-bubble message-enter">

${message}

</div>

<div class="timestamp">

Today,

${currentTransaction.time}

</div>

<div class="preview">

<div class="previewIcon">

🔗

</div>

<div>

Tap to load preview

</div>

</div>

<div class="replyNotice">

Sender can't accept replies.

Contact them directly.

<a href="#">

Learn more

</a>

</div>

`;

}

console.log("Generator Loaded");
