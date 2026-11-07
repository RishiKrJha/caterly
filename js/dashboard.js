/**
 * dashboard.js — Caterly Owner Management Portal Logic
 *
 * Handles:
 * 1. Owner authorization check
 * 2. Real-time metrics calculations (Reporting)
 * 3. Bookings CRUD (Create, View, Edit, Delete)
 * 4. Search and status/event-type filtering
 * 5. In-table status updates
 * 6. Local storage synchronization
 */

(function () {
    "use strict";

    // ── 1. Auth Guard ──────────────────────────────────────────────
    if (window.CaterlyAuth && !window.CaterlyAuth.requireOwner("login.html")) {
        return;
    }

    const STORAGE_KEY = "caterly_bookings";

    // State
    let bookings = [];
    let editingBookingId = null;

    // DOM Elements
    const metricTotal = document.getElementById("metric-total");
    const metricPending = document.getElementById("metric-pending");
    const metricConfirmed = document.getElementById("metric-confirmed");
    const metricGuests = document.getElementById("metric-guests");

    const searchInput = document.getElementById("dash-search");
    const statusFilter = document.getElementById("filter-status");
    const eventFilter = document.getElementById("filter-event");
    const filterCount = document.getElementById("filter-count");

    const tableWrapper = document.getElementById("dash-table-wrapper");
    const tableBody = document.getElementById("dash-table-body");
    const emptyState = document.getElementById("dash-empty-state");

    const modalBackdrop = document.getElementById("booking-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalForm = document.getElementById("booking-form");
    const btnNewBooking = document.getElementById("btn-new-booking");
    const btnEmptyCreate = document.getElementById("btn-empty-create");
    const modalCloseButtons = document.querySelectorAll("[data-close-modal]");

    const toast = document.getElementById("dash-toast");

    // ── 2. Storage Helpers ──────────────────────────────────────────
    function loadBookings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            bookings = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(bookings)) bookings = [];
        } catch (err) {
            console.error("Failed to parse bookings from localStorage:", err);
            bookings = [];
        }
    }

    function saveBookings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        } catch (err) {
            console.error("Failed to save bookings to localStorage:", err);
        }
    }

    // ── 3. Toast Helper ─────────────────────────────────────────────
    let toastTimeout;
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // ── 4. Metrics Reporting ────────────────────────────────────────
    function updateMetrics() {
        const total = bookings.length;
        const pending = bookings.filter((b) => b.status === "Pending").length;
        const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
        const guests = bookings.reduce((sum, b) => sum + (parseInt(b.guests, 10) || 0), 0);

        if (metricTotal) metricTotal.textContent = total;
        if (metricPending) metricPending.textContent = pending;
        if (metricConfirmed) metricConfirmed.textContent = confirmed;
        if (metricGuests) metricGuests.textContent = guests.toLocaleString();
    }

    // ── 5. Filtering & Rendering ────────────────────────────────────
    function getFilteredBookings() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const status = statusFilter ? statusFilter.value : "all";
        const eventType = eventFilter ? eventFilter.value : "all";

        return bookings.filter((b) => {
            // Text search matches name, email, eventType, or ID
            const matchesQuery =
                !query ||
                (b.name && b.name.toLowerCase().includes(query)) ||
                (b.email && b.email.toLowerCase().includes(query)) ||
                (b.eventType && b.eventType.toLowerCase().includes(query)) ||
                (b.id && b.id.toLowerCase().includes(query));

            // Status filter
            const matchesStatus = status === "all" || b.status === status;

            // Event Type filter
            const matchesEvent = eventType === "all" || b.eventType === eventType;

            return matchesQuery && matchesStatus && matchesEvent;
        });
    }

    function renderTable() {
        const filtered = getFilteredBookings();

        if (filterCount) {
            filterCount.textContent = `Showing ${filtered.length} of ${bookings.length} inquiries`;
        }

        if (filtered.length === 0) {
            if (tableWrapper) tableWrapper.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        if (emptyState) emptyState.style.display = "none";
        if (tableWrapper) tableWrapper.style.display = "block";

        if (!tableBody) return;
        tableBody.innerHTML = "";

        filtered.forEach((b) => {
            const tr = document.createElement("tr");

            // Format creation date
            let createdDate = "Recent";
            if (b.createdAt) {
                try {
                    createdDate = new Date(b.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    });
                } catch (e) {}
            }

            // Safe status class name
            const statusClass = "status-" + (b.status || "Pending").toLowerCase().replace(/\s+/g, "-");

            tr.innerHTML = `
                <td>
                    <span class="booking-ref">${escapeHtml(b.id || "BK-000000")}</span>
                    <span class="booking-date-sub">Created ${escapeHtml(createdDate)}</span>
                </td>
                <td>
                    <span class="client-name">${escapeHtml(b.name || "Anonymous")}</span>
                    <span class="client-contact">${escapeHtml(b.email || "")} &middot; ${escapeHtml(b.phone || "")}</span>
                </td>
                <td>
                    <span class="event-title">${escapeHtml(b.eventType || "Catering")}</span>
                    <span class="event-details">${escapeHtml(b.eventDate || "TBD")} &middot; <strong>${escapeHtml(String(b.guests || 0))} guests</strong></span>
                </td>
                <td>
                    <div class="notes-preview" title="${escapeHtml(b.message || "None")}">${escapeHtml(b.message || "—")}</div>
                </td>
                <td>
                    <select class="status-pill-select ${statusClass}" data-booking-id="${escapeHtml(b.id)}" aria-label="Change status for ${escapeHtml(b.id)}">
                        <option value="Pending" ${b.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Confirmed" ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="In Progress" ${b.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Completed" ${b.status === "Completed" ? "selected" : ""}>Completed</option>
                        <option value="Cancelled" ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <div class="actions-cell">
                        <button type="button" class="btn-icon" data-action="edit" data-id="${escapeHtml(b.id)}">Edit</button>
                        <button type="button" class="btn-icon btn-icon-danger" data-action="delete" data-id="${escapeHtml(b.id)}">Delete</button>
                    </div>
                </td>
            `;

            tableBody.appendChild(tr);
        });

        attachRowEvents();
    }

    function attachRowEvents() {
        // Status dropdown changes
        const statusSelects = tableBody.querySelectorAll(".status-pill-select");
        statusSelects.forEach((select) => {
            select.addEventListener("change", (e) => {
                const id = e.target.getAttribute("data-booking-id");
                const newStatus = e.target.value;
                updateBookingStatus(id, newStatus, e.target);
            });
        });

        // Edit buttons
        const editButtons = tableBody.querySelectorAll('[data-action="edit"]');
        editButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                openEditModal(id);
            });
        });

        // Delete buttons
        const deleteButtons = tableBody.querySelectorAll('[data-action="delete"]');
        deleteButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                deleteBooking(id);
            });
        });
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ── 6. CRUD Operations ──────────────────────────────────────────
    function updateBookingStatus(id, newStatus, selectElement) {
        const item = bookings.find((b) => b.id === id);
        if (!item) return;

        item.status = newStatus;
        saveBookings();
        updateMetrics();

        // Update select element class
        if (selectElement) {
            selectElement.className = "status-pill-select status-" + newStatus.toLowerCase().replace(/\s+/g, "-");
        }

        showToast(`Booking ${id} status updated to ${newStatus}`);
    }

    function deleteBooking(id) {
        if (!confirm(`Are you sure you want to delete inquiry ${id}? This action cannot be undone.`)) {
            return;
        }

        bookings = bookings.filter((b) => b.id !== id);
        saveBookings();
        updateMetrics();
        renderTable();
        showToast(`Booking ${id} was deleted.`);
    }

    function openCreateModal() {
        editingBookingId = null;
        if (modalTitle) modalTitle.textContent = "Create New Catering Booking";
        if (modalForm) {
            modalForm.reset();
            const dateInput = document.getElementById("modal-event-date");
            if (dateInput) {
                dateInput.min = new Date().toISOString().split("T")[0];
            }
        }
        openModal();
    }

    function openEditModal(id) {
        const item = bookings.find((b) => b.id === id);
        if (!item) return;

        editingBookingId = id;
        if (modalTitle) modalTitle.textContent = `Edit Booking (${id})`;

        document.getElementById("modal-name").value = item.name || "";
        document.getElementById("modal-email").value = item.email || "";
        document.getElementById("modal-phone").value = item.phone || "";
        document.getElementById("modal-event-type").value = item.eventType || "Wedding";
        document.getElementById("modal-event-date").value = item.eventDate && item.eventDate !== "Flexible / TBD" ? item.eventDate : "";
        document.getElementById("modal-guests").value = item.guests || 50;
        document.getElementById("modal-status").value = item.status || "Pending";
        document.getElementById("modal-notes").value = item.message || "";

        openModal();
    }

    function openModal() {
        if (modalBackdrop) modalBackdrop.classList.add("active");
    }

    function closeModal() {
        if (modalBackdrop) modalBackdrop.classList.remove("active");
        editingBookingId = null;
    }

    // Modal submit handler (Create or Edit)
    if (modalForm) {
        modalForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("modal-name").value.trim();
            const email = document.getElementById("modal-email").value.trim();
            const phone = document.getElementById("modal-phone").value.trim() || "Not provided";
            const eventType = document.getElementById("modal-event-type").value;
            const eventDate = document.getElementById("modal-event-date").value || "Flexible / TBD";
            const guests = parseInt(document.getElementById("modal-guests").value, 10) || 50;
            const status = document.getElementById("modal-status").value || "Pending";
            const notes = document.getElementById("modal-notes").value.trim() || "Manual staff entry";

            if (!name || !email) {
                alert("Please provide both client name and email.");
                return;
            }

            if (editingBookingId) {
                // Update existing
                const existing = bookings.find((b) => b.id === editingBookingId);
                if (existing) {
                    existing.name = name;
                    existing.email = email;
                    existing.phone = phone;
                    existing.eventType = eventType;
                    existing.eventDate = eventDate;
                    existing.guests = guests;
                    existing.status = status;
                    existing.message = notes;
                    showToast(`Booking ${editingBookingId} updated successfully.`);
                }
            } else {
                // Create new
                const newBooking = {
                    id: "BK-" + Math.floor(100000 + Math.random() * 900000),
                    name: name,
                    email: email,
                    phone: phone,
                    eventType: eventType,
                    eventDate: eventDate,
                    guests: guests,
                    message: notes,
                    status: status,
                    createdAt: new Date().toISOString()
                };
                bookings.unshift(newBooking);
                showToast(`New booking ${newBooking.id} created.`);
            }

            saveBookings();
            updateMetrics();
            renderTable();
            closeModal();
        });
    }

    // ── 7. Event Listeners ──────────────────────────────────────────
    if (searchInput) searchInput.addEventListener("input", renderTable);
    if (statusFilter) statusFilter.addEventListener("change", renderTable);
    if (eventFilter) eventFilter.addEventListener("change", renderTable);

    if (btnNewBooking) btnNewBooking.addEventListener("click", openCreateModal);
    if (btnEmptyCreate) btnEmptyCreate.addEventListener("click", openCreateModal);

    modalCloseButtons.forEach((btn) => {
        btn.addEventListener("click", closeModal);
    });

    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }

    // ── 8. Initialize ───────────────────────────────────────────────
    loadBookings();
    updateMetrics();
    renderTable();
})();
