// Mock user data - Replace with actual backend integration
const currentUser = {
    role: 'admin', // Change this to test different views ('admin', 'doctor', 'patient')
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    birthDate: '1990-01-01'
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    // Set user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

    // Show appropriate view
    hideAllViews();
    document.getElementById(`${currentUser.role}View`).style.display = 'block';

    // Load initial data
    if (currentUser.role === 'admin') {
        loadDoctors();
    } else if (currentUser.role === 'doctor') {
        loadPatients();
    } else if (currentUser.role === 'patient') {
        loadDoctors();
    }

    // Show/hide edit button based on role
    const editButton = document.getElementById('editProfileBtn');
    editButton.style.display = currentUser.role === 'admin' ? 'none' : 'block';
}

function hideAllViews() {
    document.querySelectorAll('.role-view').forEach(view => {
        view.style.display = 'none';
    });
}

function toggleEditMode() {
    const formId = `${currentUser.role}EditForm`;
    const form = document.getElementById(formId);
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

// Admin Functions
function showAddDoctorForm() {
    const modal = new bootstrap.Modal(document.getElementById('addDoctorModal'));
    modal.show();
}

function submitAddDoctor() {
    // Implement doctor addition logic
    console.log('Adding new doctor...');
}

function populateDoctorForm(userData) {
    document.getElementById('doctorBirthDate').value = userData.birthDate || '';
    document.getElementById('doctorEmail').value = userData.email || '';
    document.getElementById('doctorPhone').value = userData.phone || '';
    // Add expertise level display
    document.getElementById('expertiseLevel').textContent = userData.expertiseLevel || 'Not specified';
}

async function loadDoctors() {
    try {
        const response = await fetch(API_ENDPOINTS.doctors);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        
        const doctors = await response.json();
        // Add expertise level to the displayed fields for doctors
        const tableHTML = createTable(doctors, getCurrentUserRole() === 'admin', {
            includedFields: ['name', 'email', 'phone', 'expertiseLevel', 'photo']
        });
        const container = getCurrentUserRole() === 'admin' ? 
            document.getElementById('tableContainer') : 
            document.getElementById('patientDoctorsTable');
        
        container.innerHTML = tableHTML;
    } catch (error) {
        console.error('Error loading doctors:', error);
        showError('Failed to load doctors list');
    }
}

function loadPatients() {
    // Mock patient data
    const patients = [
        { name: 'Alice Brown', age: 30, phone: '123-456-7890', email: 'alice@example.com', photo: 'default-user.png' }
    ];

    const tableHTML = createTable(patients, currentUser.role === 'admin');
    const container = currentUser.role === 'admin' ? 
        document.getElementById('tableContainer') : 
        document.getElementById('doctorPatientsTable');
    
    container.innerHTML = tableHTML;
}

function createTable(data, isAdmin, options = {}) {
    const { includedFields = null } = options;
    let headers = includedFields || Object.keys(data[0]);
    if (isAdmin) headers.push('Actions');

    let html = `
        <table class="table">
            <thead>
                <tr>
                    ${headers.map(h => {
                        // Format header text for better display
                        const headerText = h === 'expertiseLevel' ? 'Expertise Level' : 
                            h.charAt(0).toUpperCase() + h.slice(1);
                        return `<th>${headerText}</th>`;
                    }).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        html += '<tr>';
        headers.forEach(header => {
            if (header === 'Actions') {
                html += `<td><button class="btn btn-danger btn-sm" onclick="removeUser('${item.email}')">Remove</button></td>`;
            } else if (header === 'photo') {
                html += `<td><img src="../images/${item[header]}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%;"></td>`;
            } else if (header === 'expertiseLevel') {
                html += `<td><span class="badge bg-info">${item[header] || 'Not specified'}</span></td>`;
            } else {
                html += `<td>${item[header]}</td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

function removeUser(email) {
    // Implement user removal logic
    console.log('Removing user:', email);
} 