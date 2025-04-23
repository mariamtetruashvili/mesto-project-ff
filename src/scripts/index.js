import "../pages/index.css";
import "../images/avatar.jpg";
import "../images/logo.svg";
import { initialCards } from "../scripts/cards.js";

import { createCard, deleteCard, likeCallback } from "../components/card.js";
import { openPopup, closePopup } from "../components/modal.js";

// DOM-элементы
const cardsContainer = document.querySelector(".places__list");
const popupEdit = document.querySelector(".popup_type_edit");
const popupAdd = document.querySelector(".popup_type_new-card");
const popupImage = document.querySelector(".popup_type_image");
const imagePopupImg = popupImage.querySelector(".popup__image");
const imagePopupCaption = popupImage.querySelector(".popup__caption");

// Функция открытия попапа с изображением
function openImagePopup(name, link) {
  imagePopupImg.src = link;
  imagePopupImg.alt = name;
  imagePopupCaption.textContent = name;
  openPopup(popupImage);
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

// Работа с формой профиля
const profileName = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const formElement = document.querySelector(".popup_type_edit .popup__form");
const nameInput = formElement.querySelector(".popup__input_type_name");
const jobInput = formElement.querySelector(".popup__input_type_description");

function handleFormSubmit(evt) {
  evt.preventDefault();
  profileName.textContent = nameInput.value;
  profileDescription.textContent = jobInput.value;
  closePopup(popupEdit);
}

formElement.addEventListener("submit", handleFormSubmit);

// Работа с формой добавления карточки
const addCardForm = document.querySelector(".popup_type_new-card .popup__form");
const cardNameInput = addCardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = addCardForm.querySelector(".popup__input_type_url");

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const newCardData = {
    name: cardNameInput.value,
    link: cardLinkInput.value,
  };

  const newCardElement = createCard(
    newCardData,
    deleteCard,
    likeCallback,
    openImagePopup
  );

  cardsContainer.prepend(newCardElement);
  addCardForm.reset();
  closePopup(popupAdd);
}

addCardForm.addEventListener("submit", handleAddCardSubmit);
