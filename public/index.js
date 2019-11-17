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
let pincodeCircle = document.querySelector('.circle-loader');
let pincodeCheckmark = document.querySelector('.checkmark');
let pincodeCallback = function () {};
const cancel = () => $(chooseUserRow).modal();
let rowHideAble = false, loginRowHideAble = false;
let selectedUser, lastRfid;

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
            .done(response => {
                console.log(response);
                loadUser(response);
            });
    });

    itemsToBuy.addEventListener('click', e => {
        let target = e.target.closest('.card');
        if (target === null) {
            return;
        }

        let price = target.dataset.price;

        itemsToBuyList.insertAdjacentHTML('beforeend', `
            <li class="list-group-item d-flex justify-content-between align-items-center" data-id="${target.dataset.id}" data-price="${price}">
                ${target.dataset.name}
                <span class="badge badge-primary badge-pill">${price}</span>
            </li>
        `);
        updatePrice();
    });

    itemsToBuyList.addEventListener('click', e => {
        let target = e.target.closest('li');
        itemsToBuyList.removeChild(target);
        updatePrice();
    });

    $(chooseUserRow).on('hide.bs.modal', e => rowHideAble);

    $(loginRow).on('hide.bs.modal', e => loginRowHideAble);
    $(loginRow).modal({ keyboard: false });
    
    let socket = io();
    socket.on('card', card => {
        card = card.substr(20);
        if (lastRfid === card) {
            return;
        }

        console.log(card);

        lastRfid = card;
        $.get(baseLink + 'bar/rfid/' + card)
            .done(response => {
                console.log(response);
                loadUser(response);
            });
    });

    function loadUser(user) {
        selectedUser = user;
        userName.textContent = user.name + ' ' + user.surname;
        userBalance.textContent = user.balance + ' грандиков';
        itemsToBuyList.innerHTML = '';
        totalSum.textContent = 'Всего: 0';
        rowHideAble = true;
        $(chooseUserRow).modal('hide');
        rowHideAble = false;
        creditCardInput.value = '';
    }
});

function loadInfo() {
    $.get(baseLink + 'bar/tax')
        .done(response => {
            tax.textContent = `Налог: ${response}%`;
        });
        
    $.get(baseLink + 'bar/items?shown=true')
        .done(response => {
            console.log(response);
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
                                <h5 class="card-title text-center">${item.name}</h5>
                            </div>
                        </div>
                    </div>
                `);
            })
        });
}

function showPincode() {
    pincodeCallback = buy;
    $(pincodeRow).modal();
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
            }, 1000);
        }
    }).done(response => {
        console.log(response);
        togglePinComplete();
        successNoty("Товарвы были успешны куплены!");
        setTimeout(() => {
            $(pincodeRow).modal('hide');
            pincodeBox.value = '';
            $(chooseUserRow).modal();
            pincodeBox.hidden = false;
            pincodeCircle.hidden = true;
            setDefaultPinLoader();
        }, 1000);
        lastRfid = null;
        selectedUser = null;
    });
}

function updatePrice() {
    let totalPrice = getBuyData().totalPrice;
    totalSum.textContent = 'Всего: ' + totalPrice;
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
        url: baseLink + `login?login=${loginInput.value}&password=${passwordInput.value}`,
        method: 'POST',
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
        $(chooseUserRow).modal({ keyboard: false });
    }
}