/**
 * services.js — Caterly Services Page Interactive Logic
 * Handles category filtering for event experiences.
 */

(function () {
    "use strict";

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
