$(document).ready(function () {
    var moveSlideTimeout;
    var audioFadeOutTimeout;
    var currentSlideDuration = 10000;

    function getDuration() {

        if ($.getCookie("slideDuration") == 0 || ($.getCookie("slideshow") === "false" && $.getCookie("slideDuration") != 0))
            return currentSlideDuration;
        else
            return parseInt(($.getCookie("slideDuration")));
    }

    function setMoveSlideTimeout() {
        clearTimeout(moveSlideTimeout);
        if ($.getCookie("slideshow") === "true") {
            moveSlideTimeout = setTimeout(function () {
                $.fn.fullpage.moveSlideRight()
            },
                getDuration());
        }
    }

    function activeSlideThumb(i) {
        $("#slidethumb-" + (i + 1)).addClass("active");
        $("#slidesNav").animate({
            scrollLeft: $("#slidesNav").scrollLeft() + $("#slidethumb-" + (i + 1)).position().left
            - $("#slidesNav").width() / 2 + $("#slidethumb-" + (i + 1)).width() / 2
        }, 500);
    }

    $("#slideshowButton").on('click', function () {
        if ($.getCookie("slideshow") === "true") {
            $(this).addClass("active");
            $.setCookie("slideshow", "false", 30);
        } else {
            $(this).removeClass("active");
            $.setCookie("slideshow", "true", 30);
        }
        setMoveSlideTimeout();
    });

    $("#muteButton").on('click', function () {
        if ($.getCookie("muted") === "true") {
            $(this).removeClass("active");
            $.setCookie("muted", "false", 30);
            $("#audio.active").get(0).play();

        } else {
            $(this).addClass("active");
            $.setCookie("muted", "true", 30);
            $("#audio.active").animate({ volume: 0 }, 2000, 'swing', function () {
                $(this).get(0).pause();
            });
        }
    });

    $("#slideLength").change(function () {
        $.setCookie("slideDuration", (parseInt($("#slideLength").val()) * 1000).toString(), 30);
    });

    $(".photo").each(function (i, el) {
        $(el).on('load', function () {
            $(this).fadeIn();
            $(this).parent().find('#loader').fadeOut();
            var audio = $(this).parent().find("#audio");
            audio.addClass("active");
            if (audio[0].hasAttribute('data-autoplay') && typeof audio[0].play === 'function') {
                if ($.getCookie("muted") === "false") {
                    audio.get(0).play();
                }
            }
            setMoveSlideTimeout();
        });
    }) 

    $("#audio").each(function (i, el) {
        $(el).on('play', function () {
            audio = $(this)
            if ($.getCookie("muted") === "false") {
                audio.volume = 0;
                audio.animate({ volume: 0.5 }, 2000, 'swing');
                clearTimeout(audioFadeOutTimeout);
                audioFadeOutTimeout = setTimeout(function () {
                    audio.animate({ volume: 0 }, 2000, 'swing', function () { audio.get(0).pause(); })
                }, getDuration() - 2000);
            }
        })  

        $(el).on('pause', function () {
            audio = $(this);
            clearTimeout(audioFadeOutTimeout);
            audio.volume = 0;
            audio.get(0).currentTime = 0;
        })
    })    

    $('#fullpage').fullpage({
        verticalCentered: true,
        fitToSection: true,
        anchors: ['mainSection'],
        afterLoad: function (anchorLink, index) {
            var loadedSection = $(this);
            var image = loadedSection.find(".photo");
            currentSlideDuration = loadedSection.find("#slideDuration").val() * 1000;

            if (image[0].complete) image.trigger('load');

            activeSlideThumb(index - 1);
        },

        afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
            var loadedSlide = $(this);
            var image = loadedSlide.find(".photo");
            currentSlideDuration = loadedSlide.find("#slideDuration").val() * 1000;

            if (image[0].complete) image.trigger('load');

            activeSlideThumb(slideIndex)
        },

        onSlideLeave: function (anchorLink, index, slideIndex, direction, nextSlideIndex) {
            var leavingSlide = $(this);
            var audio = leavingSlide.find("#audio");
            audio.removeClass("active");
            $("#slidethumb-" + (slideIndex + 1)).removeClass("active");
        }
    });
});