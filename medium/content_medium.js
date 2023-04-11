$(window).on("load", function() {
    loadGPTAnywhere(this)
    createPopoverText();
    loadOpenAiModels();
});
let shadow = null;
function loadGPTAnywhere(target) {
    $('.section-content .section-inner').on("DOMSubtreeModified",
        function () {
            handleTextEditor(this);
        });
}
function handleTextEditor(targetTextEditor) {
    let context = ''
    let prompt = targetTextEditor.querySelectorAll("p").forEach(function(e){
        // add a check to see if the text contains "prompt:"
        if(e.querySelector('.gpt-prompt')===null && e.innerText.includes("prompt:")){
            updatePromptText(e)
        }else{
            // add the text to the context
            context += e.innerText;
        }
    })
}

// Add a function that will take a <p> element and update the text and replace "prompt:" with <span class="gpt-prompt">prompt:</span>
function updatePromptText(pElement){
    let text = pElement.innerText;
    if(text.includes("prompt:")){
        let indexOfPrompt = text.indexOf("prompt:");
        let preText = text.substring(0, indexOfPrompt);
        let postText = text.substring(indexOfPrompt+7, text.length);
        let finalText = preText + `<span class='gpt-prompt gpt-popover'
            data-popover-target="#popover-target">prompt:</span>`
            +postText;
        pElement.innerHTML = finalText;
        PopoverComponent.init({
          ele: '.gpt-popover',
          margin: 0,
          hideOnOuterClick: true
        });
        // $('.gpt-prompt').on('mouseover', handleMouseOver);
    }
}

// Create a function that handles mouseover on the prompt text and underlines the next sibling text
function handleMouseOver(){
    let promptNode = $(".gpt-prompt")[0];
    let promptTextNode = promptNode.nextSibling;
    promptTextNode.textContent.strike()
}

function getContextText(promptNode){
    // Find the parent p node of the prompt Node
    let parentNode = promptNode.parentNode;
    // find all sibling <p> nodes of the parent node
    let siblingNodes = $(parentNode).siblings("p");
    if(siblingNodes !== undefined && siblingNodes !== null){
        return siblingNodes.map(function(){
            // add the text to the context
            return this.innerText;
        }).toArray().join(" ");
    }else{
        return "";
    }
}

function handlePrompt(){
    let promptNode = $(".gpt-prompt")[0];
    let promptTextNode = promptNode.nextSibling;
    let promptText = promptTextNode.nodeValue;
    $('#gpt-prompt-action-progress').show();
    let contextText = getContextText(promptNode);
    promptCompleter(contextText, promptText, setPromptResponse);
}

function setPromptResponse(status, message){
    let promptNode = $(".gpt-prompt")[0];
    let promptTextNode = promptNode.nextSibling;
    if(status === "success"){
        // add the message to the text editor
        promptNode.remove();
        promptTextNode.replaceWith(message);
        $('#gpt-prompt-action-progress').hide();
    }else{
        console.log(message);
        $('#gpt-prompt-action-progress').hide();
    }
}

function createPopoverText(){
    let popElement = document.createElement("div");
    popElement.id = "popover-target";
    popElement.style.display = "none";
    popElement.innerHTML = `
                    <div>
                      <div class="row">
                        <div>
                          <ul class="list-group gpt-action">
                            <li id="gpt-prompt-action" class="list-group-item"><i class="bi bi-pen-fill text-info mx-2"></i>Complete with GPT
                                <span id="gpt-prompt-action-progress" class="spinner-border spinner-border-sm" role="status" style="display: none" aria-hidden="true"></span>
                            </li>
                            <li id="gpt-key-action" class="list-group-item"><i class="bi bi-key text-info mx-2"></i>Set the API Key
                                <span id="gpt-key-progress" class="spinner-border spinner-border-sm" role="status" style="display: none" aria-hidden="true"></span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>`
    document.documentElement.appendChild(popElement);
    // If api key is not present, then hide gpt-prompt-action and show gpt-key-action. Add a click listener on gpt-key-action that calls showApiKeyModal()
    loadApiKey((apiKey)=>{
        if(apiKey === undefined || apiKey === null){
            $('#gpt-prompt-action').hide();
            $('#gpt-key-action').show();
        }else{
            $('#gpt-prompt-action').show();
            $('#gpt-key-action').hide();
        }
    });
    $('#gpt-key-action').click(function(){
        showApiKeyModal();
    });
    $('#gpt-prompt-action').click(function(){
        handlePrompt();
    });
}

function hidePopover(){
    $('#gpt-prompt-action-progress').hide();
    $("#popover-target").hide();
}