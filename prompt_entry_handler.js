function addPromptEntryHandler(){
    $(document).on("keyup", '[contenteditable=true]', function(event){
          handlePromptEntry(event, false);
    });
    $(document).on("keyup", 'textarea', function(event){
          handlePromptEntry(event, true);
    });
}

async function handleTextEditor(targetTextEditor) {
    // Check if the targetTextEditor is a node of type "TEXTEDITOR"
    // if not, return
    if(targetTextEditor.nodeName !== "TEXTAREA"){
        // Get textNodesUnder the targetTextEditor
        let target = textNodesUnder(targetTextEditor);
        // Check if the parent of target has a class of gpt-highlight-border
        if(target !== null){
            let pElement = target.parentNode;
            let promptHighlighter = pElement.getElementsByClassName('gpt-highlight-border');
            let currentTextHasPrompt = target.textContent.toLowerCase().includes("prompt:");
            if((promptHighlighter===null || promptHighlighter.length===0) && currentTextHasPrompt){
                ready(pElement)
            }else{
                // add the text to the context
                context = e.innerText;
                if(!currentTextHasPrompt){
                    removeHelper(pElement);
                }
            }
        }else{
            targetTextEditor.querySelectorAll('.gpt-highlight-border').forEach((e)=>{
                removeHelper(e);
            });
        }
    }
}

