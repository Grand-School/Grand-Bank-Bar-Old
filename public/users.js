const usersTable = document.getElementById('usersTable');
const editRow = document.getElementById('editRow');
const titleRow = document.getElementById('titleRow');
const formRow = document.getElementById('formRow');
const saveButtonRow = document.getElementById('saveButton');
const loadMsg = document.getElementById('loadMsg');
const classList = document.getElementById('classList');
const formInputs = document.getElementById('formInputs');
let userRole = 'ROLE_RESPONSIBLE';
let currentClass = 5;
let updateUrl, createUrl, classes, lastCard;

$(() => {
    $(loginRow).on('hide.bs.modal', e => loginRowHideAble);
    $(loginRow).modal({ keyboard: false });

    let socket = io();
    socket.on('card', card => {
        card = card.substr(20);
        if (lastCard === card) {
            return;
        }

        let RFID = document.getElementById('RFID');
        if (RFID !== null) {
            console.log(card);
            lastCard = card;
            RFID.value = card;
            successNoty('Set user RFID = ' + card);
        }
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

        $(document).ajaxSend((e, xhr) => {
            xhr.setRequestHeader(jwtToken, token);
        });
        loginRowHideAble = true;
        $(loginRow).modal('hide');
        loadInfo();
    }
}

function loadInfo() {
    $.get(baseLink + 'users/profile')
        .done(response => {
            userRole = response.role;

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

            if (userRole === 'ROLE_ADMIN') {
                updateUrl = baseLink + 'users';
                createUrl = baseLink + 'users/create';
            } else if (userRole === 'ROLE_RESPONSIBLE') {
                updateUrl = baseLink + 'users/update';
                createUrl = baseLink + 'users/create/responsible';
            }
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
                    <td>${user.name}</td>
                    <td>${user.surname}</td>
                    <td>${user.username}</td>
                    <td>${user.role}</td>
                    <td>${user.balance}</td>
                    <td>${getNormalText(user.creditCard)}</td>
                    <td class="fa fa-pencil custom-button" onclick="update(${user.id}, '${user.name}')">E</td>
                    <td class="fa fa-remove custom-button" onclick="remove(${user.id}, '${user.name}')">D</td>
                    <td class="fa fa-lock custom-button" onclick="password(${user.id}, '${user.name}')"></td>
                </tr>
                `);
            });
        });
}

function createUserModal() {
    titleRow.innerText = 'Создать пользователя';
    saveButtonRow.onclick = create;
    formRow.innerHTML = `
                ${getBaseDataDiv({}, true)}
                ${getRolesDiv('ROLE_USER')}
            `;
    $('[data-toggle="tooltip"]').tooltip();
    $(editRow).modal();
}

function update(userId, userName) {
    $.ajax(baseLink + 'users/' + userId)
        .done(response => {
            titleRow.innerText = 'Обновить: ' + userName;
            saveButtonRow.onclick = save;
            formRow.innerHTML = `
                ${getIdDiv(response.id)}          
                     
                ${getBaseDataDiv(response, false)}
                ${getRolesDiv(response.role)}
            `;
            $('[data-toggle="tooltip"]').tooltip();
            $(editRow).modal();
        });
}

function password(userId, name) {
    titleRow.innerText = 'Изменить пароль: ' + name;
    saveButtonRow.onclick = updatePass;
    formRow.innerHTML = `
                ${getIdDiv(userId)}
                
                ${getBasePasswordInput('Пароль', 'password', '')}
                ${getBasePasswordInput('Подтверждение пароля', 'confirmPassword', '')}
            `;
    $(editRow).modal();
}


function remove(userId, name) {
    if (!confirm(`Вы уверены что вы хотите удалить ${name}?`)) {
        return;
    }

    $.ajax({
        url: baseLink + 'users/' + userId,
        type: 'DELETE'
    }).done(() => {
        successNoty("Вы успешно удалили пользователя!");
        render();
    });
}

function create() {
    $.ajax({
        type: 'POST',
        url: createUrl,
        data: $(formRow).serialize()
    }).done(() => {
        $(editRow).modal('hide');
        successNoty("Вы успешно создали пользователя!");
        render();
    });
}

function save() {
    $.ajax({
        type: 'POST',
        url: updateUrl,
        data: $(formRow).serialize()
    }).done(() => {
        $(editRow).modal('hide');
        successNoty("Вы успешно обновили пользователя!");
        render();
    });
}

function updatePass() {
    $.ajax({
        type: 'POST',
        url: baseLink + 'users/' + 'password',
        data: $(formRow).serialize()
    }).done(() => {
        $(editRow).modal('hide');
        successNoty("Вы успешно обновили пароль пользователя!");
        render();
    });
}