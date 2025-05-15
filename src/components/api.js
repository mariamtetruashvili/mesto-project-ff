// api.js

// Идентификатор когорты и токен авторизации для запросов к API
const cohortId = "wff-cohort-39";
const token = "a937dc3d-a867-499c-a146-3d115cd1c807";

// Общая конфигурация для запросов: базовый URL и заголовки
const config = {
  baseUrl: `https://nomoreparties.co/v1/${cohortId}`,
  headers: {
    authorization: token,
    "Content-Type": "application/json",
  },
};

// Получение информации о текущем пользователе
export function getUserInfo() {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  }).then(checkResponse);
}

// Обновление информации о пользователе (имя и информация "о себе")
export function updateUserInfo(name, about) {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ name, about }),
  }).then(checkResponse);
}

// Получение массива карточек с сервера
export function getCards() {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  }).then(checkResponse);
}

// Добавление новой карточки на сервер (с указанием названия и ссылки на изображение)
export function addCardToServer(name, link) {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ name, link }),
  }).then(checkResponse);
}

// Обновление аватара пользователя
export function updateAvatar(avatarUrl) {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ avatar: avatarUrl }),
  }).then(checkResponse);
}

// Функция для проверки ответа от сервера
// Если ответ успешный (status 200-299), возвращаем распарсенный JSON
// Иначе отклоняем промис с сообщением об ошибке и статусом
function checkResponse(res) {
  if (res.ok) return res.json();
  return Promise.reject(`Ошибка: ${res.status}`);
}
