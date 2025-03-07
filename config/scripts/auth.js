export async function updateNavbarProfile() {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) return;
  
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) return;
      
      const userData = await response.json();
      
      // Update navbar images only
      const updateImage = (id) => {
        const img = document.getElementById(id);
        if (img) img.src = userData.image || '../images/default-user.png';
      };
      
      updateImage('profilePicMobile');
      updateImage('profilePicDesktop');
    } catch (error) {
      console.error('Profile update error:', error);
    }
  }