/**
 * home.js — Homepage-specific micro-interactions
 * Hero slow zoom trigger & marquee animation controls.
 */

(function () {
    "use strict";

    // 1. Hero image zoom on initial load
    const hero = document.querySelector(".hp-hero");
    if (hero) {
        setTimeout(() => hero.classList.add("hp-loaded"), 80);
    }

    // 2. Pause marquee on user hover & respect reduced-motion
    const marqueeTrack = document.querySelector(".hp-marquee-track");
    if (marqueeTrack) {
        const marquee = marqueeTrack.parentElement;
        marquee.addEventListener("mouseenter", () => {
            marqueeTrack.style.animationPlayState = "paused";
        });
        marquee.addEventListener("mouseleave", () => {
            marqueeTrack.style.animationPlayState = "running";
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            marqueeTrack.style.animationDuration = "0s";
        }
    }
})();
