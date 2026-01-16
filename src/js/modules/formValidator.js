// Показать сообщение об ошибке
function displayError(form, input, errorText, config) {
  const errorSpan = form.querySelector(`#${input.id}-error`);
  input.classList.add(config.inputErrorClass);
  errorSpan.textContent = errorText;
  errorSpan.classList.add(config.errorActiveClass);
}

// Скрыть сообщение об ошибке
function hideError(form, input, config) {
  const errorSpan = form.querySelector(`#${input.id}-error`);
  input.classList.remove(config.inputErrorClass);
  errorSpan.textContent = '';
  errorSpan.classList.remove(config.errorActiveClass);
}

// Валидация одного поля
function validateField(form, input, config) {
  // Проверка паттерна
  if (input.validity.patternMismatch) {
    input.setCustomValidity(input.dataset.errorText || '');
  } else {
    input.setCustomValidity('');
  }

  if (!input.validity.valid) {
    displayError(form, input, input.validationMessage, config);
  } else {
    hideError(form, input, config);
  }
}

// Проверка есть ли невалидные поля
function hasInvalidFields(fieldsList) {
  return fieldsList.some(field => !field.validity.valid);
}

// Деактивация кнопки
function deactivateButton(btn, config) {
  btn.classList.add(config.disabledBtnClass);
  btn.disabled = true;
}

// Активация кнопки
function activateButton(btn, config) {
  btn.classList.remove(config.disabledBtnClass);
  btn.disabled = false;
}

// Обновление состояния кнопки
function updateButtonState(fieldsList, btn, config) {
  if (hasInvalidFields(fieldsList)) {
    deactivateButton(btn, config);
  } else {
    activateButton(btn, config);
  }
}

// Добавление слушателей на поля формы
function addFieldListeners(form, config) {
  const fieldsList = Array.from(form.querySelectorAll(config.inputSelector));
  const submitBtn = form.querySelector(config.submitBtnSelector);

  updateButtonState(fieldsList, submitBtn, config);

  fieldsList.forEach(field => {
    field.addEventListener('input', () => {
      validateField(form, field, config);
      updateButtonState(fieldsList, submitBtn, config);
    });
  });
}

// Сброс валидации формы
export function resetValidation(form, config) {
  const fieldsList = Array.from(form.querySelectorAll(config.inputSelector));
  const submitBtn = form.querySelector(config.submitBtnSelector);

  fieldsList.forEach(field => {
    hideError(form, field, config);
    field.setCustomValidity('');
  });

  deactivateButton(submitBtn, config);
}

// Запуск валидации для всех форм
export function initValidation(config) {
  const formsList = Array.from(document.querySelectorAll(config.formSelector));
  
  formsList.forEach(form => {
    addFieldListeners(form, config);
  });
}
