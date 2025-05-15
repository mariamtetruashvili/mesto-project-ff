import "../pages/index.css";
import "../images/avatar.jpg";
import "../images/logo.svg";
import { initialCards } from "../scripts/cards.js";
import { createCard, deleteCard, likeCallback } from "../components/card.js";
import { openPopup, closePopup } from "../components/modal.js";
import { enableValidation, clearValidation } from "../components/validation.js";
import {
  getUserInfo,
  updateUserInfo,
  getCards,
  addCardToServer,
  updateAvatar,
} from "../components/api.js";

// DOM-элементы
const cardsContainer = document.querySelector(".places__list");
const popupEdit = document.querySelector(".popup_type_edit");
const popupAdd = document.querySelector(".popup_type_new-card");
const popupImage = document.querySelector(".popup_type_image");
const imagePopupImg = popupImage.querySelector(".popup__image");
const imagePopupCaption = popupImage.querySelector(".popup__caption");
const profileName = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const formElement = document.querySelector(".popup_type_edit .popup__form");
const nameInput = formElement.querySelector(".popup__input_type_name");
const jobInput = formElement.querySelector(".popup__input_type_description");
const addCardForm = document.querySelector(".popup_type_new-card .popup__form");
const cardNameInput = addCardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = addCardForm.querySelector(".popup__input_type_url");
const profileTitle = document.querySelector(".profile__title");
const profileImage = document.querySelector(".profile__image");
const editButton = document.querySelector(".profile__edit-button");
const editPopup = document.querySelector(".popup_type_edit");
const editProfileForm = document.forms["edit-profile"];
const addForm = popupAdd.querySelector(".popup__form");
const placeNameInput = addForm.querySelector(".popup__input_type_card-name");
const linkInput = addForm.querySelector(".popup__input_type_url");
const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector("form");
const avatarInput = avatarForm.querySelector('input[name="avatar"]');
const avatarSubmitButton = avatarForm.querySelector('button[type="submit"]');
const avatarEditIcon = document.querySelector(".profile__avatar-edit-icon");
const placesList = document.querySelector(".places__list");

// Функция открытия попапа с изображением
function openImagePopup(name, link) {
  const popup = document.querySelector(".popup_type_image");
  const popupImage = popup.querySelector(".popup__image");
  const popupCaption = popup.querySelector(".popup__caption");

  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;

  openPopup(popup);
}

// Отображаем стартовые карточки
initialCards.forEach((cardData) => {
  const cardElement = createCard(
    cardData,
    deleteCard,
    likeCallback,
    openImagePopup
  );
  cardsContainer.append(cardElement);
});

// Кнопки открытия попапов
document
  .querySelector(".profile__edit-button")
  .addEventListener("click", () => {
    nameInput.value = profileName.textContent;
    jobInput.value = profileDescription.textContent;
    openPopup(popupEdit);
  });

document.querySelector(".profile__add-button").addEventListener("click", () => {
  openPopup(popupAdd);
});

// Закрытие попапов по кнопке
document.querySelectorAll(".popup__close").forEach((btn) => {
  btn.addEventListener("click", () => {
    const popup = btn.closest(".popup");
    closePopup(popup);
  });
});

// Закрытие по клику вне попапа
document.querySelectorAll(".popup").forEach((popup) => {
  popup.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("popup")) {
      closePopup(popup);
    }
  });
});

// === ВАЛИДАЦИЯ ФОРМ ===

// Конфигурация для валидации: классы, селекторы и настройки
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Включаем валидацию форм на странице
enableValidation(validationConfig);

// Очистка ошибок валидации при открытии формы редактирования профиля
const profileForm = document.forms["edit-profile"];
clearValidation(profileForm, validationConfig);

// Показать ошибку валидации под полем ввода
function showError(inputId, errorMessage) {
  const input = document.getElementById(inputId);
  const errorElement = document.getElementById(`${inputId}-error`);
  input.classList.add("popup__input_type_error");
  errorElement.textContent = errorMessage;
}

// === РЕДАКТИРОВАНИЕ ПРОФИЛЯ ===

// Обработчик отправки формы редактирования профиля
function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = editProfileForm.querySelector(".popup__button");
  submitButton.textContent = "Сохранение...";

  updateUserInfo(
    editProfileForm.elements.name.value,
    editProfileForm.elements.description.value
  )
    .then((userData) => {
      updateProfileOnPage(userData);
      closePopup(editPopup);
    })
    .catch((err) => console.error("Ошибка при обновлении профиля:", err))
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
}

// Открытие попапа редактирования профиля с предзаполненными данными
function openEditProfilePopup() {
  getUserInfo()
    .then((user) => {
      editProfileForm.elements.name.value = user.name;
      editProfileForm.elements.description.value = user.about;
      openPopup(editPopup);
    })
    .catch((err) =>
      console.error("Ошибка при загрузке данных пользователя:", err)
    );
}

// Привязка событий к кнопкам и формам
editButton.addEventListener("click", openEditProfilePopup);
editProfileForm.addEventListener("submit", handleProfileFormSubmit);

// === ДОБАВЛЕНИЕ КАРТОЧКИ ===

// Обработка отправки формы добавления новой карточки
function handleAddCardFormSubmit(evt) {
  evt.preventDefault();

  const form = evt.target;
  const submitButton = form.querySelector("button[type='submit']");

  const name = placeNameInput.value.trim();
  const link = linkInput.value.trim();

  if (!name || !link) {
    console.error("Название и ссылка обязательны");
    return;
  }

  submitButton.textContent = "Сохранение...";

  addCardToServer(name, link)
    .then((newCard) => {
      const cardElement = createCard(
        newCard,
        currentUserId,
        newCard.owner._id,
        deleteCard,
        (cardId, likeButton, likeCounter) =>
          likeCallback(cardId, likeButton, likeCounter),
        openImagePopup
      );
      placesList.prepend(cardElement);
      closePopup(popupAdd);
      addForm.reset();
    })
    .catch((err) => console.error("Ошибка при добавлении карточки:", err))
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
}

// Привязка события к форме добавления карточки
addForm.addEventListener("submit", handleAddCardFormSubmit);

// === ЗАГРУЗКА И ОТРИСОВКА ДАННЫХ ===

let currentUserId = ""; // ID текущего пользователя

// Обновление информации профиля на странице
function updateProfileOnPage(userData) {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileImage.style.backgroundImage = `url('${userData.avatar}')`;
}

// Отрисовка всех карточек на странице
function renderCards(cards) {
  placesList.innerHTML = "";
  cards.forEach((card) => {
    const cardElement = createCard(
      card,
      currentUserId,
      card.owner._id,
      deleteCard,
      (cardId, likeButton, likeCounter) =>
        likeCallback(cardId, likeButton, likeCounter),
      openImagePopup
    );
    placesList.appendChild(cardElement);
  });
}

// Загрузка данных пользователя и карточек после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  Promise.all([getUserInfo(), getCards()])
    .then(([userData, cards]) => {
      currentUserId = userData._id;
      updateProfileOnPage(userData);
      renderCards(cards);
    })
    .catch((err) => console.error("Ошибка при загрузке данных:", err));
});

// === ОБНОВЛЕНИЕ АВАТАРА ===

// Проверка, что URL ведёт на изображение
function validateImageUrl(url) {
  return fetch(url, { method: "HEAD" }).then((response) => {
    const contentType = response.headers.get("Content-Type");
    if (!response.ok)
      throw new Error(`Сервер вернул статус: ${response.status}`);
    if (!contentType.startsWith("image/")) {
      throw new Error(
        `Ссылка не ведёт на изображение (Content-Type: ${contentType})`
      );
    }
    return true;
  });
}

// Обработчик отправки формы изменения аватара
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const newAvatarUrl = avatarInput.value;

  validateImageUrl(newAvatarUrl)
    .then(() => {
      avatarSubmitButton.textContent = "Сохранение...";
      return updateAvatar(newAvatarUrl);
    })
    .then((data) => {
      profileImage.style.backgroundImage = `url(${data.avatar})`;
      closePopup(avatarPopup);
      avatarForm.reset();
    })
    .catch((err) => {
      console.error("Ошибка при проверке или обновлении:", err);
      showError("avatar-url", err.message || "Ошибка при валидации ссылки");
    })
    .finally(() => {
      avatarSubmitButton.textContent = "Сохранить";
    });
});

// Индикация ошибки при некорректном вводе ссылки на аватар
avatarInput.addEventListener("input", () => {
  if (!avatarInput.validity.valid) {
    avatarInput.classList.add("popup__input_type_error");
  } else {
    avatarInput.classList.remove("popup__input_type_error");
  }
});

// Открытие попапа редактирования аватара
avatarEditIcon.addEventListener("click", () => openPopup(avatarPopup));
