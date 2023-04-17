function addPromptEntryHandler(){
    console.log("Added Prompt Entry Handler in Gmail");
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
            let promptHighlighter = targetTextEditor.querySelectorAll('.gpt-highlight-border');
            let targetText = targetTextEditor.innerText.toLowerCase();
            let currentTextHasPrompt = targetText.includes("prompt:");
            if((promptHighlighter===null || promptHighlighter.length===0) && currentTextHasPrompt){
                if(pElement.innerText.toLowerCase().includes("prompt:")){
                    ready(pElement)
                }
            }else{
                // add the text to the context
                if(!currentTextHasPrompt){
                    context = e.innerText;
                    removeHelper(pElement);
                }else{
                    // Check if the targetText ends with carriage return
                    if(targetText.endsWith("\n")){
                        progress(target.parentNode);
                        handlePrompt(target, false);
                    }
                }
            }
        }else{
            targetTextEditor.querySelectorAll('.gpt-highlight-border').forEach((e)=>{
                removeHelper(e);
            });
        }
    }
}
