/*elslint-disable */

export const hideAlert = () => {
  const ele = document.querySelector('.alert');
  if (ele) {
    ele.parentElement.removeChild(ele);
  }
};

export const showAlert = (type, mssg, time = 5) => {
  hideAlert();
  // type is either 'success' or 'error'
  const markup = `<div class = "alert alert--${type}">${mssg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};
