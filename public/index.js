const userName = document.getElementById('userName');
const userBalance = document.getElementById('userBalance');
const chooseUserRow = document.getElementById('chooseUserRow');
const creditCardInput = document.getElementById('creditCardInput');
const itemsToBuy = document.getElementById('itemsToBuy');
const itemsToBuyList = document.getElementById('itemsToBuyList');
const totalSum = document.getElementById('totalSum');
const pincodeBox = document.querySelector('.pincode-box');
const pincodeTitile = document.getElementById('pincodeTitile');
const pincodeRow = document.getElementById('pincodeRow');
const loginRow = document.getElementById('loginRow');
const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('passwordInput');
const tax = document.getElementById('tax');
const withdrawSpan = document.getElementById('withdraw');
const nameSurnameInput = document.getElementById('nameSurnameInput');
const pincodeSound = new Audio('pincode-succes.mp3');
let pincodeCircle = document.querySelector('.circle-loader');
let pincodeCheckmark = document.querySelector('.checkmark');
let pincodeCallback = function () {};
const showUserData = user => user.name + ' ' + user.surname;
const cancel = () => {
    $(chooseUserRow).modal();
    lastRfid = null;
    setTimeout(() => creditCardInput.focus(), 500);
}
let rowHideAble = false, loginRowHideAble = false;
let selectedUser, lastRfid, creditCards, barItemsStorage;

$(() => {
    document.getElementById('pincodeButtons').addEventListener('click', e => {
        e.preventDefault();
        if (e.target.nodeName !== 'INPUT') {
            return;
        }

        let value = e.target.value;
        addNumber(value);
    });

    creditCardInput.addEventListener('input', e => {
        let creditCard = creditCardInput.value;
        if (creditCard.length !== 12) {
            return;
        }

        $.ajax(baseLink + 'bar/' + creditCard)
            .done(response => loadUser(response));
    });

    itemsToBuy.addEventListener('click', e => {
        let target = e.target.closest('.card');
        if (target === null) {
            return;
        }

        let discount = target.dataset.discount;
        let price = target.dataset.price;
        if (discount !== undefined) {
            let percent = price * discount / 100;
            price -= percent;
            price = price <= 10 ? Math.round(price) : Math.round(price * 100.0) / 100.0;
        }

        let discountDiv = discount === undefined ? '' : `<span class="badge badge-success badge-pill">-${discount}%</span>`;

        itemsToBuyList.insertAdjacentHTML('beforeend', `
            <li class="list-group-item d-flex justify-content-between align-items-center" data-id="${target.dataset.id}" data-price="${price}">
                ${target.dataset.name}
                <span class="badge badge-primary badge-pill">${price}</span>
                ${discountDiv}
            </li>
        `);
        updatePrice();
    });

    itemsToBuyList.addEventListener('click', e => {
        let target = e.target.closest('li');
        itemsToBuyList.removeChild(target);
        updatePrice();
    });

    pincodeBox.addEventListener('keydown', e => {
        let input = e.key;
        if (!'1234567890'.includes(input) && input !== 'Backspace') {
            e.preventDefault();
            return;
        }

        let value = e.target.value + input;
        if (value.length === 4) {
            buy(value);
        }
    });

    $(chooseUserRow).on('hide.bs.modal', e => rowHideAble);

    $(loginRow).on('hide.bs.modal', e => loginRowHideAble);
    
    let socket = io();
    socket.on('card', card => {
        card = card.substr(20);
        if (lastRfid === card) {
            return;
        }

        lastRfid = card;
        $.get(baseLink + 'bar/rfid/' + card)
            .done(response => {
                loadUser(response);
            });
    });

    $(nameSurnameInput).typeahead({
        source: (input, callback) => {
            if (input.match(/^[0-9]+$/)) {
                callback([]);
                return;
            }

            $.ajax(baseLink + 'users/find?user=' + input)
                .done(response => callback(response));
        },
        displayText: user => {
            return {
                name: showUserData(user),
                card: user.creditCard
            }
        },
        matcher: user => user.creditCard !== undefined,
        highlighter: user => {
            let query = nameSurnameInput.value;
            let name = user.name.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>'
            });
            return `
                <li class="pl-2 pr-2">
                    <a role="option">${name}</a>
                    <span class="text-muted">${user.card}</span>
                </li>
            `;
        },
        afterSelect: user => {
            nameSurnameInput.value = showUserData(user);
            loadUser(user);
        },
        sorter: users => users,
        minLength: 2
    });

    function loadUser(user) {
        selectedUser = user;
        userName.textContent = user.name + ' ' + user.surname;
        userBalance.textContent = user.balance + ' грандиков';
        let userTax = getCreditCardTax(user.cardType);
        tax.textContent = `Налог: ${userTax}%`;
        tax.dataset.tax = userTax;
        itemsToBuyList.innerHTML = '';
        totalSum.textContent = 'Всего: 0';
        rowHideAble = true;
        $(chooseUserRow).modal('hide');
        rowHideAble = false;
        creditCardInput.value = '';
        nameSurnameInput.value = '';
        showDiscount(user.cardType);
    }
});

function getCreditCardTax(cardType) {
    for (let card in creditCards) {
        if (creditCards[card].codeName === cardType) {
            return creditCards[card].tax.purchase;
        }
    }
    return 0;
}

function loadInfo() {
    $.get(baseLink + 'api/creditcard')
        .done(response => {
            creditCards = response;

            $.get(baseLink + 'bar/items?shown=true')
                .done(response => {
                    barItemsStorage = response;
                    response.forEach(item => {
                        let img = '';
                        if (item.image !== undefined && item.image !== '') {
                            img = `<img src="${barImgUrl + item.image}" class="card-img-top" alt="${item.name}">`;
                        }
                        itemsToBuy.insertAdjacentHTML('beforeend', `
                            <div class="col-sm-2">
                                <div class="card" style="width: 9rem;" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                                    ${img}
                                    <div class="card-body">
                                        <h5 class="card-title text-center">
                                            ${item.name}
                                            <span class="badge badge-primary badge-pill">${item.price}</span>
                                            <span class="badge badge-secondary badge-pill">${item.count}</span>
                                        </h5>
                                        <div class="discount_div_${item.id} text-center">
                                            <hr>
                                            <small class="text-muted"></small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `);
                    })
                });
        });
}

function showPincode() {
    pincodeCallback = buy;
    $(pincodeRow).modal();
    setTimeout(() => pincodeBox.focus(), 500);
}

function buy(pinCode) {
    let data = getBuyData();

    pincodeBox.hidden = true;
    pincodeCircle.hidden = false;

    $.ajax({
        url: baseLink + `bar/?userId=${selectedUser.id}&pinCode=${pinCode}`,
        method: 'POST',
        data: JSON.stringify(data.items),
        contentType: "application/json; charset=utf-8",
        error: data => {
            togglePinError();
            setTimeout(() => {
                pincodeBox.value = '';
                pincodeBox.hidden = false;
                pincodeCircle.hidden = true;
                setDefaultPinLoader();
                pincodeBox.focus();
            }, 1000);
        }
    }).done(response => {
        togglePinComplete();
        pincodeSound.play();
        successNoty("Товарвы были успешны куплены!");
        setTimeout(() => {
            $(pincodeRow).modal('hide');
            pincodeBox.value = '';
            $(chooseUserRow).modal();
            setTimeout(() => creditCardInput.focus(), 500);
            pincodeBox.hidden = false;
            pincodeCircle.hidden = true;
            setDefaultPinLoader();
        }, 1000);
        lastRfid = null;
        selectedUser = null;
    });
}

function updatePrice() {
    let buyData = getBuyData();
    let totalPrice = buyData.totalPrice;
    let userTax = +tax.dataset.tax;

    totalSum.textContent = 'Всего: ' + totalPrice;
    withdrawSpan.textContent = `К снятию: ${totalPrice + (totalPrice * userTax / 100)}`;
    userBalance.style.color = selectedUser.balance - totalPrice < 0 ? 'red' : 'black';
}

function getBuyData() {
    let totalPrice = 0;
    let items = [];
    itemsToBuyList.childNodes.forEach(el => {
        if (el.nodeName !== 'LI') {
            return;
        }

        totalPrice += +el.dataset.price;
        items.push(+el.dataset.id);
    });
    return { totalPrice, items };
}

function checkForPincodeDone() {
    if (pincodeBox.value.length === 4) {
        pincodeCallback(pincodeBox.value);
    }
}

function addNumber(num) {
    pincodeBox.value = pincodeBox.value + num;
    checkForPincodeDone();
}

function backspace() {
    let value = pincodeBox.value;
    pincodeBox.value = value.substring(0, value.length - 1);
}

function closePincode() {
    $(pincodeRow).modal('hide');
}

function setPincodeTitle(title) {
    pincodeTitile.textContent = title;
}

function togglePinComplete() {
    $(pincodeCircle).removeClass('load-error').toggleClass('load-complete');
    $(pincodeCheckmark).removeClass('error').addClass('draw').toggle();
}

function togglePinError() {
    $(pincodeCircle).removeClass('load-complete').toggleClass('load-error');
    $(pincodeCheckmark).removeClass('draw').addClass('error').toggle();
}

function setDefaultPinLoader() {
    $(pincodeCircle).removeClass('load-error').removeClass('load-complete');
    $(pincodeCheckmark).removeClass('error').addClass('draw').toggle();
}

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
            failNotyText('Вы ввели неверный логин и пароль или не подтвердили капчу');
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
    $(chooseUserRow).modal({ keyboard: false });
    setTimeout(() => creditCardInput.focus(), 500);
}

function showDiscount(cardType) {
    for (let itemIndex in barItemsStorage) {
        let item = barItemsStorage[itemIndex];
        let sale = getSaleByCardType(item.sales, cardType);

        let div = document.querySelector(`.discount_div_${item.id}`);
        div.hidden = sale === null;
        div.querySelector('small').textContent = sale === null ? '' : `Скидка ${sale.percent}%`;

        if (sale !== null) {
            div.closest('.card').dataset.discount = sale.percent;
        }
    }
}

function getSaleByCardType(sales, cardType) {
    for (let item in sales) {
        if (sales[item].cardType === cardType) {
            return sales[item];
        }
    }
    return null;
}
