export function createCard(
  cardData,
  currentUserId,
  ownerId,
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
  const likeCounter = cardElement.querySelector(".card__like-counter");

  // Устанавливаем изображение, alt и заголовок карточки
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  // Показываем количество лайков
  likeCounter.textContent = cardData.likes?.length || 0;

  // Проверяем, поставил ли текущий пользователь лайк
  function isLikedByUser(cardData, currentUserId) {
    return (
      Array.isArray(cardData.likes) &&
      cardData.likes.some((user) => user._id === currentUserId)
    );
  }

  if (isLikedByUser(cardData, currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Если карточка не принадлежит текущему пользователю — удаляем кнопку удаления
  if (currentUserId !== ownerId) {
    deleteButton.remove();
  } else {
    // Обработчик удаления карточки
    deleteButton.addEventListener("click", (evt) => {
      evt.stopPropagation();
      deleteCallback(cardData._id, cardElement);
    });
  }

  // Обработка клика по изображению — вызов переданной функции
  cardImage.addEventListener("click", () =>
    imageClickCallback(cardData.name, cardData.link)
  );

  // Обработка клика по кнопке лайка — вызов переданной функции
  likeButton.addEventListener("click", () => {
    likeCallback(cardData._id, likeButton, likeCounter);
  });

  return cardElement;
}
