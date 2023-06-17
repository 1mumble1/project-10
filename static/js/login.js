const openEye = '../static/images/eye.png'
const closeEye = '../static/images/eye-off.png'

document.getElementById('eye').onclick = showPassword

function showPassword() {
    const eye = document.getElementById('eye')
    const password = document.getElementById('password')

    eye.onclick = hidePassword
    eye.setAttribute('src', closeEye)

    password.setAttribute('type', 'text')
}

function hidePassword() {
    const eye = document.getElementById('eye')
    const password = document.getElementById('password')

    eye.onclick = showPassword
    eye.setAttribute('src', openEye)

    password.setAttribute('type', 'password')
}


document.getElementById('submit').onclick = loginUser
/* const form = document.getElementById('form')
form.addEventListener('submit', loginUser) */

async function loginUser() {
    try {
        hideMessages()
        const emailField = document.getElementById('email')
        const passwordField = document.getElementById('password')
        let data = {
            email: emailField.value,
            password: passwordField.value
        }

        let errors = validateForm(data)
        if (errors.error) {
            sendErrors(errors)
        }
        else {

            /* fetch('/article/fetch/post/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            }).then(() => {
                window.location.href = '/admin'
            }) */

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                window.location.href = '/admin'
                return;
            } else {
                sendErrorLogin()
                throw new Error(`${response.status}: ${response.statusText}`)
            }

            // let XHR = new XMLHttpRequest();
            // XHR.onreadystatechange = () => {
            //     if (XHR.readyState === 4) {
            //         if (XHR.status == 200) {
            //         }
            //         else {
            //             sendErrorLogin()
            //         }
            //     }
            // }
            // XHR.open('POST', '/api/login')
            // XHR.send(JSON.stringify(data))
        }
    } catch (error) {
        throw error;
    }
}

function sendErrorLogin() {
    const messageBox = document.getElementById('message-box')
    messageBox.classList.remove('hidden')
    messageBox.classList.add('message-showed')
    const messageText = document.getElementById('message__text')
    messageText.innerHTML = 'Email or password is incorrect.'
}

function validateForm(data) {
    const emailRe = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,4}$/i
    let error = false
    let messageError = ''
    let emailError = ''
    let passwordError = ''
    const email = data.email
    const password = data.password
    if (email == '') {
        messageError = 'A-Ah! Check all fields.'
        emailError = 'Email is required.'
        error = true
    }
    else if (!emailRe.test(email)) {
        messageError = 'Email or password is incorrect.'
        emailError = 'Incorrect email format. Correct format is ****@**.***'
        error = true
    }
    if (password == '') {
        messageError = 'A-Ah! Check all fields.'
        passwordError = 'Password is required.'
        error = true
    }
    return {
        error: error,
        messageError: messageError,
        emailError: emailError,
        passwordError: passwordError,
    }
}

function sendErrors(errors) {
    const messageBox = document.getElementById('message-box')
    const messageText = document.getElementById('message__text')
    const commentEmail = document.getElementById('comment-email')
    const commentPassword = document.getElementById('comment-password')

    const emailField = document.getElementById('email')
    const passwordField = document.getElementById('password')

    if (errors.messageError) {
        messageBox.classList.remove('hidden')
        messageText.innerHTML = errors.messageError
        messageBox.classList.add('message-showed')
    }
    if (errors.emailError) {
        commentEmail.classList.remove('hidden')
        commentEmail.innerHTML = errors.emailError
        emailField.classList.add('field__input_underline')
    }
    if (errors.passwordError) {
        commentPassword.classList.remove('hidden')
        commentPassword.innerHTML = errors.passwordError
        passwordField.classList.add('field__input_underline')
    }
}

function hideMessages() {
    document.getElementById('message-box').classList.add('hidden')
    document.getElementById('comment-email').classList.add('hidden')
    document.getElementById('comment-password').classList.add('hidden')
    document.getElementById('email').classList.remove('field__input_underline')
    document.getElementById('password').classList.remove('field__input_underline')
    document.getElementById('message-box').classList.remove('message-showed')
    /* document.getElementById('message-box').classList.add('message-hided') */
}