const signUpForm = document.getElementById('signUpForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const pswdInput = document.getElementById('pswd');

signUpForm.addEventListener('submit', signUp);

async function signUp(e) {
    e.preventDefault();

    var signUpDetails = {
        name: nameInput.value,
        email: emailInput.value,
        password: pswdInput.value
    }

    try {
        const res = await axios
            .post('http://localhost:3000/user/signUp', signUpDetails);
        alert(res.data.message);
        window.location.href = "./login.html";
    } catch (err) {
        document.getElementById('errmsg').innerHTML = err.response.data.err;
        document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
    }
}