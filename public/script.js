const websiteLink = 'http://localhost:8080/'
const jwtToken = 'Authorization';
const baseLink = websiteLink + 'rest/';
const barImgUrl = websiteLink + 'resources/img/bar/';
const loginForm = document.getElementById('loginForm');
const rememberMe = document.getElementById('rememberMe');
let failedNote;

$(() => {
    $.ajaxSetup({cache: false});

    $(document).ajaxError((event, jqXHR) => failNoty(jqXHR));

    jQuery.loadScript = function (url, callback) {
        jQuery.ajax({
            url: url,
            dataType: 'script',
            success: callback,
            async: true
        });
    }

    $.get(websiteLink + 'rest/api/recaptcha')
        .done(reCaptchaToken => {
            $.loadScript('https://www.google.com/recaptcha/api.js?render=' + reCaptchaToken, () => {
                grecaptcha.ready(() => {
                    grecaptcha.execute(reCaptchaToken, { action: 'login' })
                        .then(token => {
                            document.querySelectorAll('input[name="reCaptchaResponse"]').forEach(el => el.value = token);
                        });
                });
            });
        });

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        login();
    });

    let jwt = getCookie('jwt');
    if (jwt !== undefined) {
        proccessLogin(jwt);
    } else {
        $(loginRow).modal({ keyboard: false });
    }
});

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function closeNoty() {
    if (failedNote) {
        failedNote.close();
        failedNote = undefined;
    }
}

function successNoty(msg) {
    closeNoty();
    new Noty({
        text: "<span class='fa fa-lg fa-check'></span> &nbsp;" + msg,
        type: 'success',
        layout: "bottomRight",
        timeout: 1000
    }).show();
}

function failNoty(jqXHR) {
    closeNoty();
    const errorInfo = JSON.parse(jqXHR.responseText);

    if (errorInfo.type === 'VALIDATION_ERROR') {
        let resultErrors = errorInfo.details;
        let fields = errorInfo.fields;
        for (let error in fields) {
            let element = document.querySelector(`input:not([type="hidden"])[name="${error}"]`);
            if (element === null || element === undefined) {
                resultErrors.push(`${error} - ${fields[error]}`)
            } else {
                showErrorOnInput(element, fields[error]);
            }
        }
        failNotyText(errorInfo.type + "<br>" + resultErrors.join("<br>"));
    } else {
        failNotyText(errorInfo.type + "<br>" + errorInfo.details.join("<br>"));
    }
}

function failClosedNoty(jqXHR, timeout = 2000) {
    closeNoty();
    const errorInfo = JSON.parse(jqXHR.responseText);
    failedNote = new Noty({
        text: "<span class='fa fa-lg fa-exclamation-circle'></span> &nbsp;" + errorInfo.type + "<br>" + errorInfo.details.join("<br>"),
        type: "error",
        layout: "bottomRight",
        timeout
    }).show();
}

function failNotyText(text, timeout = 2000) {
    failedNote = new Noty({
        text: "<span class='fa fa-lg fa-exclamation-circle'></span> &nbsp;" + text,
        type: "error",
        layout: "bottomRight",
        timeout
    }).show();
}

function showErrorOnInput(errorElement, errorText) {
    errorElement.classList.add('is-invalid');

    let errorInfoElement = null;
    let formGroup = errorElement.closest('.form-group');
    if (formGroup !== null) {
        errorInfoElement = formGroup.querySelector('.invalid-feedback');
        if (errorInfoElement !== null) {
            errorInfoElement.hidden = false;
            errorInfoElement.textContent = errorText;
        }
    }

    errorElement.addEventListener('input', e => {
        errorElement.classList.remove('is-invalid');
        if (errorInfoElement !== null) {
            errorInfoElement.hidden = true;
        }
    });
}

function getNormalText(text) {
    if (text === undefined || text === null) {
        return '';
    }
    return text;
}

function formDataToArray(form) {
    let data = {};
    form.querySelectorAll('input, select').forEach(element => {
        if (element.type === 'checkbox') {
            data[element.name] = element.checked;
        } else {
            data[element.name] = element.value;
        }
    });
    return data;
}

function formDataToJson(form) {
    let data = formDataToArray(form);
    return JSON.stringify(data);
}