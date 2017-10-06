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

    if (!($.getCookie("slideVolume")))
        $.setCookie("slideVolume", "40", 30);    
});