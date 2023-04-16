document.getElementById("gpt-key-submit").addEventListener("click", saveKey);

function saveKey(){
    document.getElementById('gpt-key-success').style.display = "none";
    document.getElementById('gpt-key-failure').style.display = "none";
    let key = document.getElementById('gpt-key-value').value;
    let engine = document.getElementById('gpt-engines').value;
    if(!isCensored(key)){
        chrome.storage.local.set({"gptApiKey": key}).then(()=>{
            console.log("Key saved");
            chrome.storage.local.set({"gptEngine": engine}).then(()=>{
                console.log("Engine saved");
                document.getElementById('gpt-key-success').style.display = "block";
             });
        });

    }else{
        document.getElementById('gpt-key-failure').style.display = "block";
    }

}

// create a function that takes a string as an input and replaces the middle 50% characters with asterisks
function censorString(str) {
    let strLength = str.length;
    let censoredString = "";
    let i = 0;
    while(i < strLength){
        if(i < strLength/4 || i > strLength - strLength/4){
            censoredString += str[i];
        }else{
            censoredString += "*";
        }
        i++;
    }
    return censoredString;
}
// Create a function that checks if the incoming string has middle sequence of asterisks
function isCensored(str) {
    let strLength = str.length;
    let i = 0;
    let asteriskCount = 0;
    while(i < strLength){
        if(str[i] === "*"){
            asteriskCount++;
        }
        i++;
    }
    return asteriskCount >= strLength/2;
}

loadOpenAiModels();
let openai_url = "https://api.openai.com/";
let openai_engine = "text-davinci-003"

// Add a function that checks if apiKey is stored in the local storage
// if the key is present then return it or else return null
async function loadApiKey(fn){
    chrome.storage.local.get("gptApiKey", function (data) {
        fn(data.gptApiKey);
    });
}

function loadOpenAiModels(){
    loadApiKey((key)=>{
        chrome.storage.local.get("gptEngine", function (data) {
            let engine = data.gptEngine;
            if(engine !== undefined){
                openai_engine = engine;
            }
            listModels(key, handleListModelsResponse);
        });

    });
}

// Create a function that lists all the open ai models and returns it as an array
// The function should take the api key as an input and return the array of models
async function listModels(apiKey, callBack){
    fetch(openai_url + "v1/engines", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey
        }
    }).then(response => response.json())
    .then(data => {
        console.log(data);
        // Add error handling if data.error. Return an object with he error message and type
        if(data.error){
            callBack({"status": "error", "message": data.error.message, "type": data.error.type});
        }else{
            callBack({"status": "success", "models": data.data});
        }
    })
}

function handleListModelsResponse(response){
    if(response.status === "success"){
        console.log(response.models);
        models = response.models;
        addModelsToSelect();
    }else{
        console.log(response.message);
    }
}

// add a function that will create options out of models and add them to the select element ID gpt-engines
function addModelsToSelect(){
    if(models !== null){
        let select = document.getElementById('gpt-engines');
        models.forEach((model)=>{
            let option = document.createElement("option");
            option.text = model.id;
            option.value = model.id;
            if(model.id === openai_engine){
                option.selected = true;
            }
            select.add(option);
        });
    }
}

chrome.storage.local.get("gptApiKey", function (data) {
    console.log(data);
    if(data.gptApiKey !== undefined){
        document.getElementById('gpt-key-value').value = censorString(data.gptApiKey);
    }else{
        document.getElementById('gpt-key-value').value = "";
    }
});