$(document).ready(function () {

    var audioFadeOutTimeout;
    var moveSlideTimeout;
    var currentSlideDuration = 10000;
    var volumeLevel = parseInt($.getCookie("slideVolume"));

    function playAudio(slide) {
        if (slide.length) {
            var audio = $(slide).find('audio');
            var elementNode = $(audio);
            var element = $(elementNode).get(0);
            if (element !== null && typeof element !== 'undefined' && element.hasAttribute('data-autoplay') && typeof element.play === 'function') {
                if ($.getCookie("muted") === "false") {
                    element.volume = 0;
                    clearTimeout(audioFadeOutTimeout);
                    element.play();
                    elementNode.animate({ volume: volumeLevel / 100 }, 2000, function () {
                        audio.addClass("active");
                    });
                    audioFadeOutTimeout = setTimeout(function () {
                        stopAudio();
                    }, currentSlideDuration - 1000);
                }
            }
        }
    }

    function stopAudio(slide) {
        if (slide.length) {
            var audio = $(slide).find('audio');
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
            $("#muteButton").on("click", function () {
                $.setCookie("muted", $.getCookie("muted") === "true" ? "false" : "true", 30);
                $("#volumeSlider").fadeToggle();
                $(this).toggleClass("active");
                if ($.getCookie("muted") === "false")
                    playAudio($(".slide.active"));
                else
                    stopAudio($(".slide.active"));
                setMoveSlideTimeout();
            });

            $("#slideshowButton").on("click", function () {
                $.setCookie("slideshow", $.getCookie("slideshow") === "true" ? "false" : "true", 30);
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
                    $("audio.active").each(function (i, el) { el.volume = (value / 100) });  
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
                playAudio(loadedSection.find(".slide.active"));
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
            stopAudio(leavingSection.find(".slide.active"));
            clearTimeout(moveSlideTimeout);
        },

        afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
            var loadedSlide = $(this);
            var image = loadedSlide.find(".photo");
            currentSlideDuration = loadedSlide.find("#slideDuration").val() * 1000;
            if (image[0].complete) image.trigger('load');
            activeSlideThumb(loadedSlide.attr('data-anchor'));
            playAudio(loadedSlide);
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
            stopAudio(leavingSlide);
            clearTimeout(moveSlideTimeout);
            deactiveSlideThumb(leavingSlide.attr('data-anchor'));
        }
    });
});