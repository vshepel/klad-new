import gsap from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin.js";
import request from "oc-request";
import Bouncer from "formbouncerjs";
import * as LottiePlayer from "@lottiefiles/lottie-player";
import create from "@lottiefiles/lottie-interactivity";

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
    if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    document.querySelector("[data-toggle-dark]").onclick = () => {
        if (localStorage.theme === "dark") {
            localStorage.theme = "light";
            document.documentElement.classList.remove("dark");
        } else {
            localStorage.theme = "dark";
            document.documentElement.classList.add("dark");
        }
    };
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

        function isTouchScreenDevice() {
            return "ontouchstart" in window || navigator.maxTouchPoints;
        }

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
