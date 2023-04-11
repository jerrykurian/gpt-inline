document.getElementById("gpt-key-submit").addEventListener("click", saveKey);
chrome.storage.local.get("gptApiKey", function (data) {
    console.log(data);
    document.getElementById('gpt-key-value').value = data.gptApiKey;
});

function saveKey(){
    let key = document.getElementById('gpt-key-value').value;
    chrome.storage.local.set({"gptApiKey": key}).then(()=>{
        console.log("Key saved");
        // show gpt-key-success
        document.getElementById('gpt-key-success').style.display = "block";
    });
}

