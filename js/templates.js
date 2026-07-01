/*
==========================================
M-PESA Message Generator
templates.js
==========================================
*/

"use strict";

/* ==========================================
   GENERATE TEMPLATE
========================================== */

function generateTemplate(data){

    switch(data.type){

        case "send":

            return sendMoneyTemplate(data);

        case "pochi":

            return pochiTemplate(data);

        case "buygoods":

            return buyGoodsTemplate(data);

        default:

            return "";

    }

}

/* ==========================================
   SEND MONEY
========================================== */

function sendMoneyTemplate(data){

    return `${data.code} Confirmed.

Ksh${formatMoney(data.amount)} sent to ${data.recipient} ${data.phone} on ${data.date} at ${data.time}.

New M-PESA balance is Ksh${formatMoney(data.newBalance)}.

Transaction cost, Ksh${formatMoney(data.transactionCost)}.

Amount you can transact within the day is Ksh${calculateRemainingLimit(data.amount)}.

Download My OneApp on https://saf.cx/kWQpy`;

}

/* ==========================================
   POCHI LA BIASHARA
========================================== */

function pochiTemplate(data){

    return `${data.code} Confirmed.

Ksh${formatMoney(data.amount)} sent to ${data.business} Pochi la Biashara on ${data.date} at ${data.time}.

New M-PESA balance is Ksh${formatMoney(data.newBalance)}.

Transaction cost, Ksh${formatMoney(data.transactionCost)}.

Amount you can transact within the day is Ksh${calculateRemainingLimit(data.amount)}.

Download My OneApp on https://saf.cx/kWQpy`;

}

/* ==========================================
   BUY GOODS
========================================== */

function buyGoodsTemplate(data){

    return `${data.code} Confirmed.

Ksh${formatMoney(data.amount)} paid to ${data.business} Till ${data.tillNumber} on ${data.date} at ${data.time}.

New M-PESA balance is Ksh${formatMoney(data.newBalance)}.

Transaction cost, Ksh0.00.

Amount you can transact within the day is Ksh${calculateRemainingLimit(data.amount)}.

Download My OneApp on https://saf.cx/kWQpy`;

}

/* ==========================================
   CONVERSATION MESSAGE
========================================== */

function buildConversation(message,time){

    return {

        sender:"MPESA",

        body:message,

        timestamp:`Today, ${time}`,

        preview:"Tap to load preview",

        footer:"Sender can't accept replies. Contact them directly. Learn more"

    };

}

console.log("Templates initialized.");
