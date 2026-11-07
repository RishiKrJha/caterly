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

    /* ── 7. Contact Page: Query Param Pre-Fill & Submission ──── */
    const consultForm = document.querySelector(".consultation-form");
    if (consultForm) {
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

            if (feedback) {
                feedback.textContent = "Thank you! Your event details have been received. We'll be in touch within 24 hours.";
                feedback.style.color = "var(--color-secondary-dark)";
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Consultation Requested ✓";
            }
        });
    }
})();
