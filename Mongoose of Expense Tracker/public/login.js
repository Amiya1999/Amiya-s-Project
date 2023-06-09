// const loginForm = document.getElementById('loginForm');
// loginForm.addEventListener('submit', login);

document.getElementById('login').onclick = async function login(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginDetails = { email, password };

  try {
    const response = await axios.post('http://localhost:3000/user/login', loginDetails);
    localStorage.setItem('token', response.data.token);
    window.location.href = './expense.html';
  } catch (err) {
    console.log(JSON.stringify(err));
    document.getElementById('errmsg').innerHTML = err.response.data.message;
    document.body.innerHTML += `<div style="color:red;">${err.message}</div>`;
  }
}
