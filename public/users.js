const usersTable = document.getElementById('usersTable');
const editRow = document.getElementById('editRow');
const loadMsg = document.getElementById('loadMsg');
const classList = document.getElementById('classList');
const formInputs = document.getElementById('formInputs');
const titleRow = document.getElementById('titleRow');
const saveButton = document.getElementById('saveButton');
const newRFIDInput = document.getElementById('newRFIDInput');
const userIdInput = document.getElementById('userIdInput');
let currentClass = 5;
let classes, lastCard, creditCards;

$(() => {
    $(loginRow).on('hide.bs.modal', e => {
        lastCard = null;
        return loginRowHideAble;
    });

    saveButton.addEventListener('click', e => {
        e.preventDefault();

        let userId = userIdInput.value;
        let newRFID = newRFIDInput.value;

        $.ajax({
            url: baseLink + `bar/rfid/${userId}?newRFID=${newRFID}`,
            method: 'POST'
        }).done(() => {
            successNoty('Вы успешно обновили RFID пользователя!');
            $(editRow).modal('hide');
            render();
        });
    });

    let socket = io();
    socket.on('card', card => {
        card = card.substr(20);
        if (lastCard === card) {
            return;
        }

        lastCard = card;
        newRFIDInput.value = card;
        successNoty('Set user RFID = ' + card);
    });
});

function login() {
    $.ajax({
        url: baseLink + `login`,
        method: 'POST',
        data: $(loginForm).serialize(),
        error: request => done(request),
        success: (data, status, request) => done(request)
    });

    function done(request) {
        let token = request.getResponseHeader(jwtToken);
        if (token === null) {
            failNotyText('Вы ввели неверный логин или пароль');
            return;
        }

        proccessLogin(token);

        if (rememberMe.checked) {
            document.cookie = `jwt=${token}; max-age=3600`;
        }
    }
}

function proccessLogin(token) {
    $(document).ajaxSend((e, xhr) => {
        xhr.setRequestHeader(jwtToken, token);
    });
    loginRowHideAble = true;
    $(loginRow).modal('hide');
    loadInfo();
}

function loadInfo() {
    $.get(baseLink + 'api/creditcard')
        .done(response => creditCards = response);

    $.get(baseLink + 'users/profile')
        .done(response => {
            $.get(baseLink + 'users/classes')
                .done(response => {
                    classes = response;

                    response.forEach(clazz => {
                        classList.insertAdjacentHTML('beforeend', `
                            <li class="page-item custom-button">
                                <a class="page-link">${clazz}</a>
                            </li>
                        `);
                    });

                    classList.children[0].classList.add('active');
                });

            render();
            classList.addEventListener('click', e => {
                let target = e.target;
                classList.querySelector('.active').classList.remove('active');
                target.closest('li').classList.add('active');
                if (target.dataset.param !== undefined) {
                    currentClass = target.dataset.param;
                } else {
                    currentClass = target.textContent;
                }
                render();
            });
        });    
};

function render() {
    loadMsg.classList.add('spinner-border');
    fetch(baseLink + 'users?class=' + currentClass)
        .then(response => response.json())
        .then(response => {
            loadMsg.classList.remove('spinner-border');
            usersTable.innerHTML = '';
            response.forEach(user => {
                usersTable.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.surname}</td>
                    <td>${user.username}</td>
                    <td>${user.balance}</td>
                    <td>${getNormalText(user.creditCard)}</td>
                    <td class="fa fa-pencil custom-button" onclick="connectRFID(${user.id}, '${user.name} ${user.surname}', '${getNormalText(user.RFID)}')">C</td>
                </tr>
                `);
            });
        });
}

function connectRFID(userId, name, RFID) {
    titleRow.textContent = `Обновить RFID: ${name}`;
    userIdInput.value = userId;
    newRFIDInput.value = RFID;
    $(editRow).modal();
}
