document.getElementById("gpt-key-submit").addEventListener("click", saveKey);

chrome.storage.local.get("gptApiKey", function (data) {
    console.log(data);
    if(data.gptApiKey !== undefined){
        document.getElementById('gpt-key-value').value = censorString(data.gptApiKey);
    }else{
        document.getElementById('gpt-key-value').value = "";
    }
});

function saveKey(){
    document.getElementById('gpt-key-success').style.display = "none";
    document.getElementById('gpt-key-failure').style.display = "none";
    let key = document.getElementById('gpt-key-value').value;
    if(!isCensored(key)){
        chrome.storage.local.set({"gptApiKey": key}).then(()=>{
            console.log("Key saved");
            // show gpt-key-success
            document.getElementById('gpt-key-success').style.display = "block";
        });
    }else{
        document.getElementById('gpt-key-failure').style.display = "block";
    }
}

// create a function that takes a string as an input and replaces the middle 50% characters with asterisks
function censorString(str) {
    let strLength = str.length;
    let censoredString = "";
    let i = 0;
    while(i < strLength){
        if(i < strLength/4 || i > strLength - strLength/4){
            censoredString += str[i];
        }else{
            censoredString += "*";
        }
        i++;
    }
    return censoredString;
}
// Create a function that checks if the incoming string has middle sequence of asterisks
function isCensored(str) {
    let strLength = str.length;
    let i = 0;
    let asteriskCount = 0;
    while(i < strLength){
        if(str[i] === "*"){
            asteriskCount++;
        }
        i++;
    }
    return asteriskCount >= strLength/2;
}

