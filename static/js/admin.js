document.addEventListener(
    'DOMContentLoaded',
    () => {
        const input_author_img = document.getElementById('author_img')
        input_author_img.addEventListener('change', previewAuthorImg)

        const input_hero_img = document.getElementById('hero_img')
        input_hero_img.addEventListener('change', previewHeroImg)

        const input_hero_img_small = document.getElementById('hero_img_small')
        input_hero_img_small.addEventListener('change', previewHeroImgSmall)

        const remove_author_img = document.getElementById('input__remove_author')
        remove_author_img.addEventListener('click', removeAuthorImg)

        const remove_hero_img = document.getElementById('input__remove_hero')
        remove_hero_img.addEventListener('click', removeHeroImg)

        const remove_hero_img_small = document.getElementById('input__remove_hero_small')
        remove_hero_img_small.addEventListener('click', removeHeroImgSmall)

        const publish = document.getElementById('publish_button')
        publish.addEventListener('click', sendForm)
        /* const form = document.getElementById('form')
        form.addEventListener('submit', sendForm) */

        const logout = document.getElementById('logout')
        logout.addEventListener('click', logOut)

        document.getElementById('author_img').required = true
        document.getElementById('hero_img').required = true
        document.getElementById('hero_img_small').required = true

        document.querySelectorAll('.field').forEach(function (input) {
            input.addEventListener(
                'change',
                () => {
                    previewTextData()
                }
            );
        });
    }
)

let data = {
    title: '',
    subtitle: '',
    author_name: '',
    author_img: '',
    author_img_name: '',
    date: '',
    hero_img: '',
    hero_img_name: '',
    content: ''
}

function previewTextData() {
    const title = document.getElementById('title').value
    const subtitle = document.getElementById('subtitle').value
    const author_name = document.getElementById('author').value
    const date = document.getElementById('publish_date').value
    const content = document.getElementById('content').value

    if (title) {
        document.getElementById('article_preview_title').textContent = title
        document.getElementById('card_preview_title').textContent = title
        data.title = title
    }
    if (subtitle) {
        document.getElementById('article_preview_subtitle').textContent = subtitle
        document.getElementById('card_preview_subtitle').textContent = subtitle
        data.subtitle = subtitle
    }
    if (author_name) {
        document.getElementById('author__name').textContent = author_name
        data.author_name = author_name
    }
    if (date) {
        document.getElementById('bottom__date').textContent = date
        data.date = date
    }
    if (content) {
        data.content = content
    }
}

function previewAuthorImg() {
    const card_preview = document.querySelector('.author__image')
    const input_field = document.querySelector('.load__author-photo')
    const file = document.getElementById('author_img').files[0]
    data.author_img_name = file.name
    const reader = new FileReader()
    reader.addEventListener(
        'load',
        () => {
            card_preview.src = reader.result
            input_field.src = reader.result
            data.author_img = reader.result
            document.querySelector('.load__text').classList.add('hidden')
            document.getElementById('buttons_author').classList.remove('hidden')
            document.getElementById('buttons_author').classList.add('showed')
            document.getElementById('buttons_author').classList.add('showed_on-side')
        },
        false
    )

    if (file) {
        reader.readAsDataURL(file)
    }

}

function previewHeroImg() {
    const article_preview = document.querySelector('.article__image')
    const input_field = document.getElementById('load__hero_img')
    const file = document.getElementById('hero_img').files[0]
    data.hero_img_name = file.name
    const reader = new FileReader()
    reader.addEventListener(
        'load',
        () => {
            article_preview.src = reader.result
            input_field.src = reader.result
            data.hero_img = reader.result
            document.getElementById('input__correction_big').classList.add('hidden')
            document.getElementById('buttons_hero').classList.remove('hidden')
            document.getElementById('buttons_hero').classList.add('showed')
        },
        false
    )

    if (file) {
        reader.readAsDataURL(file)
    }
}

function previewHeroImgSmall() {
    const card_preview = document.querySelector('.card__image')
    const input_field = document.getElementById('load__hero_img_small')
    const file = document.getElementById('hero_img_small').files[0]
    const reader = new FileReader()
    reader.addEventListener(
        'load',
        () => {
            card_preview.src = reader.result
            input_field.src = reader.result
            document.getElementById('input__correction_small').classList.add('hidden')
            document.getElementById('buttons_hero_small').classList.remove('hidden')
            document.getElementById('buttons_hero_small').classList.add('showed')
        },
        false
    )

    if (file) {
        reader.readAsDataURL(file)
    }
}

function removeAuthorImg(event) {
    event.preventDefault()
    const card_preview = document.querySelector('.author__image')
    const input_field = document.getElementById('load__author-photo')
    card_preview.src = '../../static/images/author-load.png'
    input_field.src = '../../static/images/author-input.png'
    data.author_img = ''
    data.author_img_name = ''
    document.querySelector('.load__text').classList.remove('hidden')
    document.getElementById('buttons_author').classList.remove('showed')
    document.getElementById('buttons_author').classList.remove('showed_on-side')
    document.getElementById('buttons_author').classList.add('hidden')
}

function removeHeroImg(event) {
    event.preventDefault()
    const article_preview = document.querySelector('.article__image')
    const input_field = document.getElementById('load__hero_img')
    article_preview.src = '../../static/images/article-load.png'
    input_field.src = '../../static/images/hero-image-input-big.png'
    data.hero_img = ''
    data.hero_img_name = ''
    document.getElementById('input__correction_big').classList.remove('hidden')
    document.getElementById('buttons_hero').classList.remove('showed')
    document.getElementById('buttons_hero').classList.add('hidden')
}

function removeHeroImgSmall(event) {
    event.preventDefault()
    const card_preview = document.querySelector('.card__image')
    const input_field = document.getElementById('load__hero_img_small')
    card_preview.src = '../../static/images/post-load.png'
    input_field.src = '../../static/images/hero-image-input-small.png'
    document.getElementById('input__correction_small').classList.remove('hidden')
    document.getElementById('buttons_hero_small').classList.remove('showed')
    document.getElementById('buttons_hero_small').classList.add('hidden')
}

async function sendForm(event) {
    event.preventDefault()
    hideMessages()
    const jsonData = JSON.stringify(data)
    let errors = validateForm(data)
    if (errors.error) {
        sendErrors(errors)
    }
    else
    {
        console.log(data)
        setSuccess()
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    
        try {
            if (!response.ok) {
                throw new Error('Все сломалось :(');
            }
        } catch (error) {
            console.log('Возникла проблема с вашим fetch запросом: ', error.message);
        }
    
        return await response.json(); // parses JSON response into native JavaScript objects
    }
}

async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    try {
        if (!response.ok) {
            throw new Error('Все сломалось :(');
        }
    } catch (error) {
        console.log('Возникла проблема с вашим fetch запросом: ', error.message);
    }

    return await response.json(); // parses JSON response into native JavaScript objects

}

function validateForm(data) {
    let error = false
    let messageError = ''
    let titleError = ''
    let subtitleError = ''
    let authorNameError = ''
    let authorImgError = ''
    let dateError = ''
    let heroImgError = ''
    let contentError = ''
    if (data.title == '')
    {
        error = true
        titleError = 'Title is required.'
    }
    if (data.subtitle == '')
    {
        error = true
        subtitleError = 'Description is required.'
    }
    if (data.author_name == '')
    {
        error = true
        authorNameError = 'Author name is required.'
    }
    if (data.author_img == '')
    {
        error = true
        authorImgError = 'Author photo is required.'
    }
    if (data.date == '')
    {
        error = true
        dateError = 'Publish date is required.'
    }
    if (data.hero_img == '')
    {
        error = true
        heroImgError = 'Hero image is required.'
    }
    if (data.content == '')
    {
        error = true
        contentError = 'Content is required.'
    }

    if (error)
    {
        messageError = 'Whoops! Some fields need your attention :o'
    }

    return {
        error: error,
        messageError: messageError,
        titleError: titleError,
        subtitleError: subtitleError,
        authorNameError: authorNameError,
        authorImgError: authorImgError,
        dateError: dateError,
        heroImgError: heroImgError,
        contentError: contentError,
    }
}

function hideMessages() {
    const errorBox = document.getElementById('error-box')
    const successBox = document.getElementById('success-box')
    const commentTitle = document.getElementById('comment-title')
    const commentSubtitle = document.getElementById('comment-subtitle')
    const commentAuthorName = document.getElementById('comment-author')
    const commentAuthorImg = document.getElementById('comment-author-img')
    const commentDate = document.getElementById('comment-date')
    const commentHeroImg = document.getElementById('comment-hero-img')
    const commentHeroImgSmall = document.getElementById('comment-hero-img-small')
    const commentContent = document.getElementById('comment-content')
    unsetError(commentTitle)
    unsetUnderline(document.getElementById('title'))
    unsetError(commentSubtitle)
    unsetUnderline(document.getElementById('subtitle'))
    unsetError(commentAuthorName)
    unsetUnderline(document.getElementById('author'))
    unsetError(commentAuthorImg)
    unsetError(commentDate)
    unsetUnderline(document.getElementById('publish_date'))
    unsetError(commentHeroImg)
    unsetError(commentHeroImgSmall)
    unsetError(commentContent)
    errorBox.classList.add('hidden')
    errorBox.classList.remove('message-showed')
    successBox.classList.add('hidden')
    successBox.classList.remove('message-showed')
}

function unsetError(comment) {
    comment.classList.add('hidden')
}

function unsetUnderline(inputField) {
    inputField.classList.remove('field__input_underline')
}

function sendErrors(errors) {
    const errorBox = document.getElementById('error-box')
    const commentTitle = document.getElementById('comment-title')
    const commentSubtitle = document.getElementById('comment-subtitle')
    const commentAuthorName = document.getElementById('comment-author')
    const commentAuthorImg = document.getElementById('comment-author-img')
    const commentDate = document.getElementById('comment-date')
    const commentHeroImg = document.getElementById('comment-hero-img')
    const commentHeroImgSmall = document.getElementById('comment-hero-img-small')
    const commentContent = document.getElementById('comment-content')
    console.log(commentHeroImg)
    console.log(commentHeroImgSmall)

    
    if (errors.messageError)
    {
        errorBox.classList.remove('hidden')
        errorBox.classList.add('message-showed')
    }
    if (errors.titleError)
    {
        setError(commentTitle, errors.titleError)
        setUnderline(document.getElementById('title'))
    }
    if (errors.subtitleError)
    {
        setError(commentSubtitle, errors.subtitleError)
        setUnderline(document.getElementById('subtitle'))
    }
    if (errors.authorNameError)
    {
        setError(commentAuthorName, errors.authorNameError)
        setUnderline(document.getElementById('author'))
    }
    if (errors.authorImgError)
    {
        setError(commentAuthorImg, errors.authorImgError)
    }
    if (errors.dateError)
    {
        setError(commentDate, errors.dateError)
        setUnderline(document.getElementById('publish_date'))
    }
    if (errors.heroImgError)
    {
        setError(commentHeroImg, errors.heroImgError)
        setError(commentHeroImgSmall, errors.heroImgError)
    }
    if (errors.contentError)
    {
        setError(commentContent, errors.contentError)
    }
}

function setError(comment, error) {
    comment.classList.remove('hidden')
    comment.innerHTML = error
}

function setUnderline(inputField) {
    inputField.classList.add('field__input_underline')
}

function setSuccess() {
    const successBox = document.getElementById('success-box')
    successBox.classList.remove('hidden')
    successBox.classList.add('message-showed')
}

async function logOut() {
    /* let XHR = new XMLHttpRequest();
    XHR.onreadystatechange = () => {
        if (XHR.readyState == 4) {
            if (XHR.status == 200){
                window.location.href = '/login'
            }
        }
    };
    XHR.open('POST', '/api/logout');
    XHR.send(); */

    const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: null,
    })

    try {
        if (!response.ok) {
            throw new Error('Все сломалось :(')
        }
    } catch (error) {
        console.log('Возникла проблема с вашим fetch запросом: ', error.message)
    }

    return await response.json() // parses JSON response into native JavaScript objects
}