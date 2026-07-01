/* ==========================================
   MPESA Message Generator
   navigation.js
   ========================================== */

"use strict";

/* ==========================================
   SETUP NAVIGATION
   ========================================== */

function setupNavigation(){

    setupHomeButtons();

    setupBackButtons();

}

/* ==========================================
   HOME BUTTONS
   ========================================== */

function setupHomeButtons(){

    const sendMoney=document.getElementById("sendMoney");

    const pochi=document.getElementById("pochi");

    const buyGoods=document.getElementById("buyGoods");

    const settings=document.getElementById("openSettings");

    if(sendMoney){

        sendMoney.addEventListener("click",()=>{

            selectTransaction("send");

        });

    }

    if(pochi){

        pochi.addEventListener("click",()=>{

            selectTransaction("pochi");

        });

    }

    if(buyGoods){

        buyGoods.addEventListener("click",()=>{

            selectTransaction("buygoods");

        });

    }

    if(settings){

        settings.addEventListener("click",()=>{

            showPage("settings");

        });

    }

}

/* ==========================================
   BACK BUTTONS
   ========================================== */

function setupBackButtons(){

    document.querySelectorAll("[data-back]").forEach(button=>{

        button.addEventListener("click",goBack);

    });

}

/* ==========================================
   BACK
   ========================================== */

function goBack(){

    switch(App.currentPage){

        case "generator":

            showPage("home");

            break;

        case "conversation":

            showPage("generator");

            break;

        case "settings":

            showPage("home");

            break;

        default:

            showPage("home");

    }

}

/* ==========================================
   OPEN CONVERSATION
   ========================================== */

function openConversation(){

    showPage("conversation");

}

/* ==========================================
   OPEN GENERATOR
   ========================================== */

function openGenerator(){

    showPage("generator");

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
   KEYBOARD SHORTCUTS
   ========================================== */

document.addEventListener("keydown",event=>{

    if(event.key==="Escape"){

        goBack();

    }

});

/* ==========================================
   PAGE ANIMATION
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

showPage=function(page){

    originalShowPage(page);

    if(Pages[page]){

        animatePage(Pages[page]);

    }

};

/* ==========================================
   SELECT TRANSACTION
   ========================================== */

function loadGenerator(type){

    const title=document.getElementById("generatorTitle");

    if(!title){

        return;

    }

    switch(type){

        case "send":

            title.textContent="Send Money";

            break;

        case "pochi":

            title.textContent="Pochi la Biashara";

            break;

        case "buygoods":

            title.textContent="Buy Goods & Services";

            break;

        default:

            title.textContent="Transaction";

    }

}

/* ==========================================
   END
   ========================================== */

console.log("Navigation Ready");
