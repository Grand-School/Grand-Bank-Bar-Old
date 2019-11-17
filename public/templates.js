const getIdDiv = id => `<input type="hidden" name="id" value="${id}">`;

function getBaseDataDiv({ name, surname, username, balance, creditCard, password, salary, RFID }, usePassword = false) {
    let pass = usePassword ? getBasePasswordInput('Пароль', 'password', password) : '';
    return `
        ${getBaseTextInput('Имя', 'name', name)}
        ${getBaseTextInput('Фамилия', 'surname', surname)}
        ${getBaseTextInput('Логин', 'username', username)}
        ${pass}
        ${getBaseNumInput('Баланс', 'balance', balance)}
        ${chooseClass(arguments[0].class)}
        ${getBaseTextInput('Кредитная карточка', 'creditCard', creditCard)}
        ${getBasePasswordInput('Пин-код', 'pinCode', '')}
        ${getBaseNumInput('Зарплата', 'salary', salary)}
        ${getBaseTextInput('RFID', 'RFID', RFID )}
    `;
}

const getBaseTextInput = (placeholder, name, value, hint) => getBaseInput(placeholder, name, value, 'text', hint);
const getBasePasswordInput = (placeholder, name, value, hint) => getBaseInput(placeholder, name, value, 'password', hint);
const getBaseNumInput = (placeholder, name, value) => getBaseInput(placeholder, name, value, 'number');

const getBaseInput = (placeholder, name, value, type, hint = '') => `
    <div class="form-group">
        <label for="${name}" class="col-form-label">${placeholder}</label>
        ${hint}
        <input type="${type}" class="form-control" id="${name}" name="${name}" placeholder="${placeholder}" value="${getNormalText(value)}">
    </div>
`;

const getBaseBoolean = (placeholder, name, selected, hint = '') => `
    <div class="form-group">
        <label for="${name}" class="col-form-label">${placeholder}</label>
        ${hint}
        <select class="form-control" id="${name}" name="${name}" placeholder="${placeholder}">
           <option ${selected ? 'selected' : ''}>TRUE</option>
           <option ${!selected ? 'selected' : ''}>FALSE</option>
        </select>
    </div>
`;

let getRolesDiv = role => {
    if (userRole !== 'ROLE_ADMIN') {
        return '';
    }

    return `
        <div class="form-group">
            <label for="role" class="col-form-label">Роль</label>
            <select name="role" id="role">
                <option ${role === 'ROLE_ADMIN' ? 'selected' : ''}>ROLE_ADMIN</option>
                <option ${role === 'ROLE_RESPONSIBLE' ? 'selected' : ''}>ROLE_RESPONSIBLE</option>
                <option ${role === 'ROLE_TEACHER' ? 'selected' : ''}>ROLE_TEACHER</option>
                <option ${role === 'ROLE_BARMEN' ? 'selected' : ''}>ROLE_BARMEN</option>
                <option ${role === 'ROLE_USER' ? 'selected' : ''}>ROLE_USER</option>
            </select>
        </div>
    `;
};

const chooseClass = (selected = '5') => {
    let options = '';
    classes.forEach(clazz => options += `<option value="${clazz}" ${selected === clazz ? 'selected' : ''}>${clazz}</option>`);

    return `
        <label for="class" class="col-form-label">Класс</label>
        <select name="class" id="class">
            ${options}
        </select>
    `;
}

const getHint = message => `
    <span class="fa fa-question" data-toggle="tooltip" data-placement="top" title="${message}"></span>
`;

const pinCodeHint = getHint('Оставьте это поле пустым, что бы не изменять его значение');
const couponsUserHint = getHint('Если купон использован его больше никто не может использовать');
const couponMessageHint = getHint('Рекомендуем написать причину, по которой человек получил купон. Пример: За выигрышь в конкурсе.');
const rfidMessageHint = getHint('Уникальный ключ карты, указываеться производителем.');