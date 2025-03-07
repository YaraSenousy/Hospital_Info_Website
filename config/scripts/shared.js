// shared.js
import { updateNavbarProfile } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  await updateNavbarProfile();
});

import API_ENDPOINTS from "../../apiEndPoints.js";

document.addEventListener("DOMContentLoaded", function () {
  initializeIndexPage();
});

async function initializeIndexPage() {
  try {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      // If no token, user is not logged in
      updateNavbarForLoggedOutUser();
      return;
    }

    const response = await fetch(API_ENDPOINTS.PROFILE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userData = await response.json();
    updateNavbarForLoggedInUser(userData);
  } catch (error) {
    console.error("Error initializing index page:", error);
    updateNavbarForLoggedOutUser();
  }
}

function updateNavbarForLoggedInUser(userData) {
  // Update profile picture
  const profilePicMobile = document.getElementById('profilePicMobile');
  const profilePicDesktop = document.getElementById('profilePicDesktop');
  
  if (profilePicMobile) {
    profilePicMobile.src = userData.image || '../images/default-user.png';
  }
  if (profilePicDesktop) {
    profilePicDesktop.src = userData.image || '../images/default-user.png';
  }

  // Show logged-in elements, hide logged-out elements
  document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'none');
}

function updateNavbarForLoggedOutUser() {
  // Show logged-out elements, hide logged-in elements
  document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'none');
}

// You can add more index-specific functions here