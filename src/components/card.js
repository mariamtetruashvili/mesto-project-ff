// Функция создания карточки
export function createCard(
  cardData,
  deleteCallback,
  likeCallback,
  imageClickCallback
) {
  const cardTemplate = document.querySelector("#card-template").content;
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const likeButton = cardElement.querySelector(".card__like-button");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  cardImage.addEventListener("click", () =>
    imageClickCallback(cardData.name, cardData.link)
  );
  deleteButton.addEventListener("click", () => deleteCallback(cardElement));
  likeButton.addEventListener("click", () => likeCallback(likeButton));

  return cardElement;
}

// Функция удаления карточки
export function deleteCard(cardElement) {
  cardElement.remove();
}

// Функция лайка карточки
export function likeCallback(likeButton) {
  likeButton.classList.toggle("card__like-button_is-active");
}
