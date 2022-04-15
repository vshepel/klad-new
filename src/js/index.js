import gsap from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin.js";
import {ScrollTrigger} from "gsap/ScrollTrigger.js";
import request from "oc-request";
import Bouncer from "formbouncerjs";
import lottie from "lottie-web";
import create from "@lottiefiles/lottie-interactivity";


gsap.registerPlugin(ScrollToPlugin);
gsap.registerPlugin(ScrollTrigger);

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

const ScrollLottie = (obj) => {
    let anim = lottie.loadAnimation({
        container: obj.target,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: obj.path,
        rendererSettings: {
            progressiveLoad: true
        }
    });

    let timeObj = {currentFrame: 0}
    let endString = (obj.speed === "slow") ? "+=2000" : (obj.speed === "medium") ? "+=1000" : (obj.speed === undefined) ? "+=1250" : "+=500";
    ScrollTrigger.create({
        trigger: obj.target.closest("section"),
        scrub: true,
        start: "-=1000",
        end: endString,
        onUpdate: self => {
            if (obj.duration) {
                gsap.to(timeObj, {
                    duration: obj.duration,
                    currentFrame: (Math.floor(self.progress * (anim.totalFrames - 1))),
                    onUpdate: () => {
                        anim.goToAndStop(timeObj.currentFrame, true)
                    },
                    ease: "expo"
                })
            } else {
                anim.goToAndStop(self.progress * (anim.totalFrames - 1), true)
            }
        }
    });
}

(function () {
    const getLottiePath = (path, toggleTheme = true) => {
        let theme = "";

        if (
            toggleTheme &&
            localStorage.getItem("color-theme") === "dark" ||
            (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            theme = "-dark"
        }

        return `${path + theme}.json`
    }
    const setLottiePath = (themeName) => {
        // lottie.destroy();
        // loadLotties();
    }
    const loadLotties = () => {
        const aboutWave = document.getElementById("aboutWave");
        const formTwist = document.getElementById("formTwist");
        const aboutBarcode = document.getElementById("aboutBarcode");

        if (aboutWave) {
            ScrollLottie({
                target: aboutWave,
                path: getLottiePath(aboutWave.dataset.animationPath),
                duration: 4,
                speed: "medium"
            });
        }

        if (formTwist) {
            lottie.loadAnimation({
                container: formTwist,
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: getLottiePath(formTwist.dataset.animationPath),
                name: "formTwist",
                rendererSettings: {
                    progressiveLoad: true
                }
            });
        }

        if (aboutBarcode) {
            lottie.loadAnimation({
                container: aboutBarcode,
                renderer: "svg",
                loop: true,
                autoplay: false,
                path: getLottiePath(aboutBarcode.dataset.animationPath, false),
                name: "aboutBarcode",
                rendererSettings: {
                    preserveAspectRatio: "none",
                    progressiveLoad: true
                }
            });
        }
    }

    loadLotties();

    document.addEventListener("themeChanged", evt => {
        setLottiePath(evt.value)
    }, false);
})();

// Toggle dark mode

(function () {
    const themeToggleBtn = document.querySelector("[data-toggle-theme]");

    themeToggleBtn.addEventListener("click", function () {

        const originalSetItem = localStorage.setItem;
        let themeChangedEvent;

        localStorage.setItem = function (key, value) {
            if (!themeChangedEvent) {
                themeChangedEvent = new Event("themeChanged");

                themeChangedEvent.value = value;
                themeChangedEvent.key = key;

                document.dispatchEvent(themeChangedEvent);
            }

            originalSetItem.apply(this, arguments);
        };

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
    const slides = document.querySelectorAll("[data-slide-text]");

    if (!slides) return;

    slides.forEach((el) => {
        const targets = gsap.utils.toArray(el.querySelectorAll("span"));
        const dur = el.dataset.slideDuration ? +el.dataset.slideDuration : 0.15;
        const hold = el.dataset.slideDelay ? +el.dataset.slideDelay : 4;
        const isHorizontal = el.dataset.slideText === "x";
        const isLottieSync = el.dataset.slideLottie;

        gsap.set(targets, {autoAlpha: 1});

        targets.forEach((obj, i) => {
            let tl = gsap.timeline({
                delay: dur * i + hold * i,
                repeat: -1,
                repeatDelay: (targets.length - 1) * (dur + hold) - dur,
                defaults: {
                    ease: "none",
                    duration: dur,
                }
            });
            if (isHorizontal) {
                tl.from(obj, {xPercent: -50, opacity: 0});
                tl.to(obj, {
                    xPercent: 50,
                    opacity: 0,
                    onStart: () => {
                        if (isLottieSync) {
                            lottie.play("aboutBarcode");
                        }
                    },
                    onComplete: () => {
                        setTimeout(el => {
                            lottie.stop("aboutBarcode");
                        }, 800)
                    }
                }, "+=" + hold);
            } else {
                tl.from(obj, {yPercent: -50, opacity: 0});
                tl.to(obj, {yPercent: 50, opacity: 0}, "+=" + hold);
            }
        });
    });
})();

// Scroll to

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

const utils = {
    scrollToSection(el, delay) {
        const header = document.getElementById("header"),
            headerIsSticky = header.classList.contains("is-sticky"),
            headerOffset = headerIsSticky ? header.offsetHeight : 0;

        gsap.to(window, {duration: 0.5, delay: delay, scrollTo: {y: el, offsetY: headerOffset}, ease: "power2"});
    }
}

window.utils = utils;

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
                onReverseComplete: () => gsap.set(".cursor", {clearProps: "opacity"})
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

// Project 3d animation

(function () {
    const project3d = document.querySelectorAll("[data-project-3d]");

    if (!project3d)
        return

    project3d.forEach(el => {
        gsap.to(el, {
            yPercent: -20,
            rotate: 15,
            ease: "none",
            scrollTrigger: {
                scrub: 1.5
            }
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
