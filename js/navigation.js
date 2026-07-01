/*
==========================================
M-PESA Message Generator
navigation.js
==========================================
*/

"use strict";

/* ==========================================
   PAGES
========================================== */

const pages = {

    home: document.getElementById("homePage"),

    generator: document.getElementById("generatorPage"),

    conversation: document.getElementById("chatPage"),

    settings: document.getElementById("settingsPage")

};

/* ==========================================
   INITIALIZE
========================================== */

function initializeNavigation(){

    registerHomeButtons();

    registerBackButtons();

}

/* ==========================================
   SHOW PAGE
========================================== */

function showPage(pageName){

    Object.values(pages).forEach(page=>{

        if(page){

            page.classList.remove("active");

        }

    });

    if(pages[pageName]){

        pages[pageName].classList.add("active");

        setCurrentPage(pageName);

    }

}

/* ==========================================
   HOME BUTTONS
========================================== */

function registerHomeButtons(){

    const sendMoney=document.getElementById("sendMoney");

    const pochi=document.getElementById("pochi");

    const buyGoods=document.getElementById("buyGoods");

    const settings=document.getElementById("openSettings");

    if(sendMoney){

        sendMoney.addEventListener("click",()=>{

            openGenerator("send");

        });

    }

    if(pochi){

        pochi.addEventListener("click",()=>{

            openGenerator("pochi");

        });

    }

    if(buyGoods){

        buyGoods.addEventListener("click",()=>{

            openGenerator("buygoods");

        });

    }

    if(settings){

        settings.addEventListener("click",openSettings);

    }

}

/* ==========================================
   BACK BUTTONS
========================================== */

function registerBackButtons(){

    document.querySelectorAll("[data-back]").forEach(button=>{

        button.addEventListener("click",goBack);

    });

}

/* ==========================================
   OPEN GENERATOR
========================================== */

function openGenerator(type){

    setTransactionType(type);

    configureGenerator(type);

    showPage("generator");

}

/* ==========================================
   OPEN CHAT
========================================== */

function openConversation(){

    showPage("conversation");

}

/* ==========================================
   OPEN SETTINGS
========================================== */

function openSettings(){

    showPage("settings");

}

/* ==========================================
   OPEN HOME
========================================== */

function openHome(){

    showPage("home");

}

/* ==========================================
   BACK
========================================== */

function goBack(){

    switch(getCurrentPage()){

        case "generator":

            openHome();

            break;

        case "conversation":

            openGenerator(

                getTransactionType()

            );

            break;

        case "settings":

            openHome();

            break;

        default:

            openHome();

    }

}

/* ==========================================
   ESC KEY
========================================== */

document.addEventListener(

    "keydown",

    function(event){

        if(event.key==="Escape"){

            goBack();

        }

    }

);

/* ==========================================
   ANIMATION
========================================== */

function animatePage(page){

    if(!page){

        return;

    }

    page.classList.remove("fade-in");

    void page.offsetWidth;

    page.classList.add("fade-in");

}

/* ==========================================
   OVERRIDE SHOW PAGE
========================================== */

const originalShowPage=showPage;

showPage=function(pageName){

    originalShowPage(pageName);

    animatePage(

        pages[pageName]

    );

};

console.log("Navigation initialized.");
