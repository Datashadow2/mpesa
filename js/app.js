/* ==========================================
   MPESA Message Generator
   app.js
   ========================================== */

"use strict";

/* ==========================================
   APPLICATION
   ========================================== */

const App = {

    currentPage: "home",

    transactionType: null,

    generatedMessage: "",

    settings: {

        defaultBalance: 0,

        rememberValues: true

    }

};

/* ==========================================
   DOM ELEMENTS
   ========================================== */

const Pages = {

    home: document.getElementById("homePage"),

    generator: document.getElementById("generatorPage"),

    conversation: document.getElementById("chatPage"),

    settings: document.getElementById("settingsPage")

};

const Buttons = {

    sendMoney: document.getElementById("sendMoney"),

    pochi: document.getElementById("pochi"),

    buyGoods: document.getElementById("buyGoods"),

    settings: document.getElementById("openSettings"),

    generate: document.getElementById("generateButton")

};

/* ==========================================
   START
   ========================================== */

document.addEventListener("DOMContentLoaded", initializeApp);

/* ==========================================
   INITIALIZE
   ========================================== */

function initializeApp(){

    loadSettings();

    setupNavigation();

    setupGenerator();

    setupSettings();

    showPage("home");

}

/* ==========================================
   PAGE HANDLER
   ========================================== */

function showPage(page){

    Object.values(Pages).forEach(pageElement=>{

        if(pageElement){

            pageElement.classList.remove("active");

        }

    });

    if(Pages[page]){

        Pages[page].classList.add("active");

        App.currentPage=page;

    }

}

/* ==========================================
   TRANSACTION
   ========================================== */

function selectTransaction(type){

    App.transactionType=type;

    showPage("generator");

    loadGenerator(type);

}

/* ==========================================
   MESSAGE
   ========================================== */

function saveGeneratedMessage(message){

    App.generatedMessage=message;

}

/* ==========================================
   GET MESSAGE
   ========================================== */

function getGeneratedMessage(){

    return App.generatedMessage;

}

/* ==========================================
   SETTINGS
   ========================================== */

function setSetting(key,value){

    App.settings[key]=value;

}

function getSetting(key){

    return App.settings[key];

}

/* ==========================================
   APP READY
   ========================================== */

console.log("MPESA Generator Loaded");
