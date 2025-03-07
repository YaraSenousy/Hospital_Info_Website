// Mock user data - Replace with actual backend integration
import API_ENDPOINTS from "../../apiEndPoints.js";

// Store user data globally after fetching
let currentUserData = null;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  fetchUserInfo();
});

async function fetchUserInfo() {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const userData = await response.json();
      console.log("Received user data:", userData);
  
      if (!userData) {
        throw new Error("Invalid user data: missing");
      }

      // Store the user data globally
      currentUserData = userData;
  
      initializeProfile(userData);
      
    } catch (error) {
      console.error("Error fetching user info:", error);
      sessionStorage.removeItem('authToken');
      window.location.href = "login.html";
    }
  }

function initializeProfile(userData) {
  // Set user info
  document.getElementById("userName").textContent = userData.name;
  document.getElementById("userRole").textContent =
    userData.role.charAt(0).toUpperCase() + userData.role.slice(1);

  // Initialize profile picture click handler
  initializeProfilePicture(userData);

  // Show appropriate view
  hideAllViews();
  document.getElementById(`${userData.role}View`).style.display = "block";

  // Load initial data
  if (userData.role === "admin") {
    loadAdminDoctorsView();
  } else if (userData.role === "doctor") {
    // Update expertise level for doctor
    const expertiseLevels = Array.isArray(userData.expertiseLevel) 
      ? userData.expertiseLevel.join(", ") 
      : userData.expertiseLevel || "Not specified";
    document.getElementById("expertiseLevel").textContent = expertiseLevels;
    
    loadPatients();
    document.getElementById("editProfileBtn").style.display = "block";
  } else if (userData.role === "patient") {
    loadDoctors();
    // Only show edit button for patient
    document.getElementById("editProfileBtn").style.display = "block";
  }

  // Initialize profile picture click handler
  initializeProfilePicture(userData);
}

function hideAllViews() {
  document.querySelectorAll(".role-view").forEach((view) => {
    view.style.display = "none";
  });
}

function toggleEditMode() {
  const formId = `${currentUserData?.role}EditForm`;
  const form = document.getElementById(formId);
  if (form) {
    if (form.style.display === "none") {
      form.style.display = "block";
      // Populate form with current user data
      if (currentUserData.role === "doctor") {
        populateDoctorForm(currentUserData);
      } else if (currentUserData.role === "patient") {
        populatePatientForm(currentUserData);
      }
    } else {
      form.style.display = "none";
    }
  }
}

// Admin Functions
function showAddDoctorForm() {
  //testing console log
    console.log("Opening add doctor form...");
  const modal = new bootstrap.Modal(document.getElementById("addDoctorModal"));
  modal.show();
}

async function submitAddDoctor() {
  try {
    const form = document.getElementById('addDoctorForm');
    const formData = new FormData(form);
    
    // Get all form values and format them according to backend model
    const doctorData = {
      name: formData.get('name'),
      birthDate: formData.get('birthDate'),
      email: formData.get('email'),
      password: "Doctor123", // Default password
      phoneNumber: formData.get('phoneNumber'),
      gender: formData.get('gender'),
      role: "doctor",
      // Handle multiple expertise levels
      expertiseLevel: Array.from(form.querySelector('[name="expertiseLevel"]').selectedOptions).map(option => option.value)
    };

    // Validate required fields
    const requiredFields = ['name', 'birthDate', 'email', 'phoneNumber', 'gender', 'expertiseLevel'];
    const missingFields = requiredFields.filter(field => !doctorData[field] || 
        (Array.isArray(doctorData[field]) && doctorData[field].length === 0));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log("Sending doctor data:", doctorData); // Debug log
    
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.ADD_DOCTOR, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctorData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText); // Debug log
      throw new Error(`Failed to add doctor: ${errorText}`);
    }
    
    // Close modal and refresh doctor list
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDoctorModal'));
    modal.hide();
    form.reset(); // Reset the form
    loadDoctors(); // Refresh the list
    alert('Doctor added successfully');
  } catch (error) {
    console.error("Error adding doctor:", error);
    alert(error.message);
  }
}

function populateDoctorForm(userData) {
  document.getElementById("doctorBirthDate").value = userData.birthDate || "";
  document.getElementById("doctorEmail").value = userData.email || "";
  document.getElementById("doctorPhone").value = userData.phoneNumber || "";
  
  // Handle expertise level
  const expertiseLevelSelect = document.getElementById("doctorExpertiseLevel");
  if (expertiseLevelSelect && Array.isArray(userData.expertiseLevel)) {
    // Clear previous selections
    Array.from(expertiseLevelSelect.options).forEach(option => {
      option.selected = userData.expertiseLevel.includes(option.value);
    });
  }
}

async function loadDoctors() {
  try {
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(API_ENDPOINTS.GET_DOCTORS, {
      //credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch doctors");

    const doctors = await response.json();
    console.log("Full doctors data:", JSON.stringify(doctors, null, 2)); // Detailed log of the entire response

    const tableHTML = createTable(doctors, getCurrentUserRole() === "admin", {
      includedFields: ["name", "email", "phoneNumber", "expertiseLevel", "image"]
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

async function loadPatients() {
  try {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.GET_PATIENTS, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch patients');
    
    const patients = await response.json();
    console.log("Received patients data:", patients); // Add this debug log
    
    const tableHTML = createTable(patients, getCurrentUserRole() === "admin", {
      includedFields: ["name", "email", "phoneNumber","image"]
    });
    const container = document.getElementById("doctorPatientsTable");
  container.innerHTML = tableHTML;
  } catch (error) {
    console.error("Error loading patients:", error);
    showError("Failed to load patients list");
  }
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
                        const headerText = {
                          expertiseLevel: "Expertise Level",
                          phoneNumber: "Phone Number",
                          image: "Profile Picture"
                        }[h] || h.charAt(0).toUpperCase() + h.slice(1);
                        return `<th>${headerText}</th>`;
                      })
                      .join("")}
                </tr>
            </thead>
            <tbody>
    `;

  data.forEach((item) => {
    console.log("Processing item:", item); // test log
    html += "<tr>";
    headers.forEach((header) => {
      if (header === "Actions") {
        html += `<td><button class="btn btn-danger btn-sm" onclick="removeUser('${item.email}')">Remove</button></td>`;
      } else if (header === "image") {
        // Check if the image path is a full URL or needs to be constructed
        const imagePath = item[header] 
          ? (item[header].startsWith('http') ? item[header] : `../images/${item[header]}`)
          : '../images/default-user.png';
        html += `<td><img src="${imagePath}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%;" onerror="this.src='../images/default-user.png'"></td>`;
      } else if (header === "expertiseLevel") {
        const levels = Array.isArray(item[header]) ? item[header].join(", ") : item[header];
        html += `<td>${levels || "Not specified"}</td>`;
      } else {
        if (header === "phoneNumber") {
          console.log("Phone number value:", item[header]);
        }
        html += `<td>${item[header] || ''}</td>`;
      }
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

async function removeUser(email) {
  try {
    // Ask for confirmation before removing
    if (!confirm(`Are you sure you want to remove user with email: ${email}?`)) {
      return;
    }

    const token = sessionStorage.getItem('authToken');
    const response = await fetch(API_ENDPOINTS.DELETE_USER, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: email})
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText); // Debug log
      throw new Error(`Failed to remove user: ${errorText}`);
    }
    
    // Show success message
    alert('User removed successfully');
    
    // Refresh the appropriate list
    if (getCurrentUserRole() === 'admin') {
      // If we're in the doctors view, reload doctors, otherwise reload patients
      const doctorsButton = document.querySelector('[onclick="loadAdminDoctorsView()"]');
      if (doctorsButton.classList.contains('active')) {
        await loadAdminDoctorsView();
      } else {
        await loadAdminPatientsView();
      }
    } else if (getCurrentUserRole() === 'doctor') {
      await loadPatients();
    }
  } catch (error) {
    console.error("Error removing user:", error);
    showError(error.message);
  }
}

// Replace getCurrentUserRole with this
function getCurrentUserRole() {
    return currentUserData?.role || '';
}

// Admin view functions
async function loadAdminDoctorsView() {
  //testing console log
    console.log("Loading doctors view...");
    try {
        const container = document.getElementById("tableContainer");
        container.innerHTML = '<div class="text-center">Loading doctors...</div>';
        
        await loadDoctors();
        
        // Update the active button state
        document.querySelectorAll('.admin-view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[onclick="loadAdminDoctorsView()"]').classList.add('active');
    } catch (error) {
        console.error("Error loading doctors view:", error);
        showError("Failed to load doctors view");
    }
}

async function loadAdminPatientsView() {
    console.log("Loading patients view...");
    try {
        const container = document.getElementById("tableContainer");
        container.innerHTML = '<div class="text-center">Loading patients...</div>';
        
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(API_ENDPOINTS.GET_PATIENTS, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch patients');
        
        const patients = await response.json();
        const tableHTML = createTable(patients, true, {
            includedFields: ["name", "email", "phoneNumber", "birthDate"]
        });
        container.innerHTML = tableHTML;
        
        // Update the active button state
        document.querySelectorAll('.admin-view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[onclick="loadAdminPatientsView()"]').classList.add('active');
    } catch (error) {
        console.error("Error loading patients:", error);
        showError("Failed to load patients list");
    }
}

// Make functions globally accessible
window.showAddDoctorForm = showAddDoctorForm;
window.submitAddDoctor = submitAddDoctor;
window.loadAdminDoctorsView = loadAdminDoctorsView;
window.loadAdminPatientsView = loadAdminPatientsView;
window.removeUser = removeUser;
window.toggleEditMode = toggleEditMode;

function showError(message) {
    alert(message); 
}

// Make the profile picture clickable only for non-admin users
function initializeProfilePicture(userData) {
    const profilePic = document.getElementById('userProfilePic');
    if (userData.role !== 'admin') {
        profilePic.style.cursor = 'pointer';
        profilePic.title = 'Click to update profile picture';
        profilePic.onclick = showProfilePictureModal;
    }
}

function showProfilePictureModal() {
    const modal = new bootstrap.Modal(document.getElementById('profilePictureModal'));
    modal.show();
}

// Add preview functionality
window.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.querySelector('#profilePictureForm input[type="file"]');
    const preview = document.getElementById('imagePreview');
    
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
});

async function uploadProfilePicture() {
    try {
        const form = document.getElementById('profilePictureForm');
        const formData = new FormData(form);
        
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE_PICTURE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update profile picture: ${errorText}`);
        }

        const result = await response.json();
        
        // Update the profile picture in the UI
        document.getElementById('userProfilePic').src = result.user.image || '../images/default-user.png';
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('profilePictureModal'));
        modal.hide();
        
        // Reset the form
        form.reset();
        document.getElementById('imagePreview').style.display = 'none';
        
        alert('Profile picture updated successfully');
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert(error.message);
    }
}

// Make the upload function globally accessible
window.uploadProfilePicture = uploadProfilePicture;

// Add event listener for form submission
document.addEventListener('DOMContentLoaded', function() {
    const doctorEditForm = document.getElementById('doctorEditForm');
    if (doctorEditForm) {
        doctorEditForm.addEventListener('submit', handleDoctorFormSubmit);
    }
});

// Handle form submission
async function handleDoctorFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Get form values
        const birthDateInput = document.getElementById('doctorBirthDate').value;
        const emailInput = document.getElementById('doctorEmail').value;
        const phoneInput = document.getElementById('doctorPhone').value;
        const expertiseLevelsInput = Array.from(document.getElementById('doctorExpertiseLevel').selectedOptions).map(opt => opt.value);

        // Create update object starting with current user data
        const updatedData = {
            birthDate: currentUserData.birthDate,
            email: currentUserData.email,
            phoneNumber: currentUserData.phoneNumber,
            expertiseLevel: currentUserData.expertiseLevel
        };

        // Only update fields that have been changed
        if (birthDateInput && birthDateInput !== new Date(currentUserData.birthDate).toISOString().split('T')[0]) {
            updatedData.birthDate = new Date(birthDateInput).toISOString();
        }
        if (emailInput && emailInput !== currentUserData.email) {
            updatedData.email = emailInput;
        }
        if (phoneInput && phoneInput !== currentUserData.phoneNumber) {
            updatedData.phoneNumber = phoneInput;
        }
        if (expertiseLevelsInput.length > 0 && JSON.stringify(expertiseLevelsInput) !== JSON.stringify(currentUserData.expertiseLevel)) {
            updatedData.expertiseLevel = expertiseLevelsInput;
        }

        console.log('Sending update:', updatedData); // Debug log

        const token = sessionStorage.getItem('authToken');
        const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        const result = await response.json();
        
        // Update the global user data
        currentUserData = result.user;
        
        // Update the display
        document.getElementById('expertiseLevel').textContent = 
            Array.isArray(currentUserData.expertiseLevel) 
                ? currentUserData.expertiseLevel.join(', ') 
                : currentUserData.expertiseLevel || 'Not specified';

        // Hide the form
        toggleEditMode();
        
        alert('Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert(error.message);
    }
}

// Add to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    const patientEditForm = document.getElementById('patientEditForm');
    if (patientEditForm) {
        patientEditForm.addEventListener('submit', handlePatientFormSubmit);
    }
});

// Add this function to populate patient form
function populatePatientForm(userData) {
    if (userData.birthDate) {
        const date = new Date(userData.birthDate);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById("patientBirthDate").value = formattedDate;
    }
    document.getElementById("patientName").value = userData.name || "";
    document.getElementById("patientEmail").value = userData.email || "";
    document.getElementById("patientPhone").value = userData.phoneNumber || "";
    document.getElementById("patientGender").value = userData.gender || "";
}

// Add patient form submission handler
async function handlePatientFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Get form elements with error checking
        const nameElement = document.getElementById('patientName');
        const birthDateElement = document.getElementById('patientBirthDate');
        const emailElement = document.getElementById('patientEmail');
        const phoneElement = document.getElementById('patientPhone');

        // Verify all elements exist
        if (!nameElement || !birthDateElement || !emailElement || !phoneElement) {
            console.error('Form elements missing:', {
                name: !!nameElement,
                birthDate: !!birthDateElement,
                email: !!emailElement,
                phone: !!phoneElement
            });
            throw new Error('Form is missing some elements. Please refresh the page.');
        }

        // Get form values
        const nameInput = nameElement.value;
        const birthDateInput = birthDateElement.value;
        const emailInput = emailElement.value;
        const phoneInput = phoneElement.value;

        // Create update object starting with current user data
        const updatedData = {
            name: currentUserData.name,
            birthDate: currentUserData.birthDate,
            email: currentUserData.email,
            phoneNumber: currentUserData.phoneNumber
        };

        // Only update fields that have been changed
        if (nameInput && nameInput !== currentUserData.name) {
            updatedData.name = nameInput;
        }
        if (birthDateInput && birthDateInput !== new Date(currentUserData.birthDate).toISOString().split('T')[0]) {
            updatedData.birthDate = new Date(birthDateInput).toISOString();
        }
        if (emailInput && emailInput !== currentUserData.email) {
            updatedData.email = emailInput;
        }
        if (phoneInput && phoneInput !== currentUserData.phoneNumber) {
            updatedData.phoneNumber = phoneInput;
        }

        console.log('Current user data:', currentUserData); // Debug log
        console.log('Form values:', { nameInput, birthDateInput, emailInput, phoneInput }); // Debug log
        console.log('Sending update:', updatedData); // Debug log

        const token = sessionStorage.getItem('authToken');
        const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        const result = await response.json();
        
        // Update the global user data
        currentUserData = result.user;
        
        // Update the display
        document.getElementById("userName").textContent = currentUserData.name;
        
        // Hide the form
        toggleEditMode();
        
        alert('Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert(error.message);
    }
}
