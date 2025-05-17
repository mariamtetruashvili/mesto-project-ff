import "../pages/index.css";
import "../images/avatar.jpg";
import "../images/logo.svg";
import { initialCards } from "../scripts/cards.js";
import { createCard } from "../components/card.js";
import { openPopup, closePopup } from "../components/modal.js";
import {
  enableValidation,
  clearValidation,
  validateImageUrl,
} from "../components/validation.js";
import {
  getUserInfo,
  updateUserInfo,
  getCards,
  addCardToServer,
  updateAvatar,
  deleteCardApi,
  likeCard,
  dislikeCard,
} from "../components/api.js";

// DOM-элементы
const cardsContainer = document.querySelector(".places__list");
const popupEdit = document.querySelector(".popup_type_edit");
const popupAdd = document.querySelector(".popup_type_new-card");
const profileName = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const formElement = document.querySelector(".popup_type_edit .popup__form");
const nameInput = formElement.querySelector(".popup__input_type_name");
const jobInput = formElement.querySelector(".popup__input_type_description");
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
const popup = document.querySelector(".popup_type_image");
const imagePopup = popup.querySelector(".popup__image");
const popupCaption = popup.querySelector(".popup__caption");
const deleteConfirmPopup = document.querySelector(".popup_type_delete-confirm");
const deleteConfirmForm = deleteConfirmPopup.querySelector(
  '[name="confirm-delete"]'
);

// Функция открытия попапа с изображением
function openImagePopup(name, link) {
  imagePopup.src = link;
  imagePopup.alt = name;
  popupCaption.textContent = name;
  openPopup(popup);
}

// Кнопки открытия попапов профиля и добавления карточки
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

// Закрытие попапов по кнопке "Закрыть"
document.querySelectorAll(".popup__close").forEach((btn) => {
  btn.addEventListener("click", () => {
    const popup = btn.closest(".popup");
    closePopup(popup);
  });
});

// Закрытие попапов по клику вне содержимого (на подложку)
document.querySelectorAll(".popup").forEach((popup) => {
  popup.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("popup")) {
      closePopup(popup);
    }
  });
});

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

// Конфигурация валидации форм — селекторы и классы ошибок
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Включаем валидацию на всех формах согласно конфигу
enableValidation(validationConfig);

// Функция открытия попапа редактирования профиля с предзаполнением
function openEditProfilePopup() {
  editProfileForm.elements.name.value = profileTitle.textContent;
  editProfileForm.elements.description.value = profileDescription.textContent;
  clearValidation(editProfileForm, validationConfig);
  openPopup(editPopup);
}

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

// Привязка событий кнопки и формы профиля
editButton.addEventListener("click", openEditProfilePopup);
editProfileForm.addEventListener("submit", handleProfileFormSubmit);

// Функция обновления профиля на странице после успешного запроса
function updateProfileOnPage(userData) {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileImage.style.backgroundImage = `url('${userData.avatar}')`;
}

// Обработчик отправки формы добавления новой карточки
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
      clearValidation(addForm, validationConfig);
    })
    .catch((err) => console.error("Ошибка при добавлении карточки:", err))
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
}

// Привязка события к форме добавления карточки
addForm.addEventListener("submit", handleAddCardFormSubmit);

let currentUserId = ""; // ID текущего пользователя, чтобы отличать свои карточки

// Функция отрисовки массива карточек
function renderCards(cards) {
  placesList.innerHTML = "";
  cards.forEach((card) => {
    const cardElement = createCard(
      card,
      currentUserId,
      card.owner._id,
      deleteCard,
      likeCallback,
      openImagePopup
    );
    placesList.appendChild(cardElement);
  });
}

// Загрузка профиля и карточек после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  Promise.all([getUserInfo(), getCards()])
    .then(([userData, cards]) => {
      currentUserId = userData._id;
      updateProfileOnPage(userData);
      renderCards(cards);
    })
    .catch((err) => console.error("Ошибка при загрузке данных:", err));
});

// Обработчик отправки формы изменения аватара с валидацией URL
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
      clearValidation(avatarForm, validationConfig);
    })
    .catch((err) => {
      console.error("Ошибка при проверке или обновлении:", err);
      showError("avatar-url", err.message || "Ошибка при валидации ссылки");
    })
    .finally(() => {
      avatarSubmitButton.textContent = "Сохранить";
    });
});

// Клик по иконке аватара открывает попап с формой
avatarEditIcon.addEventListener("click", () => openPopup(avatarPopup));

// Добавление и удаление лайков
function likeCallback(cardId, likeButton, likeCounter) {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  const request = isLiked ? dislikeCard : likeCard;

  request(cardId)
    .then((data) => {
      likeCounter.textContent = data.likes.length;
      likeButton.classList.toggle("card__like-button_is-active", !isLiked);
    })
    .catch((err) => {
      console.error("Ошибка при изменении лайка:", err);
    });
}

// Функция удаления карточки с подтверждением в попапе
function deleteCard(cardId, cardElement) {
  openPopup(deleteConfirmPopup);

  deleteConfirmForm.onsubmit = (evt) => {
    evt.preventDefault();

    deleteCardApi(cardId)
      .then(() => {
        cardElement.remove();
        closePopup(deleteConfirmPopup);
      })
      .catch((err) => {
        console.error("Ошибка при удалении карточки:", err);
      });
  };
}
