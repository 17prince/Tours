import { showAlert } from './alert.js';

// type can either be  "password" or 'data'
export const updateSettings = async (data, type) => {
  try {
    const Url =
      type === 'password'
        ? '/api/v1/users/updatemypassword'
        : '/api/v1/users/updateme';

    const res = await axios({
      method: 'PATCH',
      url: Url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Successfully Changed !`);
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
