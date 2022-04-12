import gsap from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin.js";
import request from "oc-request";
import Bouncer from "formbouncerjs";
import * as LottiePlayer from "@lottiefiles/lottie-player";
import create from "@lottiefiles/lottie-interactivity";

function isTouchScreenDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints;
}

// Cursor

(function () {
    const cursorGroup = document.querySelector(".cursor"),
        cursor = document.querySelector(".cursor-pointer"),
        follows = document.querySelectorAll(".cursor-follow"),
        links = document.querySelectorAll("a"),
        buttons = document.querySelectorAll("button");

    if (isTouchScreenDevice()) {
        return;
    } else {
        cursorGroup.style.display = "block";
    }

    gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50
    });

    gsap.set(follows, {
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        opacity: 0
    });

    let xTo = gsap.quickTo(cursor, "x", {duration: 0.2, ease: "power3"}),
        yTo = gsap.quickTo(cursor, "y", {duration: 0.2, ease: "power3"});

    function onMouseHover() {
        gsap.to(cursor, {
            rotate: 90
        });
    }

    function onMouseHoverOut() {
        gsap.to(cursor, {
            rotate: 0
        });
    }

    window.addEventListener("mousemove", e => {

        let mapper = gsap.utils.mapRange(0, 20, 0, 1);
        let speed = Math.abs(e.movementX) + Math.abs(e.movementY)
        let mappedSpeed = mapper(speed);
        let scale = gsap.utils.clamp(1, 0)
        let opacity = gsap.utils.clamp(0, 1)

        xTo(e.clientX);
        yTo(e.clientY);

        gsap.to(follows, {
            duration: 0.2,
            overwrite: "auto",
            x: e.clientX,
            y: e.clientY,
            stagger: 0.1,
            ease: "none"
        });

        gsap.to(follows, {
            ease: "none",
            duration: 0.3,
            overwrite: "auto",
            stagger: 0.1,
            opacity: opacity(mappedSpeed),
            scale: scale(mappedSpeed)
        });
    });
    links.forEach(el => {
        el.addEventListener("mouseenter", onMouseHover);
        el.addEventListener("mouseleave", onMouseHoverOut);
    });
    buttons.forEach(el => {
        el.addEventListener("mouseenter", onMouseHover);
        el.addEventListener("mouseleave", onMouseHoverOut);
    });
})();

// Auto resize textarea

function autoResizeTextarea(querySelector, options) {
    let config = {
        maxHeight: Infinity,
    };
    for (let option in options) {
        config[option] = options[option];
    }
    forEachElement(querySelector);

    function elementHeight(element) {
        return parseFloat(getComputedStyle(element, null).height.replace("px", ""));
    }

    function initInternal(element) {
        let initialDisplay = element.style.display;
        element.style.display = "block"; // prevent display="none"
        element.autoResizeTextarea.initialHeight = elementHeight(element);
        element.autoResizeTextarea.initialScrollHeight = parseFloat(element.scrollHeight);
        if (element.autoResizeTextarea.initialScrollHeight > element.autoResizeTextarea.initialHeight) {
            element.autoResizeTextarea.initialHeight = element.autoResizeTextarea.initialScrollHeight + 2;
        }
        element.style.height = element.autoResizeTextarea.initialHeight + "px";
        element.style.display = initialDisplay;
    }

    function init(element) {
        element.autoResizeTextarea = {};
        initInternal(element);
        updateElement(element);
        if (!element.autoResizeTextarea.initialHeight) {
            // try again, element might take longer to render
            setTimeout(function () {
                initInternal(element);
                updateElement(element);
            }, 500);
        }
    }

    function updateElement(element) {
        element.style.height = element.autoResizeTextarea.initialHeight + "px";
        let newHeight =
            element.autoResizeTextarea.initialHeight +
            element.scrollHeight -
            element.autoResizeTextarea.initialScrollHeight;
        newHeight = Math.max(newHeight, element.autoResizeTextarea.initialHeight);
        element.style.height = Math.min(newHeight, config.maxHeight) + "px";
    }

    function forEachElement(element) {
        init(element);
        element.addEventListener("input", function () {
            updateElement(element);
        });
    }
}

window.autoResizeTextarea = autoResizeTextarea;

// Form validate

(function () {
    let validate = new Bouncer(".form");

    document.querySelectorAll(".form").forEach((el) => {
        el.onreset = () => {
            validate.destroy();
            validate = new Bouncer(".form");
        };
    });
})();

// Lottie

document.addEventListener("DOMContentLoaded", function () {
    const aboutWaveLotties = document.querySelectorAll("[data-lottie=aboutWave]");
    if (aboutWaveLotties) {
        aboutWaveLotties.forEach((el) => {
            create({
                player: el,
                mode: "scroll",
                actions: [
                    {
                        visibility: [0, 1.0],
                        type: "seek",
                        frames: [0, 19],
                    },
                ],
            });
        });
    }

    const formTwistLotties = document.querySelectorAll("[data-lottie=formTwist]");
    if (formTwistLotties) {
        formTwistLotties.forEach((el) => {
            create({
                player: el,
                mode: "scroll",
                actions: [
                    {
                        visibility: [0, 1.0],
                        type: "loop",
                        frames: [0, 16],
                    },
                ],
            });
        });
    }
});

// Toggle dark mode

(function () {
    const themeToggleBtn = document.querySelector("[data-toggle-theme]");

    themeToggleBtn.addEventListener("click", function () {

        // if set via local storage previously
        if (localStorage.getItem("color-theme")) {
            if (localStorage.getItem("color-theme") === "light") {
                document.documentElement.classList.add("dark");
                localStorage.setItem("color-theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("color-theme", "light");
            }
        } else {
            if (document.documentElement.classList.contains("dark")) {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("color-theme", "light");
            } else {
                document.documentElement.classList.add("dark");
                localStorage.setItem("color-theme", "dark");
            }
        }

    });
})();

// Add css variables

(function () {
    const setRealHeight = () => {
        const doc = document.documentElement;
        doc.style.setProperty("--vh", `${window.innerHeight}px`);
    };
    // window.addEventListener('resize', setRealHeight);
    setRealHeight();

    const setHeaderHeight = () => {
        const header = document.getElementById("header").offsetHeight;
        document.documentElement.style.setProperty("--header", `${header}px`);
    };
    window.addEventListener("resize", setHeaderHeight);
    setHeaderHeight();
})();

// Text slide animation

(function () {
    const slides = document.querySelectorAll(".slide-text");

    if (!slides) return;

    slides.forEach((el) => {
        let targets = gsap.utils.toArray(el.querySelectorAll("span"));
        gsap.set(targets, {autoAlpha: 1});
        let dur = 0.15;
        let hold = el.dataset.slideDelay ? +el.dataset.slideDelay : 4;

        targets.forEach((obj, i) => {
            let tl = gsap.timeline({
                delay: dur * i + hold * i,
                repeat: -1,
                repeatDelay: (targets.length - 1) * (dur + hold) - dur,
                defaults: {
                    ease: "none",
                    duration: dur,
                },
            });
            tl.from(obj, {yPercent: -50, opacity: 0});
            tl.to(obj, {yPercent: 50, opacity: 0}, "+=" + hold);
        });
    });
})();

// Scroll to

gsap.registerPlugin(ScrollToPlugin);

(function () {
    function getSamePageAnchor(link) {
        if (
            link.protocol !== window.location.protocol ||
            link.host !== window.location.host ||
            link.pathname !== window.location.pathname ||
            link.search !== window.location.search
        ) {
            return false;
        }

        return link.hash;
    }

    function scrollToHash(hash, e) {
        const elem = hash ? document.querySelector(hash) : false;
        if (elem) {
            if (e) e.preventDefault();
            gsap.to(window, {duration: 1, scrollTo: elem, ease: "power2"});
        }
    }

    document.querySelectorAll("a[href]").forEach(a => {
        a.addEventListener("click", e => {
            scrollToHash(getSamePageAnchor(a), e);
        });
    });

    scrollToHash(window.location.hash);
})();

// Switch images

(function () {
    const galleries = document.querySelectorAll("[data-switch-images]");

    if (!galleries)
        return

    galleries.forEach((el) => {
        let elements = el.querySelectorAll("img");
        let index = 0;
        let interval = null;

        if (!elements && isTouchScreenDevice())
            return

        let glowFunc = () => {
            if (elements.length <= 0) {
                index = 0;
                return;
            }
            index %= elements.length;
            elements[(elements.length + index - 1) % elements.length].style.visibility = "hidden";
            elements[index].style.visibility = "visible";
            ++index;
        };

        el.addEventListener("mouseenter", () => {
            glowFunc();
            interval = setInterval(glowFunc, 250);
        }, false);

        el.addEventListener("mouseleave", () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }, false);
    });
})();

// Links with bg image

(function () {
    const links = document.querySelectorAll("[data-image-links] a");

    if (!links && isTouchScreenDevice())
        return

    links.forEach((el) => {

        const image = el.querySelector("img");

        if (!image)
            return

        const setX = gsap.quickSetter(image, "x", "px"),
            setY = gsap.quickSetter(image, "y", "px"),
            align = e => {
                const top = el.getBoundingClientRect().top;
                const left = el.getBoundingClientRect().left;
                setX(e.clientX - left);
                setY(e.clientY - top);
            },
            startFollow = () => document.addEventListener("mousemove", align),
            stopFollow = () => document.removeEventListener("mousemove", align),
            fade = gsap.to(image, {
                duration: 0.2,
                autoAlpha: 1,
                ease: "none",
                paused: true,
                onReverseComplete: stopFollow
            }),
            fadeCursor = gsap.to(".cursor", {
                duration: 0.1,
                opacity: 0,
                ease: "none",
                paused: true,
                onReverseComplete: () => gsap.set(".cursor", { clearProps: "opacity" })
            });

        el.addEventListener("mouseenter", (e) => {
            fade.play();
            fadeCursor.play();
            startFollow();
            align(e);
        });

        el.addEventListener("mouseleave", () => {
            fade.reverse();
            fadeCursor.reverse();
        });

    });
})();

// October CMS - Contact form

// (function () {
//     const contactsForms = document.querySelectorAll(".form");
//
//     contactsForms.forEach((el) => {
//         el.addEventListener("submit", function (e) {
//             e.preventDefault();
//
//             request.sendForm(el, "emptyForm::onFormSubmit", {
//                 success: (result) => {
//                     el.reset();
//                 },
//             });
//         });
//     });
// })();
