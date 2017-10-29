$(document).ready(function () {

    var moveSlideTimeout;
    var currentSlideDuration;

    function getDataAnchors() {
        var anchors = new Array();
        $(".section").each(function () {
            anchors.push($(this).attr("data-anchor"));
        });
        return anchors;
    }

    function activeSlideThumb(selector) {
        $("[data-link=" + selector + "]").addClass("active");
        $("#slidesNav").scrollTo($("[data-link=" + selector + "]"), 200, {
            offset: {
                left: -(($("#slidesNav").width() - $("[data-link=" + selector + "]").width()) / 2)
            }
        });
    }

    function deactiveSlideThumb(selector) {
        $("[data-link=" + selector + "]").removeClass("active");
    }

    function setMoveSlideTimeout() {
        clearTimeout(moveSlideTimeout);
        if ($.getCookie("isSlideshow") === "true") {
            moveSlideTimeout = setTimeout(function () {
                $.fn.fullpage.moveSlideRight();
            },
                parseInt($("#slideLength").val()) === 0 ?
                    $.getCookie("isMuted") === "false" ?
                        currentSlideDuration : 15000 : parseInt($("#slideLength").val()));
        }
    }

    $("audio").onplay = function () {
        $(this).animate({ volume: 0 }, (($(this).duration - $(this).currentTime)) * 1000 - 1000);
    };

    $('#fullpage').fullpage({
        verticalCentered: true,
        fitToSection: true,
        anchors: getDataAnchors(),
        scrollOverflow: true,
        afterRender: function () {
            $("#muteButton").on("click", function () {
                $.setCookie("isMuted", $.getCookie("isMuted") === "true" ? "false" : "true", 30);
                $("#volumeSlider").fadeToggle();
                $(this).toggleClass("active");
                if ($.getCookie("isMuted") === "false")
                    $("audio").animate({ volume: parseInt($.getCookie("slideVolume")) / 100 }, 2000);
                else
                    $("audio").animate({ volume: 0 }, 2000);
            });

            $("#slideshowButton").on("click", function () {
                $.setCookie("isSlideshow", $.getCookie("isSlideshow") === "true" ? "false" : "true", 30);
                $(this).toggleClass("active");
                setMoveSlideTimeout();
            });

            $("#slideLength").on("change", function () {
                $.setCookie("slideDuration", parseInt($("#slideLength").val()).toString(), 30);
                setMoveSlideTimeout();
            });

            $(".photo").on('load', function () {
                var photo = $(this);
                photo.parent().find('#loader').fadeOut(function () {
                    photo.fadeIn();
                });
            });

            $("#volumeSlider").slider({
                value: parseInt($.getCookie("slideVolume")),
                step: 1,
                range: 'min',
                min: 0,
                max: 100,
                slide: function () {
                    var value = $("#volumeSlider").slider("value");
                    $("audio").each(function (i, el) { el.volume = value / 100; });
                },
                change: function () {
                    var value = $("#volumeSlider").slider("value");
                    $.setCookie("slideVolume", value.toString(), 30);
                    volumeLevel = value;
                }
            });


        },
        afterLoad: function (anchorLink, index) {
            var loadedSection = $(this);
            if (loadedSection.attr("data-slideshow").toString() === "true") {
                $("#slideshowControls").fadeIn();
                var image = loadedSection.find(".photo");
                currentSlideDuration = loadedSection.find("#slideDuration").val() * 1000;
                if (image[0].complete) image.trigger('load');
                $("[data-link]").removeClass("active");
                activeSlideThumb(loadedSection.find(".slide.active").attr("data-anchor"));
                setMoveSlideTimeout();
            } else {
                $("#slideshowControls").fadeOut();
                clearTimeout(moveSlideTimeout);
            }
        },

        afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
            var loadedSlide = $(this);
            var image = loadedSlide.find(".photo");
            currentSlideDuration = loadedSlide.find("#slideDuration").val() * 1000;
            if (image[0].complete) image.trigger('load');
            activeSlideThumb(loadedSlide.attr('data-anchor'));
            setMoveSlideTimeout();
        },

        onSlideLeave: function (anchorLink, index, slideIndex, direction, nextSlideIndex) {
            var leavingSlide = $(this);
            deactiveSlideThumb(leavingSlide.attr('data-anchor'));
        }
    });
});