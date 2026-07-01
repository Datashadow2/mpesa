/*
==========================================
M-PESA Message Generator
settings.js
==========================================
*/

"use strict";

/* ==========================================
   STORAGE KEYS
========================================== */

const SETTINGS_KEY = "mpesaGeneratorSettings";

/* ==========================================
   DEFAULT SETTINGS
========================================== */

const defaultSettings = {

    defaultBalance: "",

    rememberBalance: true

};

/* ==========================================
   INITIALIZE
========================================== */

function initializeSettings(){

    const remember = document.getElementById(

        "rememberBalance"

    );

    if(remember){

        remember.addEventListener(

            "change",

            saveSettings

        );

    }

    const balance = document.getElementById(

        "defaultBalance"

    );

    if(balance){

        balance.addEventListener(

            "input",

            saveSettings

        );

    }

}

/* ==========================================
   SAVE SETTINGS
========================================== */

function saveSettings(){

    const settings = {

        defaultBalance: getDefaultBalance(),

        rememberBalance: isRememberEnabled()

    };

    localStorage.setItem(

        SETTINGS_KEY,

        JSON.stringify(settings)

    );

}

/* ==========================================
   LOAD SETTINGS
========================================== */

function loadSettings(){

    const saved = localStorage.getItem(

        SETTINGS_KEY

    );

    if(!saved){

        applySettings(

            defaultSettings

        );

        return;

    }

    try{

        const settings = JSON.parse(saved);

        applySettings(settings);

    }

    catch(error){

        applySettings(

            defaultSettings

        );

    }

}

/* ==========================================
   APPLY SETTINGS
========================================== */

function applySettings(settings){

    const remember = document.getElementById(

        "rememberBalance"

    );

    const balance = document.getElementById(

        "defaultBalance"

    );

    if(remember){

        remember.checked =

            settings.rememberBalance;

    }

    if(balance){

        balance.value =

            settings.defaultBalance;

    }

    setSetting(

        "rememberBalance",

        settings.rememberBalance

    );

    setSetting(

        "defaultBalance",

        settings.defaultBalance

    );

}

/* ==========================================
   GET BALANCE
========================================== */

function getDefaultBalance(){

    const input = document.getElementById(

        "defaultBalance"

    );

    if(!input){

        return "";

    }

    return input.value.trim();

}

/* ==========================================
   REMEMBER?
========================================== */

function isRememberEnabled(){

    const checkbox = document.getElementById(

        "rememberBalance"

    );

    if(!checkbox){

        return true;

    }

    return checkbox.checked;

}

/* ==========================================
   RESET SETTINGS
========================================== */

function resetSettings(){

    localStorage.removeItem(

        SETTINGS_KEY

    );

    applySettings(

        defaultSettings

    );

}

/* ==========================================
   FILL GENERATOR BALANCE
========================================== */

function fillSavedBalance(){

    if(

        !getSetting(

            "rememberBalance"

        )

    ){

        return;

    }

    const balance = document.getElementById(

        "balance"

    );

    if(balance){

        balance.value =

            getSetting(

                "defaultBalance"

            );

    }

}

/* ==========================================
   OPEN SETTINGS
========================================== */

function openSettingsPage(){

    loadSettings();

    showPage(

        "settings"

    );

}

/* ==========================================
   CLOSE SETTINGS
========================================== */

function closeSettingsPage(){

    saveSettings();

    showPage(

        "home"

    );

}

console.log(

    "Settings initialized."

);
