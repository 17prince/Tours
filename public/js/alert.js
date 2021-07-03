/*elslint-disable */

export const hideAlert = () => {
  const ele = document.querySelector('.alert');
  if (ele) {
    ele.parentElement.removeChild(ele);
  }
};

export const showAlert = (type, mssg) => {
  hideAlert();
  // type is either 'success' or 'error'
  const markup = `<div class = "alert alert--${type}">${mssg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
