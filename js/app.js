const loginForm = document.querySelector(".login-form");
const passwordInput = document.querySelector("#login-password");
const passwordToggles = document.querySelectorAll(".password-toggle");

passwordToggles.forEach((passwordToggle) => {
    passwordToggle.addEventListener("click", () => {
        const controlledInput = document.querySelector(
            `#${passwordToggle.getAttribute("aria-controls")}`
        );
        const isPasswordVisible = controlledInput.type === "text";

        controlledInput.type = isPasswordVisible ? "password" : "text";
        passwordToggle.textContent = isPasswordVisible ? "Show" : "Hide";
        passwordToggle.setAttribute(
            "aria-label",
            isPasswordVisible ? "Show password" : "Hide password"
        );
    });
});


if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = document.querySelector("#login-email");
        const emailError = document.querySelector("#email-error");
        const passwordError = document.querySelector("#password-error");
        const loginStatus = document.querySelector(".login-status");
        let isValid = true;

        emailError.textContent = "";
        passwordError.textContent = "";
        loginStatus.textContent = "";

        if (!emailInput.value.trim()) {
            emailError.textContent = "Enter your email address.";
            isValid = false;
        } else if (!emailInput.validity.valid) {
            emailError.textContent = "Enter a valid email address.";
            isValid = false;
        }

        if (!passwordInput.value) {
            passwordError.textContent = "Enter your password.";
            isValid = false;
        }

        if (isValid) {
            loginStatus.textContent = "Your sign-in form is ready to submit.";
        }
    });
}

const registerForm = document.querySelector(".register-form");
const resetForm = document.querySelector(".reset-form");

function validateEmail(input, error) {
    error.textContent = "";

    if (!input.value.trim()) {
        error.textContent = "Enter your email address.";
        return false;
    }

    if (!input.validity.valid) {
        error.textContent = "Enter a valid email address.";
        return false;
    }

    return true;
}

if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameInput = document.querySelector("#register-name");
        const emailInput = document.querySelector("#register-email");
        const passwordInput = document.querySelector("#register-password");
        const nameError = document.querySelector("#register-name-error");
        const emailError = document.querySelector("#register-email-error");
        const passwordError = document.querySelector("#register-password-error");
        const status = registerForm.querySelector(".login-status");
        let isValid = true;

        nameError.textContent = nameInput.value.trim() ? "" : "Enter your full name.";
        isValid = Boolean(nameInput.value.trim()) && isValid;
        isValid = validateEmail(emailInput, emailError) && isValid;
        passwordError.textContent = "";

        if (passwordInput.value.length < 8) {
            passwordError.textContent = "Use at least 8 characters.";
            isValid = false;
        }

        status.textContent = isValid ? "Your account details are ready to submit." : "";
    });
}

if (resetForm) {
    resetForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = document.querySelector("#reset-email");
        const emailError = document.querySelector("#reset-email-error");
        const status = resetForm.querySelector(".login-status");

        if (validateEmail(emailInput, emailError)) {
            status.textContent = "Your reset link request is ready to submit.";
        } else {
            status.textContent = "";
        }
    });
}

const aboutRevealElements = document.querySelectorAll(".about-reveal");

if (aboutRevealElements.length) {
    const revealAboutContent = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("about-visible");
                observer.unobserve(entry.target);
            }
        });
    };

    if ("IntersectionObserver" in window) {
        const aboutObserver = new IntersectionObserver(revealAboutContent, {
            threshold: 0.12
        });

        aboutRevealElements.forEach((element) => aboutObserver.observe(element));
    } else {
        aboutRevealElements.forEach((element) => element.classList.add("about-visible"));
    }
}