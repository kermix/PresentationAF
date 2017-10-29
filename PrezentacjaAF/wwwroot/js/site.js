$(document).ready(function () {

    if (!($.getCookie("isMuted"))) {
        $.setCookie("isMuted", "false", 30);
    }
    else if ($.getCookie("isMuted") === "true") {
        $("#volumeSlider").hide();
        $("#muteButton").addClass("active");
    }

    if (!($.getCookie("isSlideshow")))
        $.setCookie("isSlideshow", "true", 30);
    else if ($.getCookie("isSlideshow") === "false")
        $("#slideshowButton").addClass("active");

    if (!($.getCookie("slideDuration")))
        $.setCookie("slideDuration", "0", 30);
    else
        $("#slideLength").val(parseInt(($.getCookie("slideDuration"))).toString());

    if (!($.getCookie("slideVolume")))
        $.setCookie("slideVolume", "50", 30);
});