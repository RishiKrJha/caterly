/* home.js — homepage-only interactions */

(function () {
    "use strict";

    /* ── Hero image: trigger slow-zoom after load ── */
    const hero = document.querySelector(".hp-hero");
    if (hero) {
        // Small delay so animation starts visibly
        setTimeout(() => hero.classList.add("hp-loaded"), 80);
    }

    /* ── Scroll-reveal: .hp-reveal → .hp-visible ── */
    const revealEls = document.querySelectorAll(".hp-reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("hp-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        // Fallback: show all immediately
        revealEls.forEach((el) => el.classList.add("hp-visible"));
    }

    /* ── Pause marquee on hover / prefer-reduced-motion ── */
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
