const getIdDiv = id => getBaseHiddenInput('id', id);

function getBaseDataDiv({ name, surname, username, balance, creditCard, cardType, password, salary, RFID, theme, frozen, telegramChat }, usePassword = false) {
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
        ${telegramChat !== undefined && telegramChat !== null ? getBaseHiddenInput('telegramChat', telegramChat) : ''}
    `;
}

const getBaseTextInput = (placeholder, name, value, hint) => getBaseInput(placeholder, name, value, 'text', hint);
const getBasePasswordInput = (placeholder, name, value, hint) => getBaseInput(placeholder, name, value, 'password', hint);
const getBaseNumInput = (placeholder, name, value) => getBaseInput(placeholder, name, value, 'number');
const getBaseHiddenInput = (name, value) => `<input type="hidden" name="${name}" value="${value}">`;

const getThemeSelect = theme => {
    let items = [{name: 'СВЕТЛАЯ', value: 'LIGHT'}, {name: 'ТЁМНАЯ', value: 'DARK'}];
    return getBaseSelect('Тема', 'theme', theme, items);
};

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
        <input type="checkbox" id="${name}" name="${name}" ${selected ? 'checked' : ''}> 
        <label for="${name}">${placeholder}</label> 
        ${hint}
        <div class="invalid-feedback" hidden></div>
    </div>
`;

const getBaseSelect = (placeholder, name, selected, items, hint = '', showLabel = true) => `
    <div class="form-group">
        ${showLabel ? `<label for="${name}" class="col-form-label">${placeholder}</label>` : ''}
        ${hint}
        <select name="${name}" id="${name}" class="form-control">
            ${items.reduce((acc, item) => {
                return acc += `
                    <option value="${item.value}" ${selected === item.value ? 'selected' : ''}>${item.name}</option>
                `;   
            }, '')}
        </select>
    </div>
`;

const chooseCardType = (selected, showLabel = true) => {
    let list = creditCards.reduce((acc, item) => {
        acc.push({
            name: item.name,
            value: item.codeName
        });

        return acc;
    }, []);
    return getBaseSelect('Тип кредитной карточки', 'cardType', selected, list, '', showLabel);
};

const getRolesDiv = role => {
    if (userRole !== 'ROLE_ADMIN') {
        return '';
    }

    let list = createCorrectSelectList(['ROLE_ADMIN', 'ROLE_RESPONSIBLE', 'ROLE_TEACHER', 'ROLE_BARMEN', 'ROLE_USER']);
    return getBaseSelect('Роль', 'role', role, list);
};

const chooseClass = (selected = '5', includeTeacher = false) => {
    let list = includeTeacher ? classesNoExcluded : classes;
    let readyList = createCorrectSelectList(list);
    return getBaseSelect('Клас', 'class', selected, readyList);
};

const createCorrectSelectList = list => {
    return list.reduce((acc, item) => {
        acc.push({
            name: item,
            value: item
        });

        return acc;
    }, []);
};

const getHint = message => `
    <span class="fa fa-question" data-toggle="tooltip" data-placement="top" title="${message}"></span>
`;

const pinCodeHint = getHint('Оставьте это поле пустым, что бы не изменять его значение');
const couponsUserHint = getHint('Если купон использован его больше никто не может использовать');
const couponMessageHint = getHint('Рекомендуем написать причину, по которой человек получил купон. Пример: За выигрышь в конкурсе.');
const rfidMessageHint = getHint('Уникальный ключ карты, указываеться производителем.');
const frozenBalanceMessageHint = getHint('Заморожен ли баланс? Если да - пользователь, к примеру, не может осуществлять покупки или переводить баланс.');