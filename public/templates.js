const getIdDiv = id => `<input type="hidden" name="id" value="${id}">`;

function getBaseDataDiv({ name, surname, username, balance, creditCard, cardType, password, salary, RFID, theme, frozen }, usePassword = false) {
    let pass = usePassword ? getBasePasswordInput('Пароль', 'password', password) : '';
    return `
        ${getBaseTextInput('Имя', 'name', name)}
        ${getBaseTextInput('Фамилия', 'surname', surname)}
        ${getBaseTextInput('Логин', 'username', username)}
        ${pass}
        ${getBaseNumInput('Баланс', 'balance', balance)}
        ${chooseClass(arguments[0].class)}
        ${getBaseTextInput('Кредитная карточка', 'creditCard', creditCard)}
        ${chooseCardType(cardType)}
        ${getBasePasswordInput('Пин-код', 'pinCode', '')}
        ${getBaseNumInput('Зарплата', 'salary', salary)}
        ${getBaseTextInput('RFID', 'RFID', RFID )}
        ${getThemeSelect(theme)}
        ${getBaseBoolean('Заморожен счёт', 'frozen', frozen)}
    `;
}

const getBaseTextInput = (placeholder, name, value, hint) => getBaseInput(placeholder, name, value, 'text', hint);
const getBasePasswordInput = (placeholder, name, value, hint) => getBaseInput(placeholder, name, value, 'password', hint);
const getBaseNumInput = (placeholder, name, value) => getBaseInput(placeholder, name, value, 'number');

let getThemeSelect = theme => `
    <div class="form-group">
        <label for="theme" class="col-form-label">Тема</label>
        <select name="theme" id="theme">
            <option ${theme === 'LIGHT' ? 'selected' : ''} value="LIGHT">СВЕТЛАЯ</option>
            <option ${theme === 'DARK' ? 'selected' : ''} value="DARK">ТЁМНАЯ</option>
        </select>
    </div>
`;

const getBaseInput = (placeholder, name, value, type, hint = '') => `
    <div class="form-group">
        <label for="${name}" class="col-form-label">${placeholder}</label>
        ${hint}
        <input type="${type}" class="form-control" id="${name}" name="${name}" placeholder="${placeholder}" value="${getNormalText(value)}">
        <div class="invalid-feedback" hidden></div>
    </div>
`;

const getBaseBoolean = (placeholder, name, selected, hint = '') => `
    <div class="form-group">
        <label for="${name}" class="col-form-label">${placeholder}</label>
        ${hint}
        <select class="form-control" id="${name}" name="${name}" placeholder="${placeholder}">
           <option value="true" ${selected ? 'selected' : ''}>TRUE</option>
           <option value="false" ${!selected ? 'selected' : ''}>FALSE</option>
        </select>
    </div>
`;

const chooseCardType = selected => {
    let result = `
        <div class="form-group">
            <label for="cardType" class="col-form-label">Тип кредитной карточки</label>
            <select name="cardType" id="cardType" class="form-control">
    `;

    for (let card in creditCards) {
        let name = creditCards[card].name;
        let codeName = creditCards[card].codeName;
        result += `<option value="${codeName}" ${selected === codeName ? 'selected' : ''}>${name}</option>`
    }

    result += `
            </select>
        </div>
    `;
    return result;
}

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
const frozenBalanceMessageHint = getHint('Заморожен ли баланс? Если да - пользователь, к примеру, не может осуществлять покупки или переводить баланс.');