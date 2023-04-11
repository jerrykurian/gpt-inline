$(window).on("load", function() {
    loadOpenAiModels();
    loadObserver();
    let document = $(window.document)[0];

});


function loadObserver() {
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    const targetNode = document.querySelector("body");

    // Add a mutation observer that listens for a div node with class "share-box" to be added to the DOM
    // When the node is added, add a click event listener to the node
    // When the node is clicked, call the function that will add the prompt text to the text editor
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == "childList") {
                mutation.addedNodes.forEach(function(node) {
                    if (node.className == "ql-editor") {
                        loadGPTAnywhere($(node)[0]);
                        $('.ql-editor').on("keyup", function(event){
                          var keycode = (event.keyCode ? event.keyCode : event.which);
                          if(keycode == '13'){
                            handlePrompt(event.target);
                          }
                        });
                    }
                });
            }
        });
    });

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);


}

let shadow = null;
function loadGPTAnywhere(target) {
    $('.ql-editor').on("DOMSubtreeModified",
        function () {
            handleTextEditor(this);
        });
    // Create gpt-helper element
    let gptHelper = document.createElement("gpt-helper");
    // append gptHelper as a child of the .ql-editor element
    $('.editor-content')[0].appendChild(gptHelper);
}
async function handleTextEditor(targetTextEditor) {
    let context = ''
    let prompt = targetTextEditor.querySelectorAll("p").forEach(function(e){
        // add a check to see if the text contains "prompt:"
        if(e.querySelector('.gpt-prompt')===null && e.innerText.includes("prompt:")){
            updatePromptText(e)
        }else{
            // add the text to the context
            context += e.innerText;
            removeHelper();
        }
    })
}

function removeHelper(){
    if($('gpt-helper')[0].querySelector('#gpt-menu-link')){
        $('gpt-helper')[0].querySelector('#gpt-menu-link').remove();
    }
    if($('gpt-helper')[0].querySelector('gpt-progress')){
        $('gpt-helper')[0].querySelector('gpt-progress').remove();
    }
}

function updatePromptText(pElement){
    let textNodes = textNodesUnder(pElement);
    textNodes.forEach((textNode) => {
        let startRange = document.createRange();
        startRange.setStart(textNode, 0);
        startRange.setEnd(textNode, 0);
        let startRangeRect = startRange.getClientRects()[0];

        let text = textNode.textContent;
        let startPositions = getIndicesOf('prompt:', text, false);
        startPositions.forEach((startPos, index) => {
            let range = document.createRange();
            range.setStart(textNode, startPos);
            range.setEnd(textNode, startPos + 7);
            rectList = range.getClientRects();
            let rectElem = rectList[0];
            addDivElems(startRangeRect, rectElem, index);
        })
    })
}

function addDivElems(startRect, rectElem, position){
    if(!$('gpt-helper')[0].querySelector('#gpt-menu-link')){
        let promptElement = document.createElement("div");
        promptElement.id = "gpt-menu-link";
        promptElement.classList.add('gpt-prompt');
        promptElement.style.left = `${(rectElem.left - startRect.left)}px`;
        promptElement.style.top = `${(rectElem.top - startRect.top)+ rectElem.height + 1}px`;
        promptElement.style.width = `${rectElem.width}px`;
        promptElement.style.height = `5px`;
        promptElement.style.backgroundColor = "rgb(69 90 3)";
        promptElement.style.opacity = 0.5;
        promptElement.style.position = "absolute";
        promptElement.style.zIndex = 9999;
        promptElement.style.borderRadius = "5px";
        promptElement.style.cursor = "pointer";
        promptElement.position = position;
       $('gpt-helper')[0].appendChild(promptElement);

        let progressContainerElement = document.createElement("gpt-progress");
        progressContainerElement.id = "gpt-completion-progress";
        progressContainerElement.style.left = `${(rectElem.left - startRect.left)}px`;
        progressContainerElement.style.top = `${(rectElem.top - startRect.top)+ rectElem.height + 1}px`;
        progressContainerElement.style.width = `${rectElem.width}px`;
        progressContainerElement.style.height = `5px`;
        progressContainerElement.style.backgroundColor = "rgb(69 90 3)";
        progressContainerElement.style.opacity = 0.5;
        progressContainerElement.style.position = "absolute";
        progressContainerElement.style.zIndex = 9999;
        progressContainerElement.style.borderRadius = "5px";
        progressContainerElement.style.cursor = "pointer";
        progressContainerElement.style.display = 'none';
        $('gpt-helper')[0].appendChild(progressContainerElement);
    }
}


function handlePrompt(target){
    $('#gpt-completion-progress').show();
    $('#gpt-menu-link').hide();
    let text = target.innerText;
    let indexOfPrompt = text.indexOf('prompt:');
    let contextText = text.substring(0, indexOfPrompt);
    let promptText = text.substring(indexOfPrompt + 7, text.length);
    promptCompleter(contextText, promptText, setPromptResponse(contextText, target));
}

function setPromptResponse(contextText, target){
    let pElement = target;
    let preText = contextText;
    let handler = function(status, message){
        if(status === "success"){
           // add the message to the text editor
           let finalText = `${preText} ${message}`;
           pElement.innerText = finalText;
           $('#gpt-completion-progress').remove();
           removeHelper();
        }else{
           showApiKeyModal();
           $('#gpt-completion-progress').remove();
        }
    }
    return handler;
}

function hidePopover(){
    $('#gpt-prompt-action-progress').hide();
    $("#popover-target").hide();
}

// Create a custom element called GPTHelper
class GPTHelper extends HTMLElement {
    // add a constructor
    constructor() {
        // Attach this element to the shadow dom
        super();
        // this.attachShadow({mode: 'open'});
        // Add inert html to the shadow dom
        this.innerHTML = `
            <div class="gpt-helper" style="position: absolute; top: 0px; left: 0px; pointer-events: none; z-index: auto;">
                </div>`

    }
}
// Create a custom element called GPTHelper
class GPTProgress extends HTMLElement {
    constructor() {
        // Attach this element to the shadow dom
        super();

    }
    connectedCallback() {
        this.innerHTML = `

           <div class="loading-bar animate" id="gpt-completion-progress">
             <span></span>
           </div>
         `;
     }
}

// define the custom element
window.customElements.define('gpt-helper', GPTHelper);
window.customElements.define('gpt-progress', GPTProgress);