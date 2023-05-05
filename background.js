import '/js/firebase-compat.js'

var config = {
    apiKey: "AIzaSyBFvBQqt4lbUiWBbPktrf2QdrVIlqBwJRo",
    databaseURL: "https://ainotemaker-default-rtdb.firebaseio.com/",
    authDomain: "ainotemaker-default-rtd.firebaseapp.com",
    projectId: "ainotemaker-default-rtd",
    storageBucket: "ainotemaker-default-rtd.appspot.com"
};
firebase.initializeApp(config);
checkEmail();

console.log("Loading Background");
let openai_url = "https://api.openai.com/";
chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
    switch (response.type ) {
    case "Completion Request":
        let isPremium = response.premium;
        if(isPremium){
            if(premium_signed){
                executeOpenAiCompletion(response, sender)
            }else{
                chrome.tabs.sendMessage(sender.tab.id, 
                    {"type" : "Completion Response", "status": "error", "message": "User is not premium, Please signup at https://ainotemaker.com q"});
            }
        }else{
            executeOpenAiCompletion(response, sender)
        }
        break;
        case "List Models":
            listModels(response.apiKey, (data) => {
            data['type'] = "List Models Response";
            chrome.tabs.sendMessage(sender.tab.id, data);
        });
        break;
    }
})

// a function that takes the response as input and calls the openAiCompletion
// function to generate the response
async function executeOpenAiCompletion(response, sender){
    openAICompletion(response.context, response.prompt, response.properties, response.apiKey, (data) => {
        data['type'] = "Completion Response";
        chrome.tabs.sendMessage(sender.tab.id, data);
    });
}
let premium_signed = false;
// A function that takes email address as input and calls the firebase api to check if the email is present in the database
async function checkEmail(){
    chrome.identity.getProfileUserInfo(function(userInfo) {
        // get the email
        console.log(userInfo.email);
        let email = userInfo.email;
        let db = firebase.database();
        let ref = db.ref("users");
        ref.orderByChild("email").equalTo(email).once("value", function(snapshot) {
            if(snapshot.exists()){
                premium_signed = true
            }else{
                premium_signed = false
            }
        });
    })
}

// A function that takes prompt as an input and calls openAI completion API using fetch api
// the response text should be returned back by the function
async function openAICompletion(context, inputPrompt, properties, apiKey, callBack){
    let finalText = context + ' ' + inputPrompt;
    fetch(openai_url + "v1/engines/" + properties.engine + "/completions", {
         method: "POST",
         headers: {
             "Content-Type": "application/json",
             "Authorization": "Bearer " + apiKey
         },
         body: JSON.stringify({
                prompt: inputPrompt,
                max_tokens: properties.max_tokens,
                temperature: properties.temperature,
                top_p: 1,
                frequency_penalty: 0,
         }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Add error handling if data.error. Return an object with he error message and type
            if(data.error){
                callBack({"status": "error", "message": data.error.message, "type": data.error.type});
            }else{
                callBack({"status": "success", "completion": data.choices[0].text});
            }
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

