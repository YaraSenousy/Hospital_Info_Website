import API_ENDPOINTS from '../../apiEndPoints.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);

  const signupForm = document.getElementById('signupForm');
  signupForm.addEventListener('submit', handleSignup);
});

// In login.js
document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const password = document.getElementById('signupPassword').value;
  const errorList = document.getElementById('passwordErrorList');
  const errorModal = new bootstrap.Modal(document.getElementById('passwordErrorModal'));
  let errors = [];

  // Clear previous errors
  errorList.innerHTML = '';

  // Password validation checks
  if (password.length < 8) {
      errors.push("Must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
      errors.push("Must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
      errors.push("Must contain at least one number");
  }

  if (errors.length > 0) {
      // Add errors to list
      errors.forEach(error => {
          const li = document.createElement('li');
          li.textContent = error;
          errorList.appendChild(li);
      });
      
      // Show error modal
      errorModal.show();
  } else {
      // If valid, proceed with form submission
      console.log('Form is valid, submitting...');
      // Add your actual form submission logic here
  }
});

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

async function handleSignup(event) {
  event.preventDefault();

  const firstName = document.getElementById('signupFirstName').value;
  const lastName = document.getElementById('signupLastName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const birthDate = document.getElementById('signupBirthDate').value;
  const phoneNumber = document.getElementById('signupPhoneNumber').value;
  const gender = document.getElementById('signupGender').value;

  try {
    const response = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: `${firstName} ${lastName}`, email, password, birthDate, phoneNumber, gender })
    });

    if (response.status === 201) {
      const data = await response.json();
      console.log('Signup successful:', data);
      alert('Signup successful! Please log in.');
      window.location.href = 'login.html'; // Redirect to login page
    } else {
      const errorData = await response.json();
      console.error('Signup failed:', errorData.error);
      alert('Signup failed: ' + errorData.error);
    }
  } catch (error) {
    console.error('Error during signup:', error);
    alert('An error occurred. Please try again.');
  }
}
