$(document).ready(function () {
    var moveSlideTimeout;
    var currentSlideDuration = 10000;

    function getDuration() {
        if ($.getCookie("slideDuration") == 0)
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
            $("#audio.active").animate({ volume: 1 }, 2000, 'swing', function () {
                    $(this).get(0).play();
            });

        } else {
            $(this).addClass("active");
            $.setCookie("muted", "true", 30);
            $("#audio.active").animate({ volume: 0 }, 2000, 'swing', function () {
                $(this).get(0).pause();
                $(this).get(0).currentTime = 0;
            });
        }
    });

    $("#slideLength").change(function () {
        $.setCookie("slideDuration", (parseInt($("#slideLength").val()) * 1000).toString(), 30);
    });

    $('#fullpage').fullpage({
        verticalCentered: true,
        fitToSection: true,
        anchors: ['mainSection'],
        afterLoad: function (anchorLink, index) {
            var loadedSection = $(this);
            var image = loadedSection.find("#photo");
            currentSlideDuration = loadedSection.find("#slideDuration").val() * 1000;
            image.on('load', function () {
                $(this).fadeIn();
                loadedSection.find('#loader').fadeOut();
                var audio = loadedSection.find("#audio");
                audio.addClass("active");
                if (audio[0].hasAttribute('data-autoplay') && typeof audio[0].play === 'function') {
                    audio.animate({ volume: 1 }, 2000, 'swing', function () {
                        if ($.getCookie("muted") === "false")
                            audio[0].play();
                    });
                }
                setMoveSlideTimeout();
            });

            if (image[0].complete) {
                image.trigger('load');
            }

            $("#slidethumb-" + (index)).addClass("active");
        },
        afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
            var loadedSlide = $(this);
            var image = loadedSlide.find("#photo");
            currentSlideDuration = loadedSlide.find("#slideDuration").val() * 1000;

            image.on('load', function () {
                $(this).fadeIn();
                loadedSlide.find('#loader').fadeOut();
                var audio = loadedSlide.find("#audio");
                audio.addClass("active");
                if (audio[0].hasAttribute('data-autoplay') && typeof audio[0].play === 'function') {
                    audio.animate({ volume: 1 }, 2000, 'swing', function () {
                        if ($.getCookie("muted") === "false")
                            audio[0].play();
                    });
                }
                setMoveSlideTimeout();
            });

            if (image[0].complete) {
                image.trigger('load');
            }

            $("#slidethumb-" + (slideIndex + 1)).addClass("active");
            $("#slidesNav").animate({
                scrollLeft: $("#slidesNav").scrollLeft() + $("#slidethumb-" + (slideIndex + 1)).position().left
                - $("#slidesNav").width() / 2 + $("#slidethumb-" + (slideIndex + 1)).width() / 2
            }, 500);
        },
        onSlideLeave: function (anchorLink, index, slideIndex, direction, nextSlideIndex) {
            var leavingSlide = $(this);
            var audio = leavingSlide.find("#audio");
            audio.removeClass("active");

            $("#slidethumb-" + (slideIndex + 1)).removeClass("active");
        }
    });
});