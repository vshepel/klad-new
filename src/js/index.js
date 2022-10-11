import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin.js";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import request from "oc-request";
import Bouncer from "formbouncerjs";
import lottie from "lottie-web";

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
        buttons = document.querySelectorAll("button"),
        iframes = document.querySelectorAll("iframe");

    if (isTouchScreenDevice()) {
        return;
    } else {
        cursorGroup.style.display = "block";
    }

    gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
    });

    gsap.set(follows, {
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        opacity: 0,
    });

    let xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" }),
        yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

    function onMouseHover() {
        gsap.to(cursor, {
            rotate: 90,
        });
    }

    function onMouseHoverOut() {
        gsap.to(cursor, {
            rotate: 0,
        });
    }

    window.addEventListener("mousemove", (e) => {
        let mapper = gsap.utils.mapRange(0, 20, 0, 1);
        let speed = Math.abs(e.movementX) + Math.abs(e.movementY);
        let mappedSpeed = mapper(speed);
        let scale = gsap.utils.clamp(1, 0);
        let opacity = gsap.utils.clamp(0, 1);

        xTo(e.clientX);
        yTo(e.clientY);

        gsap.to(follows, {
            duration: 0.2,
            overwrite: "auto",
            x: e.clientX,
            y: e.clientY,
            stagger: 0.1,
            ease: "none",
        });

        gsap.to(follows, {
            ease: "none",
            duration: 0.3,
            overwrite: "auto",
            stagger: 0.1,
            opacity: opacity(mappedSpeed),
            scale: scale(mappedSpeed),
        });
    });
    links.forEach((el) => {
        el.addEventListener("mouseenter", onMouseHover);
        el.addEventListener("mouseleave", onMouseHoverOut);
    });
    buttons.forEach((el) => {
        el.addEventListener("mouseenter", onMouseHover);
        el.addEventListener("mouseleave", onMouseHoverOut);
    });
    iframes.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            cursorGroup.style.display = "none";
        });
        el.addEventListener("mouseleave", () => {
            cursorGroup.style.display = "block";
        });
    });

    document.body.onmouseenter = () => {
        cursorGroup.style.display = "block";
    };

    document.body.onmouseleave = () => {
        cursorGroup.style.display = "none";
    };
})();

// Fixed header

(function () {
    let prevScroll = window.scrollY || document.documentElement.scrollTop;
    let curScroll;
    let direction = 0;
    let prevDirection = 0;

    if (window.matchMedia("(min-width: 768px)").matches)
        return

    const header = document.getElementById("header");

    let checkScroll = function () {
        curScroll = window.scrollY || document.documentElement.scrollTop;
        if (curScroll > prevScroll) {
            direction = 2;
        } else if (curScroll < prevScroll) {
            direction = 1;
        }

        toggleHeader(direction, curScroll);

        const isFly = curScroll > header.clientHeight;

        header.classList.toggle("is-fly", isFly);

        prevScroll = curScroll;
    };

    let toggleHeader = function (direction, curScroll) {
        if (direction === 2 && curScroll > header.clientHeight) {
            header.classList.add("is-hide");
            prevDirection = direction;
        } else if (direction === 1) {
            header.classList.remove("is-hide");
        }
    };

    checkScroll();

    window.addEventListener("scroll", checkScroll);

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

// Lottie

(function () {
    let currentLottieTheme = "light";

    const logoKlad = document.getElementById("logo");
    const aboutWave = document.getElementById("aboutWave");
    const formTwist = document.getElementById("formTwist");
    const aboutBarcode = document.getElementById("aboutBarcode");
    const projectsBarcode = document.getElementById("projectsBarcode");

    if (
        localStorage.getItem("color-theme") === "dark" ||
        (!("color-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
        currentLottieTheme = "dark";
    }

    document.addEventListener(
        "themeChanged",
        (e) => {
            if (currentLottieTheme !== e.value) {
                currentLottieTheme = e.value;

                aboutWave.hidden = true;
                formTwist.hidden = true;

                lottie.destroy("aboutWave");

                startLotties();
            }
        },
        false
    );

    const startLotties = (themeName = currentLottieTheme) => {
        if (aboutWave) {
            lottie.loadAnimation({
                container: aboutWave,
                renderer: "canvas",
                loop: false,
                autoplay: false,
                path: themeName === "dark" ? aboutWave.dataset.animationPathDark : aboutWave.dataset.animationPath,
                name: "aboutWave",
                rendererSettings: {
                    scaleMode: "noScale",
                    // preserveAspectRatio: "none",
                    // progressiveLoad: true,
                },
            });

            aboutWave.hidden = false;
        }

        if (formTwist) {
            formTwist.innerHTML = "";

            let mp4 = document.createElement("source");
            mp4.src = `${themeName === "dark" ? formTwist.dataset.pathDark : formTwist.dataset.path}.mp4`;
            mp4.type = "video/mp4";
            formTwist.appendChild(mp4);

            let webm = document.createElement("source");
            webm.src = `${themeName === "dark" ? formTwist.dataset.pathDark : formTwist.dataset.path}.webm`;
            webm.type = "video/webm";
            formTwist.appendChild(webm);

            formTwist.load();
            formTwist.play();

            formTwist.hidden = false;
        }
    };

    startLotties();

    if (logoKlad) {
        const logoKladLottie = lottie.loadAnimation({
            container: logoKlad,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: logoKlad.dataset.animationPath,
            name: "logoKlad",
            rendererSettings: {
                preserveAspectRatio: "none",
                progressiveLoad: true,
            },
        });

        logoKladLottie.addEventListener("data_ready", () => {
            logoKlad.querySelector("img").hidden = true;
            logoKlad.querySelector("svg").classList.add("dark:invert");
        });
    }

    if (aboutWave) {
        document.getElementById("about").addEventListener(
            "click",
            (el) => {
                lottie.goToAndStop(0, true, "aboutWave");
                lottie.play("aboutWave");
            },
            false
        );
    }

    if (aboutBarcode) {
        lottie.loadAnimation({
            container: aboutBarcode,
            renderer: "svg",
            loop: true,
            autoplay: aboutBarcode.dataset.animationAutoplay,
            path: aboutBarcode.dataset.animationPath,
            name: "aboutBarcode",
            rendererSettings: {
                preserveAspectRatio: "none",
                progressiveLoad: true,
            },
        });
    }

    if (projectsBarcode) {
        lottie.loadAnimation({
            container: projectsBarcode,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: projectsBarcode.dataset.animationPath,
            name: "projectsBarcode",
            rendererSettings: {
                preserveAspectRatio: "none",
                progressiveLoad: true,
            },
        });
    }
})();

// Toggle dark mode

(function () {
    const themeToggleBtn = document.querySelector("[data-toggle-theme]");

    themeToggleBtn.addEventListener("click", function () {
        let themeChangedEvent;

        const themeChanged = (key, value) => {
            if (!themeChangedEvent) {
                themeChangedEvent = new Event("themeChanged");

                themeChangedEvent.value = value;
                themeChangedEvent.key = key;

                document.dispatchEvent(themeChangedEvent);
            }
        };

        // if set via local storage previously
        if (localStorage.getItem("color-theme")) {
            if (localStorage.getItem("color-theme") === "light") {
                document.documentElement.classList.add("dark");
                localStorage.setItem("color-theme", "dark");
                themeChanged("color-theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("color-theme", "light");
                themeChanged("color-theme", "light");
            }
        } else {
            if (document.documentElement.classList.contains("dark")) {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("color-theme", "light");
                themeChanged("color-theme", "light");
            } else {
                document.documentElement.classList.add("dark");
                localStorage.setItem("color-theme", "dark");
                themeChanged("color-theme", "dark");
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
    window.addEventListener("resize", setRealHeight);
    setRealHeight();

    const setHeaderHeight = () => {
        const header = document.getElementById("header").offsetHeight;
        document.documentElement.style.setProperty("--header", `${header}px`);
    };
    setHeaderHeight();
    window.addEventListener("resize", setHeaderHeight);
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

        gsap.set(targets, { autoAlpha: 1 });

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
            if (isHorizontal) {
                tl.from(obj, { xPercent: -50, opacity: 0 });
                tl.to(
                    obj,
                    {
                        xPercent: 50,
                        opacity: 0,
                        onStart: () => {
                            if (isLottieSync) {
                                lottie.play("aboutBarcode");
                            }
                        },
                        onComplete: () => {
                            setTimeout((el) => {
                                lottie.stop("aboutBarcode");
                            }, 800);
                        },
                    },
                    "+=" + hold
                );
            } else {
                tl.from(obj, { yPercent: -50, opacity: 0 });
                tl.to(obj, { yPercent: 50, opacity: 0 }, "+=" + hold);
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
            gsap.to(window, { duration: 1, scrollTo: elem, ease: "power2" });
        }
    }

    document.querySelectorAll("a[href]").forEach((a) => {
        a.addEventListener("click", (e) => {
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

        gsap.to(window, { duration: 0.5, delay: delay, scrollTo: { y: el, offsetY: headerOffset }, ease: "power2" });
    },
};

window.utils = utils;

// Switch images

(function () {
    const galleries = document.querySelectorAll("[data-switch-images]");

    if (!galleries) return;

    galleries.forEach((el) => {
        let elements = el.querySelectorAll("img");
        let index = 0;
        let interval = null;

        const intervalTime = +el.dataset.switchImages || 250;

        if (!elements && isTouchScreenDevice()) return;

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

        el.addEventListener(
            "mouseenter",
            () => {
                glowFunc();
                interval = setInterval(glowFunc, intervalTime);
            },
            false
        );

        el.addEventListener(
            "mouseleave",
            () => {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
            },
            false
        );
    });
})();

// Links with bg image

(function () {
    const links = document.querySelectorAll("[data-image-links] a");

    if (!links && isTouchScreenDevice()) return;

    links.forEach((el) => {
        const image = el.querySelector("img");

        if (!image) return;

        const setX = gsap.quickSetter(image, "x", "px"),
            setY = gsap.quickSetter(image, "y", "px"),
            align = (e) => {
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
                onReverseComplete: stopFollow,
            }),
            fadeCursor = gsap.to(".cursor", {
                duration: 0.1,
                opacity: 0,
                ease: "none",
                paused: true,
                onReverseComplete: () => gsap.set(".cursor", { clearProps: "opacity" }),
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

    if (!project3d) return;

    project3d.forEach((el) => {
        gsap.to(el, {
            yPercent: -20,
            rotate: 15,
            ease: "none",
            scrollTrigger: {
                scrub: 1.5,
            },
        });
    });
})();

// October CMS - Contact form

(function () {
    const fromSelector = ".form";
    const forms = document.querySelectorAll(fromSelector);

    let validate = new Bouncer(fromSelector, {
        disableSubmit: true,
    });

    [...forms].map((el) => {
        el.onreset = () => {
            validate.destroy();
            validate = new Bouncer(fromSelector, {
                disableSubmit: true,
            });

            const fileInputs = el.querySelectorAll("input[type=file]");
            [...fileInputs].map((el) => {
                let filePond = window.FilePond.find(el.closest("div"));

                if (filePond != null) {
                    filePond.removeFiles();
                }
            });
        };

        el.addEventListener("submit", (e) => {
            e.preventDefault();

            const areValid = validate.validateAll(el);

            if (areValid.length === 0) {
                request.sendForm(el, "filepondForm::onFormSubmit", {
                    success: (response) => {
                        if (response.status == false) {
                            console.log(response.message);
                        }
                    },
                    error: () => {
                        console.log("error");
                    },
                    complete: () => {
                        el.closest("[x-data]")._x_dataStack[0].formSubmitted = true;
                        el.closest("[x-data]")._x_dataStack[0].showReset = false;

                        setTimeout(() => {
                            el.reset();
                            el.closest("[x-data]")._x_dataStack[0].formSubmitted = false;
                        }, 4000);
                    },
                });
            }
        });
    });
})();

