/**
 * app.js — Caterly Global Interactive Behaviors
 *
 * Handles:
 * 1. Universal scroll-reveal observer (.reveal, .hp-reveal, .srv-reveal)
 * 2. Form validation for Login, Register, Forgot Password
 * 3. Password visibility toggle
 * 4. Contact page URL parameter pre-filling & consultation submission
 */

(function () {
    "use strict";

    /* ── 1. Universal Scroll-Reveal Observer ─────────────────── */
    const revealTargets = document.querySelectorAll(".reveal, .hp-reveal, .srv-reveal");
    if (revealTargets.length) {
        if ("IntersectionObserver" in window) {
            const revealObserver = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible", "hp-visible", "srv-visible");
                            obs.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
            );
            revealTargets.forEach((el) => revealObserver.observe(el));
        } else {
            // Fallback for older browsers
            revealTargets.forEach((el) => el.classList.add("visible", "hp-visible", "srv-visible"));
        }
    }

    /* ── 2. Password Visibility Toggles ──────────────────────── */
    const passwordToggles = document.querySelectorAll(".password-toggle");
    passwordToggles.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("aria-controls");
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            btn.textContent = isPassword ? "Hide" : "Show";
            btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        });
    });

    /* ── 3. Helper: Email Validation ─────────────────────────── */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /* ── 4. Login Form Validation ────────────────────────────── */
    const loginForm = document.querySelector(".login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email");
            const pass = document.getElementById("login-password");
            const emailErr = document.getElementById("email-error");
            const passErr = document.getElementById("password-error");
            const status = loginForm.querySelector(".login-status");

            let valid = true;
            if (emailErr) emailErr.textContent = "";
            if (passErr) passErr.textContent = "";
            if (status) status.textContent = "";

            if (!email || !email.value.trim()) {
                if (emailErr) emailErr.textContent = "Please enter your email address.";
                valid = false;
            } else if (!isValidEmail(email.value.trim())) {
                if (emailErr) emailErr.textContent = "Please enter a valid email address.";
                valid = false;
            }

            if (!pass || !pass.value) {
                if (passErr) passErr.textContent = "Please enter your password.";
                valid = false;
            }

            if (valid && status) {
                const cleanEmail = email.value.trim().toLowerCase();
                const isOwner = cleanEmail.endsWith("@caterly.com") || cleanEmail === "admin@caterly.com";
                const user = {
                    email: cleanEmail,
                    role: isOwner ? "owner" : "customer",
                    name: isOwner ? "Management" : cleanEmail.split("@")[0],
                    loggedInAt: new Date().toISOString()
                };

                if (window.CaterlyAuth) {
                    window.CaterlyAuth.setUser(user);
                } else {
                    localStorage.setItem("caterly_user", JSON.stringify(user));
                }

                status.textContent = isOwner 
                    ? "Welcome, Management. Opening Dashboard..." 
                    : "Welcome back! Signing you in...";
                status.style.color = "var(--color-secondary-dark)";

                setTimeout(() => {
                    if (isOwner) {
                        window.location.href = "dashboard.html";
                    } else {
                        window.location.href = "../index.html";
                    }
                }, 600);
            }
        });
    }

    /* ── 5. Register Form Validation ─────────────────────────── */
    const registerForm = document.querySelector(".register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("register-name");
            const email = document.getElementById("register-email");
            const pass = document.getElementById("register-password");
            const nameErr = document.getElementById("register-name-error");
            const emailErr = document.getElementById("register-email-error");
            const passErr = document.getElementById("register-password-error");
            const status = registerForm.querySelector(".login-status");

            let valid = true;
            if (nameErr) nameErr.textContent = "";
            if (emailErr) emailErr.textContent = "";
            if (passErr) passErr.textContent = "";
            if (status) status.textContent = "";

            if (!name || !name.value.trim()) {
                if (nameErr) nameErr.textContent = "Please enter your full name.";
                valid = false;
            }

            if (!email || !email.value.trim()) {
                if (emailErr) emailErr.textContent = "Please enter your email address.";
                valid = false;
            } else if (!isValidEmail(email.value.trim())) {
                if (emailErr) emailErr.textContent = "Please enter a valid email address.";
                valid = false;
            }

            if (!pass || pass.value.length < 8) {
                if (passErr) passErr.textContent = "Password must be at least 8 characters.";
                valid = false;
            }

            if (valid && status) {
                const cleanEmail = email.value.trim().toLowerCase();
                const isOwner = cleanEmail.endsWith("@caterly.com");
                const user = {
                    email: cleanEmail,
                    role: isOwner ? "owner" : "customer",
                    name: name.value.trim(),
                    loggedInAt: new Date().toISOString()
                };

                if (window.CaterlyAuth) {
                    window.CaterlyAuth.setUser(user);
                } else {
                    localStorage.setItem("caterly_user", JSON.stringify(user));
                }

                status.textContent = isOwner
                    ? "Owner account created. Opening Dashboard..."
                    : "Account created! Welcome to Caterly.";
                status.style.color = "var(--color-secondary-dark)";

                setTimeout(() => {
                    if (isOwner) {
                        window.location.href = "dashboard.html";
                    } else {
                        window.location.href = "../index.html";
                    }
                }, 600);
            }
        });
    }

    /* ── 6. Reset Password Form Validation ───────────────────── */
    const resetForm = document.querySelector(".reset-form");
    if (resetForm) {
        resetForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("reset-email");
            const emailErr = document.getElementById("reset-email-error");
            const status = resetForm.querySelector(".login-status");

            if (emailErr) emailErr.textContent = "";
            if (status) status.textContent = "";

            if (!email || !email.value.trim()) {
                if (emailErr) emailErr.textContent = "Please enter your email address.";
                return;
            }
            if (!isValidEmail(email.value.trim())) {
                if (emailErr) emailErr.textContent = "Please enter a valid email address.";
                return;
            }

            if (status) {
                status.textContent = "Reset link has been dispatched to your email.";
                status.style.color = "var(--color-secondary-dark)";
            }
        });
    }

    /* ── 7. Contact Page: Query Param Pre-Fill & Booking Submission ──── */
    const consultForm = document.querySelector(".consultation-form");
    if (consultForm) {
        // Set minimum date to today
        const dateInput = document.getElementById("event-date");
        if (dateInput) {
            const today = new Date().toISOString().split("T")[0];
            dateInput.min = today;
        }

        // Auto-fill logged-in user profile if available
        if (window.CaterlyAuth) {
            const currentUser = window.CaterlyAuth.getUser();
            if (currentUser) {
                const nameInput = document.getElementById("name");
                const emailInput = document.getElementById("email");
                if (nameInput && !nameInput.value && currentUser.name) {
                    nameInput.value = currentUser.name;
                }
                if (emailInput && !emailInput.value && currentUser.email) {
                    emailInput.value = currentUser.email;
                }
            }
        }

        // Pre-fill fields from URL parameters (e.g. ?type=Wedding&guests=120)
        try {
            const params = new URLSearchParams(window.location.search);
            const eventType = params.get("type");
            const guests = params.get("guests");

            if (eventType) {
                const typeSelect = document.getElementById("event-type");
                if (typeSelect) {
                    for (let opt of typeSelect.options) {
                        if (opt.value.toLowerCase().includes(eventType.toLowerCase()) ||
                            eventType.toLowerCase().includes(opt.value.toLowerCase())) {
                            opt.selected = true;
                            break;
                        }
                    }
                }
            }

            if (guests) {
                const guestInput = document.getElementById("guests");
                if (guestInput) guestInput.value = guests;
            }
        } catch (err) {
            // Silently ignore URL parsing errors on file:// protocols
        }

        consultForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const feedback = consultForm.querySelector(".form-feedback");
            const submitBtn = consultForm.querySelector("button[type='submit']");
            const nameEl = document.getElementById("name");
            const emailEl = document.getElementById("email");
            const phoneEl = document.getElementById("phone");
            const typeEl = document.getElementById("event-type");
            const dateEl = document.getElementById("event-date");
            const guestEl = document.getElementById("guests");
            const msgEl = document.getElementById("message");

            if (feedback) feedback.textContent = "";

            // Validate required inputs
            if (!nameEl || !nameEl.value.trim()) {
                if (feedback) {
                    feedback.textContent = "Please enter your name.";
                    feedback.style.color = "var(--color-accent-dark)";
                }
                return;
            }

            if (!emailEl || !emailEl.value.trim() || !isValidEmail(emailEl.value.trim())) {
                if (feedback) {
                    feedback.textContent = "Please enter a valid email address.";
                    feedback.style.color = "var(--color-accent-dark)";
                }
                return;
            }

            if (!typeEl || !typeEl.value) {
                if (feedback) {
                    feedback.textContent = "Please select an event type.";
                    feedback.style.color = "var(--color-accent-dark)";
                }
                return;
            }

            // Create new booking record
            const newBooking = {
                id: "BK-" + Math.floor(100000 + Math.random() * 900000),
                name: nameEl.value.trim(),
                email: emailEl.value.trim().toLowerCase(),
                phone: phoneEl && phoneEl.value.trim() ? phoneEl.value.trim() : "Not provided",
                eventType: typeEl.value,
                eventDate: dateEl && dateEl.value ? dateEl.value : "Flexible / TBD",
                guests: guestEl && guestEl.value ? parseInt(guestEl.value, 10) : 50,
                message: msgEl && msgEl.value.trim() ? msgEl.value.trim() : "Standard package consultation",
                status: "Pending",
                createdAt: new Date().toISOString()
            };

            // Save booking to localStorage (isolated to client browser)
            try {
                let existing = [];
                const raw = localStorage.getItem("caterly_bookings");
                if (raw) existing = JSON.parse(raw);
                if (!Array.isArray(existing)) existing = [];
                existing.unshift(newBooking);
                localStorage.setItem("caterly_bookings", JSON.stringify(existing));
            } catch (err) {
                console.error("Failed to save booking:", err);
            }

            if (feedback) {
                feedback.textContent = `Thank you, ${newBooking.name}! Your catering request (#${newBooking.id}) has been recorded. Our team will review your event details shortly.`;
                feedback.style.color = "var(--color-secondary-dark)";
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Request Received ✓";
            }
        });
    }

    /* ── 8. Status Tracker Lookup ────────────────────────────── */
    const trackerForm = document.getElementById("tracker-form");
    if (trackerForm) {
        trackerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = document.getElementById("tracker-id");
            const resultBox = document.getElementById("tracker-result");
            if (!input || !resultBox) return;

            const queryId = input.value.trim().toUpperCase();
            let bookings = [];
            try {
                const raw = localStorage.getItem("caterly_bookings");
                if (raw) bookings = JSON.parse(raw);
            } catch (err) {}

            const match = bookings.find(
                (b) => b.id && b.id.toUpperCase() === queryId
            );

            if (!match) {
                resultBox.innerHTML = `
                    <div class="tracker-result-card" style="border-left: 4px solid var(--color-accent-dark);">
                        <div>
                            <strong style="color: var(--color-accent-dark);">Inquiry Not Found</strong>
                            <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--color-text-muted);">
                                No catering record matches <code>${queryId}</code>. Please double-check your Reference ID.
                            </p>
                        </div>
                    </div>
                `;
                return;
            }

            const statusClass = "tracker-status-" + (match.status || "Pending").toLowerCase().replace(/\s+/g, "-");
            resultBox.innerHTML = `
                <div class="tracker-result-card">
                    <div>
                        <span style="font-family: var(--font-navigation); font-size: 0.8rem; font-weight: 600; color: var(--color-accent-dark);">${match.id}</span>
                        <h3 style="margin: 0.2rem 0; font-family: var(--font-heading); font-size: 1.3rem;">${match.eventType} for ${match.name}</h3>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--color-text-muted);">
                            Event Date: <strong>${match.eventDate}</strong> &middot; Guests: <strong>${match.guests}</strong>
                        </p>
                    </div>
                    <div>
                        <span class="tracker-status-badge ${statusClass}">Status: ${match.status}</span>
                    </div>
                </div>
            `;
        });
    }
})();
