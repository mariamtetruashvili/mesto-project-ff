// Проверяет, является ли строка корректным URL
const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch (_) {
    return false;
  }
};

// Возвращает сообщение об ошибке, заданное в data-атрибуте или стандартное сообщение
function getErrorMessage(inputElement) {
  return inputElement.dataset.errorMessage || 'Вы пропустили это поле.';
}

// Показывает ошибку валидации для конкретного поля ввода
function showInputError(formElement, inputElement, errorMessage, config) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (!errorElement) return;

  inputElement.classList.add(config.inputErrorClass); 
  errorElement.textContent = errorMessage; 
  errorElement.classList.add(config.errorClass); 
}

// Скрывает ошибку валидации для конкретного поля ввода
function hideInputError(formElement, inputElement, config) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (!errorElement) return;

  inputElement.classList.remove(config.inputErrorClass); 
  errorElement.textContent = ''; 
  errorElement.classList.remove(config.errorClass); 
}

// Проверяет валидность конкретного поля ввода
function checkInputValidity(formElement, inputElement, config) {
  const value = inputElement.value.trim();
  const isUrlField = inputElement.type === 'url';

  // Если поле пустое и не в фокусе, скрываем ошибку и возвращаем false
  if (!value && !inputElement.matches(':focus')) {
    hideInputError(formElement, inputElement, config);
    return false;
  }

  // Если поле пустое, показываем ошибку и возвращаем false
  if (!value) {
    showInputError(formElement, inputElement, getErrorMessage(inputElement), config);
    return false;
  }

  // Проверка для текстовых полей на минимальную и максимальную длину
  if (!isUrlField) {
    const minLength = parseInt(inputElement.dataset.minLength, 10) || 2;
    const maxLength = parseInt(inputElement.dataset.maxLength, 10) || 30;

    if (value.length < minLength || value.length > maxLength) {
      showInputError(
        formElement,
        inputElement,
        `Должно быть от ${minLength} до ${maxLength} символов`,
        config
      );
      return false;
    }
  }

  // Проверка содержимого для определённых полей — разрешены только буквы (латиница и кириллица), дефисы и пробелы
  if (['name', 'description', 'place-name'].includes(inputElement.name)) {
    const regex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!regex.test(value)) {
      showInputError(
        formElement,
        inputElement,
        'Разрешены только латинские, кириллические буквы, дефисы и пробелы',
        config
      );
      return false;
    }
  }

  // Проверка URL-поля на валидность URL
  if (isUrlField && !isValidUrl(value)) {
    showInputError(formElement, inputElement, 'Введите корректный адрес ссылки.', config);
    return false;
  }

  // Если все проверки пройдены — скрываем ошибку и возвращаем true
  hideInputError(formElement, inputElement, config);
  return true;
}

// Переключает состояние кнопки отправки формы в зависимости от валидности всех полей
function toggleButtonState(formElement, config) {
  const inputs = Array.from(formElement.querySelectorAll(config.inputSelector));
  const submitButton = formElement.querySelector(config.submitButtonSelector);

  if (!submitButton) return;

  // Проверяем валидность всех полей и что они не пустые
  const isValid = inputs.every((input) => {
    return input.value.trim() !== '' && checkInputValidity(formElement, input, config);
  });

  submitButton.disabled = !isValid;
  submitButton.classList.toggle(config.inactiveButtonClass, !isValid); 
}

// Устанавливает обработчики событий на все поля формы
function setEventListeners(formElement, config) {
  const inputs = formElement.querySelectorAll(config.inputSelector);

  inputs.forEach((inputElement) => {
    // При вводе текста проверяем валидность и переключаем кнопку
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(formElement, config);
    });

    // При уходе из поля повторно проверяем валидность
    inputElement.addEventListener('blur', () => {
      checkInputValidity(formElement, inputElement, config);
    });
  });

  // Изначально устанавливаем состояние кнопки
  toggleButtonState(formElement, config);
}

// Включает валидацию на всех формах, подходящих под селектор
export function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);

  forms.forEach((formElement) => {
    formElement.addEventListener('submit', (e) => e.preventDefault()); 
    setEventListeners(formElement, config); 
  });
}

// Очищает ошибки валидации и по необходимости сбрасывает значения полей формы
export function clearValidation(formElement, config, resetValues = false) {
  const inputs = formElement.querySelectorAll(config.inputSelector);
  const submitButton = formElement.querySelector(config.submitButtonSelector);

  inputs.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
    if (resetValues) {
      inputElement.value = ''; 
    }
  });

  if (submitButton) {
    submitButton.disabled = true; 
    submitButton.classList.add(config.inactiveButtonClass); 
  }
}

// Функция для подготовки формы редактирования профиля:
// очищаем ошибки, заполняем поля текущими данными и обновляем состояние кнопки
export function prepareProfileForm(formElement, config, profileData) {
  clearValidation(formElement, config, false); 

  // Заполняем поля формы актуальными данными профиля
  formElement.elements.name.value = profileData.name || '';
  formElement.elements.description.value = profileData.description || '';

  // Проверяем валидность формы и переключаем кнопку
  toggleButtonState(formElement, config);
}
