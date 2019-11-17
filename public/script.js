const websiteLink = 'http://localhost:8080/'
const jwtToken = 'Authorization';
const baseLink = websiteLink + 'rest/';
const barImgUrl = websiteLink + 'resources/img/bar/';
const loginForm = document.getElementById('loginForm');
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
        .done(response => {
            formInputs.insertAdjacentHTML('beforeend', `
                <div class="g-recaptcha mb-2" data-sitekey="${response}"></div>            
            `);
            
            $.loadScript('https://www.google.com/recaptcha/api.js', function() {});
        });

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        login();
    })
});

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
    failedNote = new Noty({
        text: "<span class='fa fa-lg fa-exclamation-circle'></span> &nbsp;" + errorInfo.type + "<br>" + errorInfo.details.join("<br>"),
        type: "error",
        layout: "bottomRight"
    }).show();
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

function getNormalText(text) {
    if (text === undefined || text === null) {
        return '';
    }
    return text;
}

function getDate(date) {
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    return day + '.' + month + '.' + date.getFullYear();
}

function getTime(date) {
    let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return hours + ':' + minutes;
}
