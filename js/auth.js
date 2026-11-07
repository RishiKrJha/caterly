/**
 * auth.js — Caterly Authentication & Session Manager
 *
 * Manages client-side sessions using localStorage.
 * Isolated to the current browser/device (never tracked in Git).
 * Differentiates Owner/Staff accounts (@caterly.com) from Customers.
 */

(function () {
    "use strict";

    const STORAGE_KEY = "caterly_user";

    window.CaterlyAuth = {
        /**
         * Get current session object or null
         */
        getUser: function () {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch (err) {
                console.error("Error reading auth session:", err);
                return null;
            }
        },

        /**
         * Persist current user session
         */
        setUser: function (user) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            } catch (err) {
                console.error("Error writing auth session:", err);
            }
        },

        /**
         * Clears active session and redirects
         */
        logout: function (redirectPath) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (err) {
                console.error("Error clearing session:", err);
            }
            if (redirectPath) {
                window.location.href = redirectPath;
            } else {
                window.location.reload();
            }
        },

        /**
         * Check if current user is owner/staff
         */
        isOwner: function () {
            const user = this.getUser();
            return !!(user && user.role === "owner");
        },

        /**
         * Route guard for owner-only pages (e.g. dashboard.html).
         * Redirects to login.html if not authenticated as owner.
         */
        requireOwner: function (loginUrl) {
            const user = this.getUser();
            if (!user || user.role !== "owner") {
                const redirect = loginUrl || "login.html";
                window.location.replace(redirect);
                return false;
            }
            return true;
        }
    };
})();
