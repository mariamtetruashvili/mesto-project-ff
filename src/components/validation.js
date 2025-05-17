// Проверяет, что URL ведёт на изображение (HEAD-запрос для проверки Content-Type)
export function validateImageUrl(url) {
  return fetch(url, { method: "HEAD" }).then((response) => {
    if (!response.ok) {
      throw new Error(`Сервер вернул статус: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.startsWith("image/")) {
      throw new Error(
        `Ссылка не ведёт на изображение (Content-Type: ${contentType})`
      );
    }

    return true;
  });
}

// Отображает сообщение об ошибке для поля ввода
function showInputError(formElement, inputElement, errorMessage, config) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (!errorElement) return;

  inputElement.classList.add(config.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(config.errorClass);
}

// Скрывает сообщение об ошибке для поля ввода
function hideInputError(formElement, inputElement, config) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (!errorElement) return;

  inputElement.classList.remove(config.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(config.errorClass);
}

// Проверяет валидность поля и показывает/скрывает ошибку
function checkInputValidity(formElement, inputElement, config) {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, config);
    return true;
  }

  if (inputElement.validity.valueMissing) {
    const message =
      inputElement.dataset.errorRequired || inputElement.validationMessage;
    showInputError(formElement, inputElement, message, config);
    return false;
  }

  if (inputElement.validity.patternMismatch) {
    const message =
      inputElement.dataset.errorPattern || inputElement.validationMessage;
    showInputError(formElement, inputElement, message, config);
    return false;
  }

  if (inputElement.validity.tooShort || inputElement.validity.tooLong) {
    const message =
      inputElement.dataset.errorLength || inputElement.validationMessage;
    showInputError(formElement, inputElement, message, config);
    return false;
  }

  if (inputElement.type === "url" && !inputElement.validity.valid) {
    const message =
      inputElement.dataset.errorUrl || inputElement.validationMessage;
    showInputError(formElement, inputElement, message, config);
    return false;
  }

  // Универсальное сообщение для прочих ошибок
  showInputError(
    formElement,
    inputElement,
    inputElement.validationMessage,
    config
  );
  return false;
}

// Включает или отключает кнопку отправки в зависимости от валидности всех полей
function toggleButtonState(formElement, config) {
  const inputs = Array.from(formElement.querySelectorAll(config.inputSelector));
  const submitButton = formElement.querySelector(config.submitButtonSelector);
  if (!submitButton) return;

  const isValid = inputs.every(
    (input) =>
      input.value.trim() !== "" &&
      checkInputValidity(formElement, input, config)
  );

  submitButton.disabled = !isValid;
  submitButton.classList.toggle(config.inactiveButtonClass, !isValid);
}

// Устанавливает слушатели событий для полей формы
function setEventListeners(formElement, config) {
  const inputs = formElement.querySelectorAll(config.inputSelector);

  inputs.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(formElement, config);
    });

    inputElement.addEventListener("blur", () => {
      checkInputValidity(formElement, inputElement, config);
    });
  });

  toggleButtonState(formElement, config);
}

// Включает валидацию для всех форм по заданному селектору
export function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);

  forms.forEach((formElement) => {
    formElement.addEventListener("submit", (e) => e.preventDefault());
    setEventListeners(formElement, config);
  });
}

// Очищает ошибки и сбрасывает состояние кнопки формы
export function clearValidation(formElement, config) {
  const inputs = formElement.querySelectorAll(config.inputSelector);
  const submitButton = formElement.querySelector(config.submitButtonSelector);

  inputs.forEach((inputElement) => {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    if (errorElement) errorElement.textContent = "";
    inputElement.classList.remove(config.inputErrorClass);
  });

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add(config.inactiveButtonClass);
  }
}
