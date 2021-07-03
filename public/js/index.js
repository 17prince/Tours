/*eslint-disable */

// import { present } from './babel.config'; // this is to run some js feature on the older browser

// const displayMap = require('./mapbox');
// const login = require('./login');
import { displayMap } from './mapbox.js';
import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { signUp } from './signup.js';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login');
const logoutUser = document.querySelector('#logout');
const signupForm = document.getElementById('sign-up');
const updateformData = document.querySelector('#update-form-data');
const updateformPassoword = document.querySelector('#update-form-password');
const savePasswordbtn = document.getElementById('save-password');
const bookbtn = document.getElementById('book-tour');
// DELEGATION
if (mapBox) {
  // Mapbox.js
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// login.js
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

// signup.js
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    console.log(name, email);

    signUp(name, email, password, confirmPassword);
  });
}

// logout user
if (logoutUser) {
  logoutUser.addEventListener('click', logout);
}

if (updateformData) {
  updateformData.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', updateformData.querySelector('#name').value);
    form.append('email', updateformData.querySelector('#email').value);
    form.append('photo', updateformData.querySelector('#photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (updateformPassoword) {
  updateformPassoword.addEventListener('submit', async (e) => {
    e.preventDefault();
    savePasswordbtn.textContent = 'Updating.....';
    const currentPassword =
      updateformPassoword.querySelector('#password-current').value;
    const password = updateformPassoword.querySelector('#password').value;
    const confirmPassword =
      updateformPassoword.querySelector('#password-confirm').value;
    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password'
    );
    savePasswordbtn.textContent = 'Save Password';
  });
}

// booking tour
if (bookbtn) {
  bookbtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing....';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
