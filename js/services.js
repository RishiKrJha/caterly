/* ============================================================
   services.js — Caterly Services Page Interactive Logic
   Minimal, accessible, performant JavaScript
   ============================================================ */

(function () {
    "use strict";

    /* ── 1. Scroll-Reveal Observer ───────────────────────────── */
    const revealEls = document.querySelectorAll(".srv-reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("srv-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("srv-visible"));
    }

    /* ── 2. Category Filter Pills ────────────────────────────── */
    const filterPills = document.querySelectorAll(".srv-pill");
    const serviceCards = document.querySelectorAll(".srv-card");

    if (filterPills.length && serviceCards.length) {
        filterPills.forEach((pill) => {
            pill.addEventListener("click", () => {
                filterPills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");

                const category = pill.getAttribute("data-filter");

                serviceCards.forEach((card) => {
                    const cardCat = card.getAttribute("data-category");
                    if (category === "all" || cardCat === category) {
                        card.style.display = "grid";
                        // trigger a quick fade in
                        setTimeout(() => {
                            card.style.opacity = "1";
                            card.style.transform = "translateY(0)";
                        }, 20);
                    } else {
                        card.style.opacity = "0";
                        card.style.transform = "translateY(12px)";
                        setTimeout(() => {
                            card.style.display = "none";
                        }, 250);
                    }
                });
            });
        });
    }
})();
