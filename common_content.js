$(window).on("load", function() {
    loadOpenAiModels();
    loadObserver();
});

function loadObserver() {
    // Select the node that will be observed for mutations
    addDomModificationHandler();
    addPromptEntryHandler();
}

function addDomModificationHandler(){
    // create a jquery css selector for identifying a node that has contenteditable="true"
    // DOMCharacterDataModified
    $(document).on("DOMSubtreeModified", '[contenteditable=true]',
         function () {
            handleTextEditor(this);
    });
    $(document).on("textchange", 'textarea',
        function () {
            handleTextEditor(this);
        }
    );
}

function handlePromptEntry(event, isTextArea){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
    if(!isTextArea){
        let target = textNodesUnder(event.target);
        if(target !== null){
            progress(target.parentNode);
            handlePrompt(target, isTextArea);
        }
    }else{
        handlePrompt(event.target, isTextArea);
    }
  }
}
function textNodesUnder(el){
  let searchText = 'prompt:';
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
  while(n=walk.nextNode()) {
    if(n.textContent.toLowerCase().includes(searchText)){
        return n;
    }
  }
  return null;
}


function updatePromptText(target){
    let pElement = target.parentNode;
    ready(pElement);
}
function setPromptResponse(contextText, target, isTextArea){
    let pElement = target;
    let preText = contextText;
    let textArea = isTextArea;
    let handler = function(status, message){
        if(status === "success"){
            // add the message to the text editor
            let finalText = `${preText} ${message}`;
            if(textArea){
                pElement.value = finalText;
            }else{
                pElement.innerHTML = finalText;
                removeHelper(target);
            }
        }else{
           // showApiKeyModal();
           if(!isTextArea){
               let tNode = textNodesUnder(target)
               if(tNode !== null){
                    error(tNode.parentNode);
                    // showErrorModal();
               }
           }
           // removeHelper();
        }
    }
    return handler;
}

function showErrorModal(){
    fetch(chrome.runtime.getURL("/pages/set_key.html"))
            .then((r) => r.text())
            .then((html) => {
              let divTarget = document.createElement("div");
              divTarget.id = "gpt_modal";
              divTarget.innerHTML = html;
              // add the modal to the event target
              //this.attachShadow({mode: 'open'});
              $(document.body).append(divTarget);
              $("#gpt-key-submit").click(function () {
                saveKey();
              });
              keyContentAdded = true;
            });
}

function handlePrompt(target, isTextArea){
    let text = '';
    if(isTextArea){
        text = target.value;
    }else{
        text = target.textContent;
    }
    let indexOfPrompt = text.indexOf('prompt:');
    let contextText = text.substring(0, indexOfPrompt);
    let promptText = text.substring(indexOfPrompt + 7, text.length);
    promptCompleter(contextText, promptText, setPromptResponse(contextText, isTextArea? target: target.parentNode, isTextArea));
}

// Create a custom element called GPTHelper
class GPTHelper extends HTMLElement {
    // add a constructor
    constructor() {
        // Attach this element to the shadow dom
        super();
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

function removeHelper(target){
    // check if target class list contains gpt-highlight-border
    if(target.classList.contains('gpt-highlight-border')){
        target.classList.remove('gpt-highlight-border');
    }
    // check if target class list contains gpt-animate
    if(target.classList.contains('gpt-ready')){
        target.classList.remove('gpt-ready');
    }
    // check if target class list contains gpt-animate
    if(target.classList.contains('gpt-animate')){
        target.classList.remove('gpt-animate');
    }
    // check if target class list contains gpt-error
    if(target.classList.contains('gpt-error')){
        target.classList.remove('gpt-error');
    }
}

function ready(target){
    // check if target class list contains gpt-highlight-border
    if(!target.classList.contains('gpt-highlight-border')){
        target.classList.add('gpt-highlight-border');
    }
    // check if target class list contains gpt-animate
    if(!target.classList.contains('gpt-ready')){
        target.classList.add('gpt-ready');
    }
    // check if target class list contains gpt-animate
    if(target.classList.contains('gpt-animate')){
        target.classList.remove('gpt-animate');
    }
    // check if target class list contains gpt-error
    if(target.classList.contains('gpt-error')){
        target.classList.remove('gpt-error');
    }
}
function progress(target){
    // check if target class list contains gpt-highlight-border
    if(!target.classList.contains('gpt-highlight-border')){
        target.classList.add('gpt-highlight-border');
    }
    // check if target class list contains gpt-animate
    if(!target.classList.contains('gpt-animate')){
        target.classList.add('gpt-animate');
    }
    // check if target class list contains gpt-animate
    if(target.classList.contains('gpt-ready')){
        target.classList.remove('gpt-ready');
    }
    // check if target class list contains gpt-error
    if(target.classList.contains('gpt-error')){
        target.classList.remove('gpt-error');
    }
}
function error(target){
    // check if target class list contains gpt-highlight-border
    if(!target.classList.contains('gpt-highlight-border')){
        target.classList.add('gpt-highlight-border');
    }
    // check if target class list contains gpt-animate
    if(!target.classList.contains('gpt-error')){
        target.classList.add('gpt-error');
    }
    // check if target class list contains gpt-animate
    if(target.classList.contains('gpt-animate')){
        target.classList.remove('gpt-animate');
    }
    // check if target class list contains gpt-error
    if(target.classList.contains('gpt-ready')){
        target.classList.remove('gpt-ready');
    }
}