const burger = document.querySelector('.menu-burger');
const navLiens = document.querySelector('.nav-liens');

burger.addEventListener('click', () => {
    navLiens.classList.toggle('ouvert');
});