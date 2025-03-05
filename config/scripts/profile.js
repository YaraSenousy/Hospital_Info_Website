// Mock user data - Replace with actual backend integration
import API_ENDPOINTS from "../../apiEndPoints.js";

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  fetchUserInfo();
});

async function fetchUserInfo() {
  try {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.PROFILE, {
      //credentials: 'include'
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(await response.json());
    if (response.status === 401 || response.status === 403) {
      // Unauthorized or Forbidden - redirect to login
      const errorData = await response.json();
      alert("Login failed: " + errorData);
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch user info");

    const userData = await response.json();

    // Check if userData is empty or null
    if (!userData || Object.keys(userData).length === 0) {
      window.location.href = "login.html";
      return;
    }

    initializeProfile(userData);
  } catch (error) {
    console.error("Error fetching user info:", error);
    // Redirect to login on any error
    window.location.href = "login.html";
  }
}

function initializeProfile(userData) {
  // Set user info
  document.getElementById("userName").textContent = userData.name;
  document.getElementById("userRole").textContent =
    userData.role.charAt(0).toUpperCase() + userData.role.slice(1);

  // Show appropriate view
  hideAllViews();
  document.getElementById(`${userData.role}View`).style.display = "block";

  // Load initial data
  if (userData.role === "admin") {
    loadDoctors();
  } else if (userData.role === "doctor") {
    loadPatients();
  } else if (userData.role === "patient") {
    loadDoctors();
  }

  // Show/hide edit button based on role
  const editButton = document.getElementById("editProfileBtn");
  editButton.style.display = userData.role === "admin" ? "none" : "block";
}

function hideAllViews() {
  document.querySelectorAll(".role-view").forEach((view) => {
    view.style.display = "none";
  });
}

function toggleEditMode() {
  const formId = `${currentUser.role}EditForm`;
  const form = document.getElementById(formId);
  if (form) {
    form.style.display = form.style.display === "none" ? "block" : "none";
  }
}

// Admin Functions
function showAddDoctorForm() {
  const modal = new bootstrap.Modal(document.getElementById("addDoctorModal"));
  modal.show();
}

function submitAddDoctor() {
  // Implement doctor addition logic
  console.log("Adding new doctor...");
}

function populateDoctorForm(userData) {
  document.getElementById("doctorBirthDate").value = userData.birthDate || "";
  document.getElementById("doctorEmail").value = userData.email || "";
  document.getElementById("doctorPhone").value = userData.phone || "";
  // Add expertise level display
  document.getElementById("expertiseLevel").textContent =
    userData.expertiseLevel || "Not specified";
}

async function loadDoctors() {
  try {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.GET_DOCTORS, {
      //credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch doctors");

    const doctors = await response.json();
    // Add expertise level to the displayed fields for doctors
    const tableHTML = createTable(doctors, getCurrentUserRole() === "admin", {
      includedFields: ["name", "email", "phone", "expertiseLevel", "photo"],
    });
    const container =
      getCurrentUserRole() === "admin"
        ? document.getElementById("tableContainer")
        : document.getElementById("patientDoctorsTable");

    container.innerHTML = tableHTML;
  } catch (error) {
    console.error("Error loading doctors:", error);
    showError("Failed to load doctors list");
  }
}

function loadPatients() {
  // Mock patient data
  const patients = [
    {
      name: "Alice Brown",
      age: 30,
      phone: "123-456-7890",
      email: "alice@example.com",
      photo: "default-user.png",
    },
  ];

  const tableHTML = createTable(patients, currentUser.role === "admin");
  const container =
    currentUser.role === "admin"
      ? document.getElementById("tableContainer")
      : document.getElementById("doctorPatientsTable");

  container.innerHTML = tableHTML;
}

function createTable(data, isAdmin, options = {}) {
  const { includedFields = null } = options;
  let headers = includedFields || Object.keys(data[0]);
  if (isAdmin) headers.push("Actions");

  let html = `
        <table class="table">
            <thead>
                <tr>
                    ${headers
                      .map((h) => {
                        // Format header text for better display
                        const headerText =
                          h === "expertiseLevel"
                            ? "Expertise Level"
                            : h.charAt(0).toUpperCase() + h.slice(1);
                        return `<th>${headerText}</th>`;
                      })
                      .join("")}
                </tr>
            </thead>
            <tbody>
    `;

  data.forEach((item) => {
    html += "<tr>";
    headers.forEach((header) => {
      if (header === "Actions") {
        html += `<td><button class="btn btn-danger btn-sm" onclick="removeUser('${item.email}')">Remove</button></td>`;
      } else if (header === "photo") {
        html += `<td><img src="../images/${item[header]}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%;"></td>`;
      } else if (header === "expertiseLevel") {
        html += `<td><span class="badge bg-info">${
          item[header] || "Not specified"
        }</span></td>`;
      } else {
        html += `<td>${item[header]}</td>`;
      }
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

function removeUser(email) {
  // Implement user removal logic
  console.log("Removing user:", email);
}
