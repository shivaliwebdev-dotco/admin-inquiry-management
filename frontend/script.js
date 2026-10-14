
const API_URL = "http://localhost:5000/api/inquiries";

const tableBody = document.getElementById("inquiryTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const addModal = document.getElementById("addModal");
const detailsModal = document.getElementById("detailsModal");
const inquiryForm = document.getElementById("inquiryForm");

let allInquiries = [];
let selectedInquiryId = null;
let toastTimer;

// Escape user-provided text before placing it in HTML.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

// Display success or error messages.
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Format the date for the dashboard.
function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Generate customer initials.
function getInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

// Convert status to a CSS class.
function getStatusClass(status) {
  if (status === "In Progress") {
    return "status-in-progress";
  }

  if (status === "Resolved") {
    return "status-resolved";
  }

  return "status-new";
}

// Fetch inquiries from the Express backend.
async function loadInquiries() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="empty-state">
        Loading inquiries...
      </td>
    </tr>
  `;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load inquiries.");
    }

    allInquiries = await response.json();

    updateStatistics();
    renderInquiries();
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          Unable to connect to the backend.
          Start the Express server and refresh.
        </td>
      </tr>
    `;

    document.getElementById("resultsText").textContent =
      "Unable to load results";

    showToast("Backend connection failed. Check the server.", true);
    console.error(error);
  }
}

// Update dashboard statistics.
function updateStatistics() {
  const total = allInquiries.length;

  const newTotal = allInquiries.filter(
    (inquiry) => inquiry.status === "New"
  ).length;

  const progressTotal = allInquiries.filter(
    (inquiry) => inquiry.status === "In Progress"
  ).length;

  const resolvedTotal = allInquiries.filter(
    (inquiry) => inquiry.status === "Resolved"
  ).length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("newCount").textContent = newTotal;
  document.getElementById("progressCount").textContent = progressTotal;
  document.getElementById("resolvedCount").textContent = resolvedTotal;
  document.getElementById("sidebarCount").textContent = total;
}

// Filter and display the inquiry list.
function renderInquiries() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredInquiries = allInquiries.filter((inquiry) => {
    const matchesSearch = [
      inquiry.name,
      inquiry.email,
      inquiry.subject
    ].some((value) => String(value).toLowerCase().includes(searchTerm));

    const matchesStatus =
      selectedStatus === "All" ||
      inquiry.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  document.getElementById("resultsText").textContent =
    `Showing ${filteredInquiries.length} of ${allInquiries.length} inquiries`;

  if (filteredInquiries.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          No inquiries match your search.
        </td>
      </tr>
    `;

    return;
  }

  tableBody.innerHTML = filteredInquiries.map((inquiry) => `
    <tr>
      <td>
        <div class="contact-cell">
          <div class="contact-avatar">
            ${escapeHTML(getInitials(inquiry.name))}
          </div>
          <div class="contact-info">
            <strong>${escapeHTML(inquiry.name)}</strong>
            <span>${escapeHTML(inquiry.email)}</span>
          </div>
        </div>
      </td>

      <td>
        <div class="subject-cell">
          ${escapeHTML(inquiry.subject)}
        </div>
      </td>

      <td>
        <span class="date-cell">
          ${escapeHTML(formatDate(inquiry.createdAt))}
        </span>
      </td>

      <td>
        <span class="status-badge ${getStatusClass(inquiry.status)}">
          ${escapeHTML(inquiry.status)}
        </span>
      </td>

      <td>
        <div class="action-group">
          <button
            class="action-button"
            data-action="view"
            data-id="${inquiry.id}"
            title="View details"
            aria-label="View inquiry details"
          >↗</button>

          <button
            class="action-button"
            data-action="status"
            data-id="${inquiry.id}"
            title="Change status"
            aria-label="Change inquiry status"
          >✓</button>

          <button
            class="action-button delete"
            data-action="delete"
            data-id="${inquiry.id}"
            title="Delete inquiry"
            aria-label="Delete inquiry"
          >×</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// Open a modal.
function openModal(modal) {
  modal.classList.add("show");
}

// Close a modal.
function closeModal(modal) {
  modal.classList.remove("show");
}

// Open the create inquiry modal.
document.getElementById("openAddModal").addEventListener("click", () => {
  inquiryForm.reset();
  openModal(addModal);
});

// Close the create inquiry modal.
document.getElementById("closeAddModal").addEventListener("click", () => {
  closeModal(addModal);
});

document.getElementById("cancelAdd").addEventListener("click", () => {
  closeModal(addModal);
});

// Create an inquiry using the backend API.
inquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = document.getElementById("submitInquiry");
  submitButton.disabled = true;
  submitButton.textContent = "Creating...";

  const inquiryData = {
    name: document.getElementById("customerName").value.trim(),
    email: document.getElementById("customerEmail").value.trim(),
    subject: document.getElementById("inquirySubject").value.trim(),
    message: document.getElementById("inquiryMessage").value.trim()
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inquiryData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not create inquiry.");
    }

    closeModal(addModal);
    inquiryForm.reset();

    searchInput.value = "";
    statusFilter.value = "All";

    await loadInquiries();

    showToast("New inquiry created successfully.");
  } catch (error) {
    showToast(error.message || "Unable to create inquiry.", true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create Inquiry";
  }
});

// Find an inquiry using its ID.
function findInquiry(id) {
  return allInquiries.find((inquiry) => inquiry.id === Number(id));
}

// Display a single inquiry in the details modal.
function viewInquiry(id) {
  const inquiry = findInquiry(id);

  if (!inquiry) {
    showToast("Inquiry not found.", true);
    return;
  }

  selectedInquiryId = inquiry.id;

  document.getElementById("detailSubject").textContent = inquiry.subject;
  document.getElementById("detailName").textContent = inquiry.name;
  document.getElementById("detailEmail").textContent = inquiry.email;
  document.getElementById("detailDate").textContent =
    formatDate(inquiry.createdAt);
  document.getElementById("detailStatus").textContent = inquiry.status;
  document.getElementById("detailMessage").textContent = inquiry.message;

  openModal(detailsModal);
}

document.getElementById("closeDetailsModal").addEventListener("click", () => {
  closeModal(detailsModal);
});

document.getElementById("closeDetailsButton").addEventListener("click", () => {
  closeModal(detailsModal);
});

// Change status through the backend.
async function updateInquiryStatus(id) {
  const inquiry = findInquiry(id);

  if (!inquiry) {
    showToast("Inquiry not found.", true);
    return;
  }

  const statuses = ["New", "In Progress", "Resolved"];
  const currentIndex = statuses.indexOf(inquiry.status);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: nextStatus
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not update status.");
    }

    await loadInquiries();
    showToast(`Status updated to ${nextStatus}.`);

    if (selectedInquiryId === Number(id) && detailsModal.classList.contains("show")) {
      viewInquiry(id);
    }
  } catch (error) {
    showToast(error.message || "Unable to update status.", true);
  }
}

// Update status from the details popup.
document.getElementById("detailsStatusButton").addEventListener("click", async () => {
  if (selectedInquiryId !== null) {
    await updateInquiryStatus(selectedInquiryId);
  }
});

// Delete an inquiry.
async function deleteInquiry(id) {
  const inquiry = findInquiry(id);

  if (!inquiry) {
    showToast("Inquiry not found.", true);
    return;
  }

  const confirmed = window.confirm(
    `Delete the inquiry from ${inquiry.name}? This cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not delete inquiry.");
    }

    if (selectedInquiryId === Number(id)) {
      closeModal(detailsModal);
      selectedInquiryId = null;
    }

    await loadInquiries();
    showToast("Inquiry deleted successfully.");
  } catch (error) {
    showToast(error.message || "Unable to delete inquiry.", true);
  }
}

// Handle the action buttons in the table.
tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "view") {
    viewInquiry(id);
  } else if (action === "status") {
    await updateInquiryStatus(id);
  } else if (action === "delete") {
    await deleteInquiry(id);
  }
});

// Search and filter.
searchInput.addEventListener("input", renderInquiries);
statusFilter.addEventListener("change", renderInquiries);

// Refresh the dashboard.
document.getElementById("refreshButton").addEventListener("click", async () => {
  await loadInquiries();
  showToast("Dashboard refreshed.");
});

// Export all currently loaded inquiries to CSV.
document.getElementById("exportButton").addEventListener("click", () => {
  if (allInquiries.length === 0) {
    showToast("There are no inquiries to export.", true);
    return;
  }

  const columns = [
    "ID",
    "Name",
    "Email",
    "Subject",
    "Message",
    "Status",
    "Date Received"
  ];

  const rows = allInquiries.map((inquiry) => [
    inquiry.id,
    inquiry.name,
    inquiry.email,
    inquiry.subject,
    inquiry.message,
    inquiry.status,
    formatDate(inquiry.createdAt)
  ]);

  function csvValue(value) {
    let text = String(value ?? "");

    // Reduce the risk of spreadsheet formula injection.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
  }

  const csvContent = [
    columns.map(csvValue).join(","),
    ...rows.map((row) => row.map(csvValue).join(","))
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "inquiries.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Inquiry data exported to CSV.");
});

// Close a modal when clicking its backdrop.
[addModal, detailsModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

// Close modals with the Escape key.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal(addModal);
    closeModal(detailsModal);
  }
});

// Load the dashboard when the page opens.
loadInquiries();
