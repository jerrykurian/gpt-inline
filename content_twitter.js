$(window).on("load", function() {
    $(".DraftEditor-root").each(function(){
        loadGPTAnywhere(this)
    });
});