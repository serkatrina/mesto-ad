// Обработка нажатия Escape
function onEscapePress(event) {
  if (event.key === 'Escape') {
    const activePopup = document.querySelector('.popup_visible');
    if (activePopup) {
      hidePopup(activePopup);
    }
  }
}

// Показать модальное окно
export function showPopup(popupElement) {
  popupElement.classList.add('popup_visible');
  document.addEventListener('keydown', onEscapePress);
}

// Скрыть модальное окно
export function hidePopup(popupElement) {
  popupElement.classList.remove('popup_visible');
  document.removeEventListener('keydown', onEscapePress);
}

// Настройка закрытия попапа
export function setupPopupCloseHandlers(popupElement) {
  const closeBtn = popupElement.querySelector('.popup__close-btn');
  
  // По кнопке закрытия
  closeBtn.addEventListener('click', () => {
    hidePopup(popupElement);
  });

  // По клику на затемненный фон
  popupElement.addEventListener('mousedown', (event) => {
    if (event.target === popupElement) {
      hidePopup(popupElement);
    }
  });
}
