$(window).on("load", function() {
    loadOpenAiModels();
    loadObserver();
});

async function handleTextEditor(targetTextEditor) {
    let context = ''
    let prompt = targetTextEditor.querySelectorAll(editableType).forEach(function(e){
        // add a check to see if the text contains "prompt:"
        let promptHighlighter = document.getElementById('gpt-completion-progress');
        let currentTextHasPrompt = $(`${editor}`)[0].innerText.toLowerCase().includes("prompt:");
        if(promptHighlighter===null && currentTextHasPrompt){
            updatePromptText(e)
        }else{
            // add the text to the context
            context = e.innerText;
            if(!currentTextHasPrompt){
                removeHelper(e);
            }
        }
    })
}

function loadObserver() {
    // create a jquery css selector for identifying a node that has contenteditable="true"
    $(document).on("DOMSubtreeModified", `${editor}`,
         function () {
            handleTextEditor(this);
    });

    $(document).on("keyup", `${editor}`, function(event){
          var keycode = (event.keyCode ? event.keyCode : event.which);
          if(keycode == '13'){
            let target = textNodesUnder(event.target);
            if(target !== null){
                progress(target.parentNode);
                handlePrompt(target);
            }
          }
    });
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
    let targetTextNode = textNodesUnder(target)
    if(targetTextNode !== null){
        let tNode = textNodesUnder(target)
        if(tNode !== null){
            let pElement = tNode.parentNode;
            pElement.classList.add('gpt-highlight-border');
            ready(pElement);
        }
    }

    /*let textNodes = textNodesUnder(pElement);
    textNodes.forEach((textNode) => {
        let startRange = document.createRange();
        startRange.setStart(textNode, 0);
        startRange.setEnd(textNode, 0);
        let startRangeRect = startRange.getClientRects()[0];

        let text = textNode.textContent;
        let startPositions = getIndicesOf('prompt:', text.toLowerCase(), false);
        startPositions.forEach((startPos, index) => {
            let range = document.createRange();
            range.setStart(textNode, startPos);
            range.setEnd(textNode, startPos + 7);
            rectList = range.getClientRects();
            let rectElem = rectList[0];
            if($('gpt-helper')[0] === undefined){
                let gptHelper = document.createElement("gpt-helper");
                // append gptHelper as a child of the .ql-editor element
                $(`${editorRoot}`)[0].appendChild(gptHelper);
            }
            addDivElems(startRangeRect, rectElem, index);
        })
    })*/
}
function setPromptResponse(contextText, target){
    let pElement = target;
    let preText = contextText;
    let handler = function(status, message){
        if(status === "success"){
           // add the message to the text editor
           let finalText = `${preText} ${message}`;
           pElement.innerText = finalText;
           removeHelper(target);
        }else{
           // showApiKeyModal();
           let tNode = textNodesUnder(target)
           if(tNode !== null){
                error(tNode.parentNode);
                showErrorModal();
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

function handlePrompt(target){
    let text = target.textContent;
    let indexOfPrompt = text.indexOf('prompt:');
    let contextText = text.substring(0, indexOfPrompt);
    let promptText = text.substring(indexOfPrompt + 7, text.length);
    promptCompleter(contextText, promptText, setPromptResponse(contextText, target.parentNode));
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