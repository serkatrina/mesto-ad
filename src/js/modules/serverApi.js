// Настройки подключения к серверу
const apiConfig = {
  serverUrl: 'https://mesto.nomoreparties.co/v1/wff-cohort-39',
  requestHeaders: {
    authorization: 'a25ebce9-c3e7-418c-91de-6b8a6a0e38ce',
    'Content-Type': 'application/json'
  }
};

// Обработка ответа от сервера
function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка сервера: ${response.status}`);
}

// Загрузка профиля пользователя
export function loadUserProfile() {
  return fetch(`${apiConfig.serverUrl}/users/me`, {
    headers: apiConfig.requestHeaders
  }).then(handleResponse);
}

// Загрузка всех карточек
export function loadAllCards() {
  return fetch(`${apiConfig.serverUrl}/cards`, {
    headers: apiConfig.requestHeaders
  }).then(handleResponse);
}

// Сохранение профиля пользователя
export function saveUserProfile(userName, userAbout) {
  return fetch(`${apiConfig.serverUrl}/users/me`, {
    method: 'PATCH',
    headers: apiConfig.requestHeaders,
    body: JSON.stringify({
      name: userName,
      about: userAbout
    })
  }).then(handleResponse);
}

// Создание новой карточки
export function createNewCard(cardName, cardLink) {
  return fetch(`${apiConfig.serverUrl}/cards`, {
    method: 'POST',
    headers: apiConfig.requestHeaders,
    body: JSON.stringify({
      name: cardName,
      link: cardLink
    })
  }).then(handleResponse);
}

// Удаление карточки по ID
export function removeCard(cardId) {
  return fetch(`${apiConfig.serverUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: apiConfig.requestHeaders
  }).then(handleResponse);
}

// Добавление лайка
export function addLike(cardId) {
  return fetch(`${apiConfig.serverUrl}/cards/likes/${cardId}`, {
    method: 'PUT',
    headers: apiConfig.requestHeaders
  }).then(handleResponse);
}

// Удаление лайка
export function removeLike(cardId) {
  return fetch(`${apiConfig.serverUrl}/cards/likes/${cardId}`, {
    method: 'DELETE',
    headers: apiConfig.requestHeaders
  }).then(handleResponse);
}

// Обновление фото профиля
export function changeAvatar(avatarUrl) {
  return fetch(`${apiConfig.serverUrl}/users/me/avatar`, {
    method: 'PATCH',
    headers: apiConfig.requestHeaders,
    body: JSON.stringify({
      avatar: avatarUrl
    })
  }).then(handleResponse);
}
