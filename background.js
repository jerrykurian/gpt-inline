console.log("Loading Background");
let openai_url = "https://api.openai.com/";
chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
    switch (response.type ) {
    case "Completion Request":
        openAICompletion(response.context, response.prompt, response.properties, response.apiKey, (data) => {
            console.log(data);
            data['type'] = "Completion Response";
            chrome.tabs.sendMessage(sender.tab.id, data);
        });
        break;
    case "List Models":
        listModels(response.apiKey, (data) => {
            console.log(data);
            data['type'] = "List Models Response";
            chrome.tabs.sendMessage(sender.tab.id, data);
        });
        break;
    }
})

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
// If the key is present then set it to a variable that is accessible to the openAICompletion function
// 2. Add a function to save the api key to local storage
// 3. Add a function to check if the api key is valid or not
// 4. Add a function to load the model chosen by the user from local storage. If its not present then default to "davinci", else use
// the value and set it to a variable that is accessible to the openAICompletion function
