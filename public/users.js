const usersTable = document.getElementById('usersTable');
const editRow = document.getElementById('editRow');
const loadMsg = document.getElementById('loadMsg');
const classList = document.getElementById('classList');
const formInputs = document.getElementById('formInputs');
const titleRow = document.getElementById('titleRow');
const saveButton = document.getElementById('saveButton');
const newRfidForm = document.getElementById('newRfidForm');
let classes, lastCard, creditCards, storage, selectedUserId;
let currentClass = 5;

$(() => {
    $(loginRow).on('hide.bs.modal', e => {
        lastCard = null;
        return loginRowHideAble;
    });

    saveButton.addEventListener('click', e => {
        e.preventDefault();

        $.ajax({
            url: baseLink + `bar/rfid/${selectedUserId}`,
            method: 'POST',
            contentType: 'application/json',
            data: formDataToJson(newRfidForm)
        }).done(() => {
            successNoty('Вы успешно обновили RFID пользователя!');
            $(editRow).modal('hide');
            render();
        });
    });

    let socket = io();
    socket.on('card', card => {
        card = card.substr(20);
        if (!card.startsWith('Card detected, UID:') || lastCard === card) {
            return;
        }

        lastCard = card;

        let input = newRfidForm.querySelector('input[name="RFID"]');
        if (input !== undefined && input !== null) {
            input.value = card;
        }
        
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
            $.get(baseLink + 'api/classes')
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
            storage = response;
            response.forEach((user, id) => {
                usersTable.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.surname}</td>
                    <td>${user.username}</td>
                    <td>${user.balance}</td>
                    <td>${getNormalText(user.creditCard)}</td>
                    <td class="fa fa-pencil-alt custom-button" onclick="connectRFID(${id})"></td>
                </tr>
                `);
            });
        });
}

function connectRFID(userId) {
    let user = storage[userId];
    titleRow.textContent = `Обновить RFID: ${user.name} ${user.surname}`;
    newRfidForm.innerHTML = `
        <div class="form-group">
            <label for="RFIDInput" class="col-form-label">RFID</label>
            <input type="text" class="form-control" id="RFIDInput" name="RFID" placeholder="RFID" value="${getNormalText(user.RFID)}">
            <div class="invalid-feedback" hidden></div>
        </div>
        <div class="form-group">
            <label for="creditCardInput" class="col-form-label">Номер карты</label>
            <input type="text" class="form-control" id="creditCardInput" name="creditCard" placeholder="Номер карты" value="${getNormalText(user.creditCard)}">
            <div class="invalid-feedback" hidden></div>
        </div>
        ${chooseCardType(user.cardType)}
    `;
    selectedUserId = user.id;
    $(editRow).modal();
}

function chooseCardType(cardType) {
    return `
        <div class="form-group">
            <label for="cardTypeInput" class="col-form-label">Тип кредитной карты</label>
            <select name="cardType" id="cardTypeInput" class="form-control">
                ${creditCards.reduce((acc, item) => {
                    return acc += `
                        <option value="${item.codeName}" ${cardType === item.codeName ? 'selected' : ''}>${item.name}</option>
                    `;   
                }, '')}
            </select>
        </div>
    `;
}
