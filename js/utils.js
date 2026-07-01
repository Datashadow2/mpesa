/*
==========================================
M-PESA Message Generator
utils.js
==========================================
*/

"use strict";

/* ==========================================
   MONEY
========================================== */

function formatMoney(amount){

    return Number(amount).toLocaleString(

        "en-KE",

        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }

    );

}

/* ==========================================
   DATE
========================================== */

function formatDate(date){

    const day=String(

        date.getDate()

    ).padStart(2,"0");

    const month=String(

        date.getMonth()+1

    ).padStart(2,"0");

    const year=String(

        date.getFullYear()

    ).slice(-2);

    return `${day}/${month}/${year}`;

}

/* ==========================================
   TIME
========================================== */

function formatTime(date){

    let hour=date.getHours();

    const minute=String(

        date.getMinutes()

    ).padStart(2,"0");

    const period=

        hour>=12

        ? "PM"

        : "AM";

    hour=hour%12;

    if(hour===0){

        hour=12;

    }

    return `${hour}:${minute} ${period}`;

}

/* ==========================================
   TRANSACTION CODE
========================================== */

function generateTransactionCode(){

    const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const numbers="0123456789";

    let code="";

    for(let i=0;i<5;i++){

        code+=letters[

            Math.floor(

                Math.random()*letters.length

            )

        ];

    }

    code+=numbers[

        Math.floor(

            Math.random()*numbers.length

        )

    ];

    code+=letters[

        Math.floor(

            Math.random()*letters.length

        )

    ];

    code+=numbers[

        Math.floor(

            Math.random()*numbers.length

        )

    ];

    code+=numbers[

        Math.floor(

            Math.random()*numbers.length

        )

    ];

    code+=letters[

        Math.floor(

            Math.random()*letters.length

        )

    ];

    return code;

}

/* ==========================================
   TRANSACTION COST
   Editable tariff table
========================================== */

function calculateTransactionCost(amount,type){

    amount=Number(amount);

    if(type==="buygoods"){

        return 0;

    }

    const tariffs=[

        {max:49,cost:0},

        {max:100,cost:0},

        {max:500,cost:7},

        {max:1000,cost:13},

        {max:1500,cost:23},

        {max:2500,cost:33},

        {max:3500,cost:53},

        {max:5000,cost:57},

        {max:7500,cost:78},

        {max:10000,cost:90},

        {max:15000,cost:100},

        {max:20000,cost:105},

        {max:35000,cost:108},

        {max:50000,cost:108},

        {max:250000,cost:108}

    ];

    for(const tariff of tariffs){

        if(amount<=tariff.max){

            return tariff.cost;

        }

    }

    return 108;

}

/* ==========================================
   DAILY LIMIT
========================================== */

function calculateRemainingLimit(amount){

    return formatMoney(

        500000-Number(amount)

    );

}

/* ==========================================
   BALANCE
========================================== */

function calculateBalance(

    balance,

    amount,

    charge

){

    return (

        Number(balance)

        -

        Number(amount)

        -

        Number(charge)

    );

}

/* ==========================================
   RANDOM INTEGER
========================================== */

function random(min,max){

    return Math.floor(

        Math.random()*

        (max-min+1)

    )+min;

}

/* ==========================================
   CAPITALIZE
========================================== */

function capitalize(text){

    return text

        .toLowerCase()

        .replace(

            /\b\w/g,

            character=>character.toUpperCase()

        );

}

/* ==========================================
   PHONE
========================================== */

function normalizePhone(phone){

    phone=phone.replace(/\D/g,"");

    if(phone.startsWith("254")){

        phone="0"+phone.substring(3);

    }

    return phone;

}

/* ==========================================
   NUMBER
========================================== */

function isPositiveNumber(value){

    return !isNaN(value)

        &&

        Number(value)>0;

}

/* ==========================================
   TODAY LABEL
========================================== */

function todayLabel(){

    return "Today";

}

console.log("Utilities initialized.");
