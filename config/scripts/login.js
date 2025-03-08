import API_ENDPOINTS from '../../apiEndPoints.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);

  const signupForm = document.getElementById('signupForm');
  signupForm.addEventListener('submit', handleSignup);
});

// In login.js
// document.getElementById('signupForm').addEventListener('submit', function(e) {
//   e.preventDefault();
//   const password = document.getElementById('signupPassword').value;
//   const errorList = document.getElementById('passwordErrorList');
//   const errorModal = new bootstrap.Modal(document.getElementById('passwordErrorModal'));
//   let errors = [];

//   // Clear previous errors
//   errorList.innerHTML = '';

//   // Password validation checks
//   if (password.length < 8) {
//       errors.push("Must be at least 8 characters");
//   }
//   if (!/[A-Z]/.test(password)) {
//       errors.push("Must contain at least one uppercase letter");
//   }
//   if (!/[0-9]/.test(password)) {
//       errors.push("Must contain at least one number");
//   }

//   if (errors.length > 0) {
//       // Add errors to list
//       errors.forEach(error => {
//           const li = document.createElement('li');
//           li.textContent = error;
//           errorList.appendChild(li);
//       });
      
//       // Show error modal
//       errorModal.show();
//   } else {
//       // If valid, proceed with form submission
//       console.log('Form is valid, submitting...');
//       // Add your actual form submission logic here
//   }
// });

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      //credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log('Login successful:', data.message);
      sessionStorage.setItem('authToken', data.accessToken);
      window.location.href = 'profile.html'; // Redirect to profile page
    } else {
      const errorData = await response.json();
      console.error('Login failed:', errorData.message);
      alert('Login failed: ' + errorData.message);
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('An error occurred. Please try again.');
  }
}

// Initialize the modal ONCE outside the function to avoid multiple instances
const errorModal = new bootstrap.Modal(document.getElementById('passwordErrorModal'));
const modalElement = document.getElementById('passwordErrorModal');

// Add cleanup handler once
modalElement.addEventListener('hidden.bs.modal', function() {
  // Remove backdrop if it exists
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
  
  // Reset body styling
  document.body.style.paddingRight = '';
  document.body.classList.remove('modal-open');
});

async function handleSignup(event) {
  event.preventDefault();

  // Get form values
  const password = document.getElementById('signupPassword').value;
  const errorList = document.getElementById('passwordErrorList');
  let errors = [];

  // Clear previous errors
  errorList.innerHTML = '';

  // Password validation checks
  if (password.length < 8) errors.push("Must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Must contain one uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("Must contain one number");

  // Show errors if validation fails
  if (errors.length > 0) {
    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      errorList.appendChild(li);
    });
    errorModal.show();
    return;
  }

  // Proceed with signup if validation passes
  const firstName = document.getElementById('signupFirstName').value;
  const lastName = document.getElementById('signupLastName').value;
  const email = document.getElementById('signupEmail').value;
  const birthDate = document.getElementById('signupBirthDate').value;
  const phoneNumber = document.getElementById('signupPhoneNumber').value;
  const gender = document.getElementById('signupGender').value;

  try {
    const response = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        email,
        password,
        birthDate,
        phoneNumber,
        gender,
      }),
    });

    if (response.status === 201) {
      alert('Signup successful! Please log in.');
      window.location.href = 'login.html';
    } else {
      const errorData = await response.json();
      alert('Signup failed: ' + errorData.error);
    }
  } catch (error) {
    console.error('Error during signup:', error);
    alert('An error occurred. Please try again.');
  }
}