$(document).ready(function () {

    var audioFadeOutTimeout;
    var moveSlideTimeout;
    var currentSlideDuration = 10000;

    function playAudio(audio) {
        if (typeof audio === 'undefined') { audio = $(".fp-slide.active audio") }
        if ($.getCookie("muted") === "false") {
            audio[0].volume = 0;
            audio[0].play();
            audio.animate({ volume: 0.5 }, 2000);
            clearTimeout(audioFadeOutTimeout);
            audioFadeOutTimeout = setTimeout(function () {
                stopAudio(audio);
            }, (audio[0].duration * 1000) - 500);
        }
    }
    function stopAudio(audio) {
        if (typeof audio === 'undefined') { audio = $(".fp-slide.active audio") }
        audio.animate({ volume: 0 }, 500, function () {
            audio[0].pause();
            audio[0].currentTime = 0;
        });
        clearTimeout(audioFadeOutTimeout);
    }
    function activeSlideThumb(i) {
        $("#slidethumb-" + (i + 1)).addClass("active");
        $("#slidesNav").animate({
            scrollLeft: $("#slidesNav").scrollLeft() + $("#slidethumb-" + (i + 1)).position().left
            - $("#slidesNav").width() / 2 + $("#slidethumb-" + (i + 1)).width() / 2
        }, 500);
    }
    function setMoveSlideTimeout() {
        clearTimeout(moveSlideTimeout);
        if ($.getCookie("slideshow") === "true") {
            moveSlideTimeout = setTimeout(function () {
                $.fn.fullpage.moveSlideRight()
            },
                parseInt($("#slideLength").val()) == 0 ? currentSlideDuration :
                    parseInt($("#slideLength").val()));
        }
    }

    $("#muteButton").get(0).addEventListener("click", function () {
        if ($.getCookie("muted") === "false") {
            $(this).removeClass("active");
            playAudio();
        } else {
            $(this).addClass("active");
            stopAudio();
        }
    });

    $("#slideshowButton").get(0).addEventListener("click", function () {
        if ($.getCookie("slideshow") === "true") {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
        setMoveSlideTimeout();
    });

    $("#slideLength").get(0).addEventListener("change", function () {
        setMoveSlideTimeout();
    });

    $(".photo").each(function (i, el) {
        $(el).on('load', function () {
            var photo = $(this);
            photo.parent().find('#loader').fadeOut(function () {
                photo.fadeIn();
                playAudio(photo.parent().find(".audio"));
            });
        });
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
            setMoveSlideTimeout()
        },

        afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
            var loadedSlide = $(this);
            var image = loadedSlide.find(".photo");
            currentSlideDuration = loadedSlide.find("#slideDuration").val() * 1000;
            if (image[0].complete) image.trigger('load');
            activeSlideThumb(slideIndex);
            setMoveSlideTimeout()
        },

        onSlideLeave: function (anchorLink, index, slideIndex, direction, nextSlideIndex) {
            var leavingSlide = $(this);
            stopAudio(leavingSlide.find(".audio"));
            leavingSlide.find(".photo").fadeOut(function () { leavingSlide.find("#loader").fadeIn(); });
            $("#slidethumb-" + (slideIndex + 1)).removeClass("active");
            clearTimeout(moveSlideTimeout);
        }
    });
});