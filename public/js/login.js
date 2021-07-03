/*eslint-disable */
// import axios from 'axios';

import { showAlert } from './alert.js';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }

  // ALTERNATE METHOD
  //   try {
  //     const res = await fetch('http://localhost:3000/api/v1/users/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         email,
  //         password,
  //       }),
  //     });
  //     const mssg = await res.json();
  //     console.log(mssg);
  //   } catch (error) {
  //     console.log(error);
  //   }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if ((res.data.status = 'succuss')) window.location.replace('/');
  } catch (error) {
    console.log(error);
    showAlert('error', 'Error while logging out ! Please try again');
  }
};
