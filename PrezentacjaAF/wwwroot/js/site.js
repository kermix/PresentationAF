$(document).ready(function () {

    if (!($.getCookie("muted")))
        $.setCookie("muted", "false", 30);
    else if ($.getCookie("muted") === "true")
        $("#muteButton").addClass("active");

    if (!($.getCookie("slideshow")))
        $.setCookie("slideshow", "true", 30);
    else if ($.getCookie("slideshow") === "false")
        $("#slideshowButton").addClass("active");

    if (!($.getCookie("slideDuration")))
        $.setCookie("slideDuration", "0", 30);
    else
        $("#slideLength").val(parseInt(($.getCookie("slideDuration"))).toString());

    $("#muteButton").get(0).addEventListener("click", function () {
        $.setCookie("muted", $.getCookie("muted") === "true" ? "false" : "true", 30);
    });

    $("#slideshowButton").get(0).addEventListener("click", function () {
        $.setCookie("slideshow", $.getCookie("slideshow") === "true" ? "false" : "true", 30);
    });

    $("#slideLength").get(0).addEventListener("change", function () {
        $.setCookie("slideDuration", parseInt($("#slideLength").val()).toString(), 30);
    });
    
});