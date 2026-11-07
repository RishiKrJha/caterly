/**
 * navbar.js — Caterly shared navigation component
 *
 * Loaded in <head> on every page. Safely waits for DOM ready
 * before injecting the <header>.
 *
 * - Auto-detects root vs /pages/ depth to build correct hrefs.
 * - Marks the current page's link as active.
 * - Attaches sticky scroll-glass behaviour (nav-scrolled class).
 */

(function () {
    "use strict";

    function mountNavbar() {
        // Prevent double injection if called twice
        if (document.getElementById("site-header")) {
            return;
        }

        /* ── 1. Determine path depth ─────────────────────────────────
           Pages inside /pages/ need "../" to reach root; index.html doesn't. */
        const inSubdir = window.location.pathname.includes("/pages/");
        const root     = inSubdir ? "../" : "";
        const pages    = inSubdir ? ""    : "pages/";

        /* ── 2. Check auth session ─────────────────────────────────── */
        let currentUser = null;
        try {
            const rawUser = localStorage.getItem("caterly_user");
            if (rawUser) {
                currentUser = JSON.parse(rawUser);
            }
        } catch (err) {}

        const isOwner = !!(currentUser && currentUser.role === "owner");
        const isCustomer = !!(currentUser && currentUser.role === "customer");

        /* ── 3. Nav link definitions ─────────────────────────────────
           key is matched against window.location.pathname for active detection. */
        const links = [
            { label: "Home",     href: root  + "index.html",     key: "index"    },
            { label: "Services", href: pages + "services.html",  key: "services" },
            { label: "Contact",  href: pages + "contact.html",   key: "contact"  },
        ];

        if (isOwner) {
            links.push({ label: "Dashboard", href: pages + "dashboard.html", key: "dashboard" });
            links.push({ label: "Log out", href: "#logout", key: "logout", isLogout: true, cta: true });
        } else if (isCustomer) {
            const displayName = currentUser.name ? currentUser.name.split(" ")[0] : "Account";
            links.push({ label: "Log out (" + displayName + ")", href: "#logout", key: "logout", isLogout: true, cta: true });
        } else {
            links.push({ label: "Login", href: pages + "login.html", key: "login", cta: true });
        }

        /* ── 4. Detect active page ───────────────────────────────────
           Default to "index" when pathname is "/" or ends with root. */
        const path = window.location.pathname.toLowerCase();
        let activePage = links.find(function (l) {
            return path.includes(l.key);
        });

        // If at root domain (e.g. "/" or "/caterly/"), default to Home
        if (!activePage) {
            activePage = links[0];
        }

        /* ── 5. Build <li> items ─────────────────────────────────────*/
        const liHTML = links.map(function (link) {
            const classes = [];
            if (activePage.key === link.key) classes.push("nav-active");
            if (link.cta) classes.push("nav-cta");
            const classAttr = classes.length ? ' class="' + classes.join(" ") + '"' : "";
            const extraAttr = link.isLogout ? ' data-nav-logout="true"' : "";
            return '<li><a href="' + link.href + '"' + classAttr + extraAttr + '>' + link.label + '</a></li>';
        }).join("\n            ");

        /* ── 6. Build the full <header> ──────────────────────────────*/
        const headerHTML =
            '<header id="site-header">\n' +
            '    <a class="site-brand" href="' + root + 'index.html">\n' +
            '        <h1 class="site-title">Caterly</h1>\n' +
            '    </a>\n' +
            '    <nav aria-label="Primary navigation">\n' +
            '        <ul>\n' +
            '            ' + liHTML + '\n' +
            '        </ul>\n' +
            '    </nav>\n' +
            '</header>';

        /* ── 7. Inject into the DOM ──────────────────────────────────
           If a <div id="navbar-mount"> placeholder exists, replace it.
           Otherwise prepend directly to <body>. */
        const mount = document.getElementById("navbar-mount");
        if (mount) {
            mount.outerHTML = headerHTML;
        } else if (document.body) {
            document.body.insertAdjacentHTML("afterbegin", headerHTML);
        }

        // Attach logout click listener
        const logoutBtn = document.querySelector('a[data-nav-logout="true"]');
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                try {
                    localStorage.removeItem("caterly_user");
                } catch (err) {}
                window.location.href = pages + "login.html";
            });
        }

        /* ── 8. Scroll-glass behaviour ───────────────────────────────
           Toggles .nav-scrolled on <header id="site-header"> at 40 px. */
        const header = document.getElementById("site-header");
        if (header) {
            const toggleScrolled = function () {
                header.classList.toggle("nav-scrolled", window.scrollY > 40);
            };
            window.addEventListener("scroll", toggleScrolled, { passive: true });
            toggleScrolled(); // apply immediately if page loads mid-scroll
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountNavbar);
    } else {
        mountNavbar();
    }
})();
