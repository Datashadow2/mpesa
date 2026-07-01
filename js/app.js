/*
==========================================
M-PESA Message Generator
app.js
==========================================
*/

"use strict";

/* ==========================================
   APPLICATION STATE
========================================== */

const App = {

    page: "home",

    transactionType: null,

    message: "",

    settings: {

        defaultBalance: "",

        rememberBalance: true

    }

};

/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeApp

);

/* ==========================================
   START APPLICATION
========================================== */

function initializeApp(){

    initializeNavigation();

    initializeGenerator();

    initializeSettings();

    loadSettings();

    showPage("home");

}

/* ==========================================
   APPLICATION STATE
========================================== */

function setCurrentPage(page){

    App.page = page;

}

function getCurrentPage(){

    return App.page;

}

function setTransactionType(type){

    App.transactionType = type;

}

function getTransactionType(){

    return App.transactionType;

}

function setGeneratedMessage(message){

    App.message = message;

}

function getGeneratedMessage(){

    return App.message;

}

/* ==========================================
   SETTINGS
========================================== */

function getSetting(name){

    return App.settings[name];

}

function setSetting(name,value){

    App.settings[name]=value;

}

console.log("Application initialized.");
