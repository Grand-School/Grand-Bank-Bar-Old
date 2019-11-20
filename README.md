# Grand-Bank-Bar

# Установка
1) На компьютере должен быть установлен node js.
2) Отредактируйте первые две стороки в файле `public/script.js` (введите домен сайта и JWT header) и пятую строку в файле `server.js` (введите порт к которому подключена Arduino).
3) Зайдите в корень программы в консоле и введите команду `npm run server`.
4) Теперь вы можете зайти на сайт по ссылке localhost:3000.
5) Для нормального использование нужно отключить в браузере CORS. Создайте ярлык и пропишите обьект `"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=C:/chromeTemp`.

# Arduino
1) Прошивка Arduino - `Arduino.info`.
2) Собрать прибор можно по [видео](https://youtu.be/-hA30_l60nw?t=436).