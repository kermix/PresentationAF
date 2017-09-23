$(document).ready(function () {

    var audioFadeOutTimeout;
    var moveSlideTimeout;
    var currentSlideDuration = 10000;

    function playAudio(audio) {
        if (typeof audio === 'undefined') { audio = $(".fp-section.fp-completely .fp-slide.active audio") }
        if (audio != null) {
            audio.currentTime = 0;
            var isPlaying = audio[0].currentTime > 0 && !audio[0].paused && audio[0].readyState > 2;
            if ($.getCookie("muted") === "false") {
                audio[0].volume = 0;
                clearTimeout(audioFadeOutTimeout);
                if (!isPlaying) {
                    audio[0].play();
                    audio.animate({ volume: 0.5 }, 2000);
                    audioFadeOutTimeout = setTimeout(function () {
                        stopAudio(audio);
                    }, (audio[0].duration * 1000) - 500);
                }
            }
        }
    }

    function stopAudio(audio) {
        if (typeof audio === 'undefined') { audio = $(".fp-section.fp-completely .fp-slide.active audio") }
        if (audio != null) {
            audio.animate({ volume: 0 }, 500, function () {
                audio[0].pause();
                audio[0].currentTime = 0;
            });
        }
        clearTimeout(audioFadeOutTimeout);
    }

    function activeSlideThumb(selector) {
        $("[data-link="+selector+"]").addClass("active");
        $("#slidesNav").animate({
            scrollLeft: $("#slidesNav").scrollLeft() + $("[data-link=" + selector + "]").position().left
            - $("#slidesNav").width() / 2 + $("[data-link=" + selector + "]").width() / 2
        }, 500);
    }

    function deactiveSlideThumb(selector) {
        $("[data-link=" + selector + "]").removeClass("active");
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

    $("#muteButton").on("click", function () {
        if ($.getCookie("muted") === "false") {
            $(this).removeClass("active");
            playAudio();
        } else {
            $(this).addClass("active");
            stopAudio();
        }
    });

    $("#slideshowButton").on("click", function () {
        if ($.getCookie("slideshow") === "true") {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
        setMoveSlideTimeout();
    });

    $("#slideLength").on("change", function () {
        setMoveSlideTimeout();
    });

    $(".photo").on('load', function () {
        var photo = $(this);
        photo.parent().find('#loader').fadeOut(function () {
            photo.fadeIn();
            playAudio();
        });
    });

    $('#fullpage').fullpage({
        verticalCentered: true,
        fitToSection: true,
        anchors: ['mainSection'],
        afterLoad: function (anchorLink, index) {
            var loadedSection = $(this);
            if (loadedSection.attr("data-slideshow").toString() === "true") {
                $("#slideshowControls").fadeIn();
                var image = loadedSection.find(".photo");
                currentSlideDuration = loadedSection.find("#slideDuration").val() * 1000;
                if (image[0].complete) image.trigger('load');
                setMoveSlideTimeout();
                $("[data-link]").removeClass("active");
                activeSlideThumb(loadedSection.find(".slide.active").attr("data-anchor"));
            }
            else {
                $("#slideshowControls").fadeOut();
                clearTimeout(moveSlideTimeout);
            }
        },

        onLeave: function (index, nextIndex, direction) {
            var leavingSection = $(this);
            stopAudio();
            clearTimeout(moveSlideTimeout);
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
            leavingSlide.find(".photo").fadeOut(function () {
                if (leavingSlide.find(".photo").get(0).getAttribute('src')) {
                    leavingSlide.find(".photo").get(0).setAttribute('data-src',
                        leavingSlide.find(".photo").get(0).getAttribute('src'));
                    leavingSlide.find(".photo").get(0).removeAttribute('src');
                }
                leavingSlide.find("#loader").fadeIn();
            });
            stopAudio();
            clearTimeout(moveSlideTimeout);
            deactiveSlideThumb(leavingSlide.attr('data-anchor'));
        }
    });
});