# vk-crypto
Node.JS библиотека для взаимодействия с игрой [Crypto](https://vk.com/app7932067) во ВКонтакте.

## Установка
```bash
$ npm i vk-crypto
```

## Использование
Для использования методов игры требуется токен пользователя ВКонтакте. Получить его можно [тут](http://vkhost.github.io/).
```javascript
const Crypto = require("vk-crypto")
const myaccount = new Crypto("ваш токен")
```
## Примеры
### Получение статистики аккаунта
```javascript 
const Crypto = require("vk-crypto")
const myaccount = new Crypto("ваш токен")

(async ()=>{
  let stats = await myaccount.stats()
  console.log(stats)
})()
```

## Методы
Методы вы можете найти в файле ```index.js```
