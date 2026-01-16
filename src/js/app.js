// Подключение стилей
import '../css/main.css';

// Импорт модулей
import { generateCard, removeCardFromDOM } from './modules/photoCard.js';
import { showPopup, hidePopup, setupPopupCloseHandlers } from './modules/popupManager.js';
import { initValidation, resetValidation } from './modules/formValidator.js';
import {
  loadUserProfile,
  loadAllCards,
  saveUserProfile,
  createNewCard,
  removeCard,
  addLike,
  removeLike,
  changeAvatar
} from './modules/serverApi.js';

// Конфигурация валидации
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__field',
  submitBtnSelector: '.popup__save-btn',
  disabledBtnClass: 'popup__save-btn_inactive',
  inputErrorClass: 'popup__field_invalid',
  errorActiveClass: 'popup__error_active'
};

// === DOM элементы ===

// Контейнер карточек
const galleryContainer = document.querySelector('.gallery');

// Элементы профиля
const userNameElement = document.querySelector('.profile__title');
const userJobElement = document.querySelector('.profile__subtitle');
const userPhotoElement = document.querySelector('.profile__photo');

// Кнопки
const editProfileBtn = document.querySelector('.profile__edit-btn');
const addPhotoBtn = document.querySelector('.profile__add-btn');
const editAvatarBtn = document.querySelector('.profile__photo-edit');

// Попапы
const editProfilePopup = document.querySelector('#edit-profile-popup');
const addPhotoPopup = document.querySelector('#add-photo-popup');
const viewPhotoPopup = document.querySelector('#view-photo-popup');
const confirmDeletePopup = document.querySelector('#confirm-delete-popup');
const editAvatarPopup = document.querySelector('#edit-avatar-popup');
const cardInfoPopup = document.querySelector('#card-info-popup');

// Формы
const editProfileForm = editProfilePopup.querySelector('.popup__form');
const addPhotoForm = addPhotoPopup.querySelector('.popup__form');
const confirmDeleteForm = confirmDeletePopup.querySelector('.popup__form');
const editAvatarForm = editAvatarPopup.querySelector('.popup__form');

// Поля профиля
const nameField = editProfileForm.querySelector('.popup__field_content_name');
const jobField = editProfileForm.querySelector('.popup__field_content_job');

// Элементы просмотра фото
const viewPhotoImage = viewPhotoPopup.querySelector('.popup__photo');
const viewPhotoCaption = viewPhotoPopup.querySelector('.popup__caption');

// Элементы попапа информации о карточке
const cardInfoList = cardInfoPopup.querySelector('.popup__info-list');
const cardUsersListElement = cardInfoPopup.querySelector('.popup__users-list');

// Шаблоны
const infoRowTemplate = document.querySelector('#info-row-template');
const userPreviewTemplate = document.querySelector('#user-preview-template');

// ID пользователя
let currentUserId;

// Данные для удаления
let pendingDeleteCard = null;
let pendingDeleteCardId = null;

// === Вспомогательные функции ===

// Форматирование даты
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Создание строки информации
function createInfoRow(label, value) {
  const row = infoRowTemplate.content.querySelector('.popup__info-row').cloneNode(true);
  row.querySelector('.popup__info-term').textContent = label;
  row.querySelector('.popup__info-definition').textContent = value;
  return row;
}

// Создание элемента пользователя
function createUserPreview(userData) {
  const userItem = userPreviewTemplate.content.querySelector('.popup__user-item').cloneNode(true);
  userItem.querySelector('.popup__user-avatar').src = userData.avatar;
  userItem.querySelector('.popup__user-avatar').alt = userData.name;
  userItem.querySelector('.popup__user-name').textContent = userData.name;
  return userItem;
}

// === Обработчики ===

// Открытие просмотра фото
function openPhotoViewer(title, imageUrl) {
  viewPhotoImage.src = imageUrl;
  viewPhotoImage.alt = title;
  viewPhotoCaption.textContent = title;
  showPopup(viewPhotoPopup);
}

// Открытие подтверждения удаления
function openDeleteConfirm(cardNode, cardId) {
  pendingDeleteCard = cardNode;
  pendingDeleteCardId = cardId;
  showPopup(confirmDeletePopup);
}

// Обработка лайка
function handleLikeAction(event, cardId, counterElement) {
  const likeBtn = event.target;
  const isActive = likeBtn.classList.contains('gallery__like-btn_active');

  const likeRequest = isActive ? removeLike(cardId) : addLike(cardId);

  likeRequest
    .then(updatedData => {
      likeBtn.classList.toggle('gallery__like-btn_active');
      counterElement.textContent = updatedData.likes.length > 0 ? updatedData.likes.length : '';
    })
    .catch(err => console.error(`Ошибка лайка: ${err}`));
}

// Открытие информации о карточке
function openCardInfo(cardId) {
  // Получаем актуальные данные с сервера
  loadAllCards()
    .then(cards => {
      // Находим нужную карточку
      const cardData = cards.find(card => card._id === cardId);
      
      if (!cardData) {
        console.error('Карточка не найдена');
        return;
      }

      // Очищаем предыдущие данные
      cardInfoList.innerHTML = '';
      cardUsersListElement.innerHTML = '';

      // Заполняем информацию о карточке
      cardInfoList.append(createInfoRow('Название:', cardData.name));
      cardInfoList.append(createInfoRow('Автор:', cardData.owner.name));
      cardInfoList.append(createInfoRow('Дата создания:', formatDate(cardData.createdAt)));
      cardInfoList.append(createInfoRow('Количество лайков:', cardData.likes.length));

      // Заполняем список пользователей, лайкнувших карточку
      if (cardData.likes.length > 0) {
        cardData.likes.forEach(user => {
          cardUsersListElement.append(createUserPreview(user));
        });
      } else {
        const noLikesText = document.createElement('p');
        noLikesText.className = 'popup__no-likes';
        noLikesText.textContent = 'Пока никто не оценил эту карточку';
        cardUsersListElement.append(noLikesText);
      }

      showPopup(cardInfoPopup);
    })
    .catch(err => console.error(`Ошибка загрузки информации: ${err}`));
}

// Смена текста кнопки при загрузке
function setButtonLoading(btn, isLoading, defaultText = 'Сохранить') {
  btn.textContent = isLoading ? 'Сохранение...' : defaultText;
}

// Отправка формы профиля
function submitProfileForm(event) {
  event.preventDefault();
  const saveBtn = editProfileForm.querySelector('.popup__save-btn');

  setButtonLoading(saveBtn, true);

  saveUserProfile(nameField.value, jobField.value)
    .then(userData => {
      userNameElement.textContent = userData.name;
      userJobElement.textContent = userData.about;
      hidePopup(editProfilePopup);
    })
    .catch(err => console.error(`Ошибка сохранения профиля: ${err}`))
    .finally(() => setButtonLoading(saveBtn, false));
}

// Отправка формы добавления фото
function submitPhotoForm(event) {
  event.preventDefault();
  const saveBtn = addPhotoForm.querySelector('.popup__save-btn');
  const titleField = addPhotoForm.querySelector('.popup__field_content_title');
  const linkField = addPhotoForm.querySelector('.popup__field_content_link');

  setButtonLoading(saveBtn, true, 'Создать');

  createNewCard(titleField.value, linkField.value)
    .then(cardData => {
      const newCard = generateCard(cardData, currentUserId, openPhotoViewer, openDeleteConfirm, handleLikeAction, openCardInfo);
      galleryContainer.prepend(newCard);
      addPhotoForm.reset();
      resetValidation(addPhotoForm, validationConfig);
      hidePopup(addPhotoPopup);
    })
    .catch(err => console.error(`Ошибка добавления фото: ${err}`))
    .finally(() => setButtonLoading(saveBtn, false, 'Создать'));
}

// Отправка формы удаления
function submitDeleteForm(event) {
  event.preventDefault();
  const confirmBtn = confirmDeleteForm.querySelector('.popup__save-btn');

  confirmBtn.textContent = 'Удаление...';

  removeCard(pendingDeleteCardId)
    .then(() => {
      removeCardFromDOM(pendingDeleteCard);
      pendingDeleteCard = null;
      pendingDeleteCardId = null;
      hidePopup(confirmDeletePopup);
    })
    .catch(err => console.error(`Ошибка удаления: ${err}`))
    .finally(() => {
      confirmBtn.textContent = 'Да';
    });
}

// Отправка формы аватара
function submitAvatarForm(event) {
  event.preventDefault();
  const saveBtn = editAvatarForm.querySelector('.popup__save-btn');
  const avatarField = editAvatarForm.querySelector('.popup__field_content_avatar');

  setButtonLoading(saveBtn, true);

  changeAvatar(avatarField.value)
    .then(userData => {
      userPhotoElement.src = userData.avatar;
      editAvatarForm.reset();
      resetValidation(editAvatarForm, validationConfig);
      hidePopup(editAvatarPopup);
    })
    .catch(err => console.error(`Ошибка смены аватара: ${err}`))
    .finally(() => setButtonLoading(saveBtn, false));
}

// === Инициализация ===

// Настройка закрытия попапов
setupPopupCloseHandlers(editProfilePopup);
setupPopupCloseHandlers(addPhotoPopup);
setupPopupCloseHandlers(viewPhotoPopup);
setupPopupCloseHandlers(confirmDeletePopup);
setupPopupCloseHandlers(editAvatarPopup);
setupPopupCloseHandlers(cardInfoPopup);

// Открытие редактирования профиля
editProfileBtn.addEventListener('click', () => {
  nameField.value = userNameElement.textContent;
  jobField.value = userJobElement.textContent;
  resetValidation(editProfileForm, validationConfig);
  showPopup(editProfilePopup);
});

// Открытие добавления фото
addPhotoBtn.addEventListener('click', () => {
  addPhotoForm.reset();
  resetValidation(addPhotoForm, validationConfig);
  showPopup(addPhotoPopup);
});

// Открытие смены аватара
editAvatarBtn.addEventListener('click', () => {
  editAvatarForm.reset();
  resetValidation(editAvatarForm, validationConfig);
  showPopup(editAvatarPopup);
});

// Обработчики форм
editProfileForm.addEventListener('submit', submitProfileForm);
addPhotoForm.addEventListener('submit', submitPhotoForm);
confirmDeleteForm.addEventListener('submit', submitDeleteForm);
editAvatarForm.addEventListener('submit', submitAvatarForm);

// Запуск валидации
initValidation(validationConfig);

// Загрузка данных с сервера
Promise.all([loadUserProfile(), loadAllCards()])
  .then(([userData, cardsData]) => {
    currentUserId = userData._id;

    userNameElement.textContent = userData.name;
    userJobElement.textContent = userData.about;
    userPhotoElement.src = userData.avatar;

    cardsData.forEach(cardInfo => {
      const card = generateCard(cardInfo, currentUserId, openPhotoViewer, openDeleteConfirm, handleLikeAction, openCardInfo);
      galleryContainer.append(card);
    });
  })
  .catch(err => console.error(`Ошибка загрузки: ${err}`));
