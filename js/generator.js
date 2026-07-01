/*
==========================================
M-PESA Message Generator
generator.js
==========================================
*/

"use strict";

/* ==========================================
   CONVERSATION
========================================== */

const conversation=[];

/* ==========================================
   INITIALIZE
========================================== */

function initializeGenerator(){

    const button=document.getElementById(

        "generateButton"

    );

    if(button){

        button.addEventListener(

            "click",

            generateTransaction

        );

    }

}

/* ==========================================
   CONFIGURE FORM
========================================== */

function configureGenerator(type){

    showField("recipientField",false);

    showField("phoneField",false);

    showField("businessField",false);

    showField("tillNumberField",false);

    switch(type){

        case "send":

            showField("recipientField",true);

            showField("phoneField",true);

            setTitle("Send Money");

            break;

        case "pochi":

            showField("businessField",true);

            setTitle("Pochi la Biashara");

            break;

        case "buygoods":

            showField("businessField",true);

            showField("tillNumberField",true);

            setTitle("Buy Goods & Services");

            break;

    }

    clearForm();

}

/* ==========================================
   GENERATE
========================================== */

function generateTransaction(){

    const data=readForm();

    if(!validateForm(data)){

        return;

    }

    data.code=

        generateTransactionCode();

    data.date=

        formatDate(

            new Date()

        );

    data.time=

        formatTime(

            new Date()

        );

    data.transactionCost=

        calculateTransactionCost(

            data.amount,

            data.type

        );

    data.newBalance=

        calculateBalance(

            data.balance,

            data.amount,

            data.transactionCost

        );

    const sms=

        generateTemplate(data);

    const message=

        buildConversation(

            sms,

            data.time

        );

    conversation.push(

        message

    );

    setGeneratedMessage(

        sms

    );

    renderConversation();

    openConversation();

}

/* ==========================================
   READ FORM
========================================== */

function readForm(){

    return{

        type:getTransactionType(),

        recipient:getValue("recipient"),

        phone:getValue("phone"),

        business:getValue("business"),

        tillNumber:getValue("tillNumber"),

        amount:Number(

            getValue("amount")

        ),

        balance:Number(

            getValue("balance")

        )

    };

}

/* ==========================================
   RENDER
========================================== */

function renderConversation(){

    const container=document.getElementById(

        "generatedMessage"

    );

    if(!container){

        return;

    }

    container.innerHTML="";

    conversation.forEach(message=>{

        const bubble=document.createElement(

            "div"

        );

        bubble.className=

            "conversation-item";

        bubble.innerHTML=`

<div class="mpesaLabel">

${message.sender}

</div>

<div class="sms-bubble">

${message.body.replace(/\n/g,"<br>")}

</div>

<div class="timestamp">

${message.timestamp}

</div>

<div class="preview">

Tap to load preview

</div>

<div class="replyNotice">

Sender can't accept replies.

Contact them directly.

<a href="#">

Learn more

</a>

</div>

`;

        container.appendChild(

            bubble

        );

    });

}

/* ==========================================
   FIELD
========================================== */

function showField(id,show){

    const field=document.getElementById(id);

    if(field){

        field.style.display=

            show

            ? "flex"

            : "none";

    }

}

/* ==========================================
   TITLE
========================================== */

function setTitle(text){

    const title=document.getElementById(

        "generatorTitle"

    );

    if(title){

        title.textContent=text;

    }

}

/* ==========================================
   CLEAR
========================================== */

function clearForm(){

    document

        .querySelectorAll(

            "#generatorForm input"

        )

        .forEach(input=>{

            if(

                input.id!=="balance"

            ){

                input.value="";

            }

        });

}

/* ==========================================
   VALUE
========================================== */

function getValue(id){

    const input=document.getElementById(id);

    return input

        ? input.value.trim()

        : "";

}

console.log(

    "Generator initialized."

);
