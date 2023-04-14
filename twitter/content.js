$(window).on("load", function() {
    loadOpenAiModels();
    loadObserver();
});
let editor = '.public-DraftEditor-content'
let editorRoot = '.DraftEditor-editorContainer'
let editableType = "span";
function addDivElems(startRect, rectElem, position){
    if(!$('gpt-helper')[0].querySelector('#gpt-prompt-highlighter')){
        let left = rectElem.left - 618;
        let top = rectElem.top - 140;
        let width = rectElem.width;
        let promptElement = document.createElement("div");
        promptElement.id = "gpt-prompt-highlighter";
        promptElement.classList.add('gpt-prompt');
        promptElement.style.left = `${(left)}px`;
        promptElement.style.top = `${top}px`;
        promptElement.style.width = `${width}px`;
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
        progressContainerElement.style.left = `${left}px`;
        progressContainerElement.style.top = `${top}px`;
        progressContainerElement.style.width = `${width}px`;
        progressContainerElement.style.height = `5px`;
        progressContainerElement.style.backgroundColor = "rgb(69 90 3)";
        progressContainerElement.style.opacity = 0.5;
        progressContainerElement.style.position = "absolute";
        progressContainerElement.style.zIndex = 9999;
        progressContainerElement.style.borderRadius = "5px";
        progressContainerElement.style.cursor = "pointer";
        progressContainerElement.style.display = 'none';
        $('gpt-helper')[0].appendChild(progressContainerElement);

        let gptErrorElement = document.createElement("gpt-error");
        gptErrorElement.id = "gpt-completion-error";
        gptErrorElement.style.left = `${left}px`;
        gptErrorElement.style.top = `${top}px`;
        gptErrorElement.style.width = `${width}px`;
        gptErrorElement.style.height = `5px`;
        gptErrorElement.style.backgroundColor = "red";
        gptErrorElement.style.opacity = 0.5;
        gptErrorElement.style.position = "absolute";
        gptErrorElement.style.zIndex = 9999;
        gptErrorElement.style.borderRadius = "5px";
        gptErrorElement.style.cursor = "pointer";
        gptErrorElement.style.display = 'none';
        gptErrorElement.setAttribute('data-toggle',"tooltip");
        gptErrorElement.setAttribute('data-placement', "top");
        gptErrorElement.setAttribute('title', "Error Message");
        $('gpt-helper')[0].appendChild(gptErrorElement);
        $('#gpt-completion-error').tooltip()
    }
}
