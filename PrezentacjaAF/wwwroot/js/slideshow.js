$(document).ready(function () {

    var audioFadeOutTimeout;
    var moveSlideTimeout;
    var currentSlideDuration = 10000;

    function playAudio() {
        var slide = $(".fp-section.fp-completely .fp-slide.active");
        if (slide.length) {
            var audio = $(slide).find('audio');
            var elementNode = $(audio);
            var element = $(elementNode).get(0);
            if (element !== null && typeof element !== 'undefined' && element.hasAttribute('data-autoplay') && typeof element.play === 'function') {
                if ($.getCookie("muted") === "false") {
                    element.volume = 0;
                    clearTimeout(audioFadeOutTimeout);
                    element.play();
                    elementNode.animate({ volume: 0.3 }, 2000, function () {
                        audio.addClass("active");
                    });
                    audioFadeOutTimeout = setTimeout(function () {
                        stopAudio();
                    }, currentSlideDuration - 1000);

                }
            }
        }
    }

    function stopAudio() {
        var audio = $('audio.active');
        if (audio.length > 0) {
            audio.each(function (i, element) {
                if (element[0] !== null &&
                    typeof element !== 'undefined' &&
                    element.hasAttribute('data-autoplay') &&
                    typeof element.pause === 'function') {
                    $(element).animate({ volume: 0 }, 500, function () {
                        element.pause();
                        element.currentTime = 0;
                    });
                }
            });
        }
        audio.removeClass("active");
        clearTimeout(audioFadeOutTimeout);
    }

    function activeSlideThumb(selector) {
        $("[data-link=" + selector + "]").addClass("active");
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
                $.fn.fullpage.moveSlideRight();
            },
                parseInt($("#slideLength").val()) === 0 ?
                    ($.getCookie("muted") === "false" ?
                        currentSlideDuration : 15000) : parseInt($("#slideLength").val()));
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
        setMoveSlideTimeout();
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

    function getDataAnchors() {
        var anchors = new Array();
        $(".section").each(function () {
            anchors.push($(this).attr("data-anchor"));
        });
        return anchors;
    }

    $('#fullpage').fullpage({
        verticalCentered: true,
        fitToSection: true,
        anchors: getDataAnchors(),
        afterRender: function () {
            $("#muteButton").get(0).addEventListener("click", function () {
                $.setCookie("muted", $.getCookie("muted") === "true" ? "false" : "true", 30);
            });

            $("#slideshowButton").get(0).addEventListener("click", function () {
                $.setCookie("slideshow", $.getCookie("slideshow") === "true" ? "false" : "true", 30);
            });

            $("#slideLength").get(0).addEventListener("change", function () {
                $.setCookie("slideDuration", parseInt($("#slideLength").val()).toString(), 30);
            });

            $("#volumeSlider").slider({
                value: parseInt($.getCookie("slideVolume")),
                step: 1,
                range: 'min',
                min: 0,
                max: 100,
                slide: function () {
                    var value = $("#volumeSlider").slider("value");
                    $("audio.active").each(function (i, el) { el.volume = (value / 100) });
                },
                change: function () {
                    var value = $("#volumeSlider").slider("value");
                    $.setCookie("slideVolume", value.toString(), 30);
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