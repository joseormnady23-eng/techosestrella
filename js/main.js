function scrollToContact() {
  document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
}

function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

function handleSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('form-msg');
  msg.textContent = '¡Mensaje enviado! Te contactaremos pronto.';
  e.target.reset();
  setTimeout(() => { msg.textContent = ''; }, 5000);
}
