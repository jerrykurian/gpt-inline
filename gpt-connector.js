console.log("Loading Now");
let apiKey = null;
let currentTextEditor = null;
let callback = null;
let currentContext = null;
let currentPrompt = null;
let models = null;
let openai_engine = "text-davinci-003"
let temperature = 0.2;
let max_tokens = 1000;

function loadOpenAiModels(){
    loadApiKey((key)=>{
        chrome.runtime.sendMessage({ "type": "List Models", "apiKey": key });
    });
}

loadApiKey((key)=>{
    apiKey = key;
});
// Add a function promptGenerator that handles the click event and calls openAi api to pass the prompt and generate response
function promptCompleter(context, prompt, fn){
    callback = fn;
    loadApiKey((key)=>{
        currentContext = context;
        currentPrompt = prompt;
        /*handleCompletionResponse({status: "success",
            completion: `The origins of the stock market can be traced back to the 1600s in Amsterdam,
                when the Dutch East India Company began trading shares of stock. This was the first time that investors
                could buy and sell shares of a company, and it marked the beginning of the modern stock market.
                In the 1700s, the London Stock Exchange was established, and it quickly became the largest stock exchange in the world.
                In the 1800s, the New York Stock Exchange was founded, and it quickly became the most important stock exchange in the United States.
                By the early 1900s, stock exchanges had been established in many countries around the world, and the stock market had become a global phenomenon.
                Today, the stock market is an integral part of the global economy,
                and it provides investors with the opportunity to buy and sell shares of companies from all over the world.`});*/
        chrome.runtime.sendMessage({ "context": context, "prompt": prompt, "type": "Completion Request", "apiKey": key,
           properties: {'temperature': temperature, 'engine': openai_engine, 'max_tokens': max_tokens}});
    });
}

// Add a runtime listener to handle the response from the background
// the function will take the message from response and log it to console
chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
    console.log(response);
    switch(response.type){
        case "Completion Response": handleCompletionResponse(response); break;
        case "List Models Response": handleListModelsResponse(response); break;
    }

})

function handleListModelsResponse(response){
    if(response.status === "success"){
        console.log(response.models);
        models = response.models;
    }else{
        console.log(response.message);
    }
}

// handle completion response
// if the response is success then add the completion to the text editor
// if the response is error then log the error message to console
function handleCompletionResponse(response){
    $('#gpt-response-progress').show();
    if(response.status === "success"){
        callback('success', response.completion);
        // showConfirmation(response.completion);
    }else{
        callback('error', response.message);
    }
}

// Add a function that checks if apiKey is stored in the local storage
// if the key is present then return it or else return null
async function loadApiKey(fn){
    chrome.storage.local.get("gptApiKey", function (data) {
        fn(data.gptApiKey);
    });
}
let keyContentAdded = false;
// 1. Add a function to load api key from local storage. If the key is not present, then popup the extension page and ask user to enter the key.
function showApiKeyModal(){
    loadApiKey((gptApiKey)=>{
        //if(gptApiKey === undefined || gptApiKey === null){
        if(!keyContentAdded){
            fetch(chrome.runtime.getURL('/pages/set_key.html')).then(r => r.text()).then(html => {
              let divTarget = document.createElement('div');
              divTarget.id = "gpt_modal";
              divTarget.innerHTML = html;
              // add the modal to the event target
              //this.attachShadow({mode: 'open'});
              $(document.body).append(divTarget);
              $('#gpt-key-submit').click(function() {
               saveKey();
             });
              keyContentAdded = true;
            });
            // showError();
        }else{
            $('#gpt-key').show();
            // showError();
        }
        //}
    });

}

function saveKey(){
    let key = $('#gpt-key-value').val();
    chrome.storage.local.set({"gptApiKey": key}).then(()=>{
        $('#gpt_modal').remove();
    });
}

function showConfirmation(completion){
    fetch(chrome.runtime.getURL('/pages/confirmation.html')).then(r => r.text()).then(html => {
      if($('#gpt-confirmation-modal').length > 0) $('#gpt-confirmation-modal').remove();
      let divTarget = document.createElement('div');
      divTarget.id = "gpt-confirmation-modal";
      divTarget.innerHTML = html;
      // add the modal to the event target
      $('gpt-helper').append(divTarget);
      $('#gpt-response-text').text(completion);
      addModelsToSelect();
      addTemperatures();
      $('#gpt-response-progress').hide();
      $('#gpt-confirmation-details').show();
      $('#gpt-confirmation-accept').click(function() {
           callback('success', completion);
           $('#gpt-confirmation-modal').remove();
        });
       $('#gpt-confirmation-retry').click(function() {
         $('#gpt-response-progress').show();
         retry();
      });
  })
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
// add a function that will create options of temperatures
function addTemperatures(){
   let select = document.getElementById('gpt-temperatures');
   let temperatures = [{value: 0.2, label: 'Low'}, {value: 0.5, label: 'Medium'}, {value: 1, label: 'High'}];
   temperatures.forEach((temp)=>{
        let option = document.createElement("option");
        option.text = temp.label;
        option.value = temp.value
        if(temp.value === temperature){
            option.selected = true;
        }
        select.add(option);
    })
}

function retry(){
    temperature = Number($('#gpt-temperatures').val());
    openai_engine = $('#gpt-engines').val();
    promptCompleter(currentContext, currentPrompt, setPromptResponse);
}

function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

// Create a custom element called GPTHelper
class GPTMessage extends HTMLElement {
    constructor() {
        // Attach this element to the shadow dom
        super();

    }
    connectedCallback() {
        //const shadow = this.attachShadow({ mode: "open" });
        this.innerHTML = `
            <div id="gpt-key" class="gpt-modal modal-sheet position-top position-right bg-body-secondary" role="dialog" style="display: block">
                <div class="modal-dialog" role="document">
                    <div class="modal-content rounded-4 shadow">
                        <div class="modal-header p-5 pb-4 border-bottom-0">
                            <h1>GPT - Save your OpenAI Key</h1>
                            <button id="gpt-key-close" type="button" class="btn-close" data-bs-dismiss="modal" onclick="document.getElementById('gpt-key').style.display = 'none'" aria-label="Close"></button>
                        </div>

                        <div class="modal-body p-5 pt-0">
                            <form class="">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control rounded-3" id="gpt-key-value" placeholder="sk-dadsad***dasdsa" required>
                                    <label for="gpt-key-value">API Key</label>
                                </div>
                                <button id="gpt-key-submit" class="w-100 mb-2 btn btn-lg rounded-3 btn-primary" type="button">Save</button>
                                <script>

                                </script>
                                <small class="text-body-secondary">Your key is safe and will not be shared with anyone. It will be stored in your local machine.</small>
                                <small class="text-body-secondary"><a target="_blank"  href="https://platform.openai.com/account/api-keys">Get your API key from Open AI dashboard.</a> </small>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
         `;
     }
}
window.customElements.define('gpt-message', GPTMessage);