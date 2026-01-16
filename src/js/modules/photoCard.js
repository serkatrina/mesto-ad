// Клонирование шаблона карточки
function cloneCardTemplate() {
  const cardTemplate = document.querySelector('#photo-card-template');
  return cardTemplate.content.querySelector('.gallery__card').cloneNode(true);
}

// Удаление карточки из DOM
export function removeCardFromDOM(cardNode) {
  cardNode.remove();
}

// Генерация карточки
export function generateCard(data, myUserId, onImageClick, onDeleteClick, onLikeClick, onInfoClick) {
  const cardNode = cloneCardTemplate();

  const imageElement = cardNode.querySelector('.gallery__photo');
  const titleElement = cardNode.querySelector('.gallery__title');
  const likeBtn = cardNode.querySelector('.gallery__like-btn');
  const likesCountElement = cardNode.querySelector('.gallery__likes-count');
  const removeBtn = cardNode.querySelector('.gallery__remove-btn');
  const infoBtn = cardNode.querySelector('.gallery__info-btn');

  // Устанавливаем данные
  imageElement.src = data.link;
  imageElement.alt = data.name;
  titleElement.textContent = data.name;

  // Счетчик лайков
  if (data.likes && data.likes.length > 0) {
    likesCountElement.textContent = data.likes.length;
  }

  // Проверяем свой лайк
  const hasMyLike = data.likes && data.likes.some(user => user._id === myUserId);
  if (hasMyLike) {
    likeBtn.classList.add('gallery__like-btn_active');
  }

  // Прячем удаление для чужих карточек
  if (data.owner._id !== myUserId) {
    removeBtn.classList.add('gallery__remove-btn_hidden');
  }

  // Клик по фото
  imageElement.addEventListener('click', () => {
    onImageClick(data.name, data.link);
  });

  // Клик удаления
  removeBtn.addEventListener('click', () => {
    onDeleteClick(cardNode, data._id);
  });

  // Клик лайка
  likeBtn.addEventListener('click', (event) => {
    onLikeClick(event, data._id, likesCountElement);
  });

  // Клик по кнопке информации
  infoBtn.addEventListener('click', () => {
    onInfoClick(data._id);
  });

  return cardNode;
}
