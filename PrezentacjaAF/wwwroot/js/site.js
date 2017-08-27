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
        $.setCookie("slideDuration", ($("#slideLength").val() * 1000).toString(), 30);
    else
        $("#slideLength").val(parseInt(($.getCookie("slideDuration")) / 1000).toString());

});