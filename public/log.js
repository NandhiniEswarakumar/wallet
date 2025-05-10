// Ensure this script runs only on login/signup page
if (window.location.pathname.endsWith('index.html')) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showLogin = document.getElementById('showLogin');
    const showSignup = document.getElementById('showSignup');
  
    showLogin.onclick = () => {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      showLogin.classList.add('bg-teal-500');
      showSignup.classList.remove('bg-teal-500');
      showSignup.classList.add('bg-gray-400');
    };
  
    showSignup.onclick = () => {
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      showSignup.classList.add('bg-teal-500');
      showLogin.classList.remove('bg-teal-500');
      showLogin.classList.add('bg-gray-400');
    };
  
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = signupForm.querySelector('input[type="email"]').value;
      const password = signupForm.querySelector('input[type="password"]').value;

      // Check if the email is already registered
      if (localStorage.getItem('userEmail') === email) {
        alert('Account already in use. Please log in.');
      } else {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        alert('Signup successful! Please log in.');
        showLogin.click();
      }
    });
  
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = loginForm.querySelector('input[type="email"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;
  
      if (
        email === localStorage.getItem('userEmail') &&
        password === localStorage.getItem('userPassword')
      ) {
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'home.html';
      } else {
        alert('Incorrect email or password');
      }
    });
  }