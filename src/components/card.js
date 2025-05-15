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
  const deleteConfirmPopup = document.querySelector(
    ".popup_type_delete-confirm"
  );
  const deleteConfirmForm = deleteConfirmPopup.querySelector(
    '[name="confirm-delete"]'
  );

  // Устанавливаем изображение и название карточки
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  // Отображаем количество лайков
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

  // Если карточка не принадлежит текущему пользователю, скрываем кнопку удаления
  if (currentUserId !== ownerId) {
    deleteButton.remove();
  }

  // Обработка клика по кнопке удаления
  deleteButton.addEventListener("click", (evt) => {
    evt.stopPropagation();
    deleteConfirmPopup.classList.add("popup_is-opened");

    // Обработчик подтверждения удаления
    const handleDeleteSubmit = (e) => {
      e.preventDefault();

      deleteCallback(cardData._id, cardElement);

      // Закрываем попап и удаляем обработчик
      deleteConfirmPopup.classList.remove("popup_is-opened");
      deleteConfirmForm.removeEventListener("submit", handleDeleteSubmit);
    };

    deleteConfirmForm.addEventListener("submit", handleDeleteSubmit);
  });

  // Обработка клика по изображению карточки
  cardImage.addEventListener("click", () =>
    imageClickCallback(cardData.name, cardData.link)
  );

  // Обработка клика по кнопке лайка
  likeButton.addEventListener("click", () => {
    likeCallback(cardData._id, likeButton, likeCounter);
  });

  return cardElement;
}

export function deleteCard(cardId, cardElement) {
  fetch(`https://nomoreparties.co/v1/wff-cohort-39/cards/${cardId}`, {
    method: "DELETE",
    headers: {
      authorization: "a937dc3d-a867-499c-a146-3d115cd1c807",
    },
  })
    .then((res) => {
      if (res.ok) {
        cardElement.remove();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
    });
}

export function likeCallback(cardId, likeButton, likeCounter) {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  const method = isLiked ? "DELETE" : "PUT";

  fetch(`https://nomoreparties.co/v1/wff-cohort-39/cards/likes/${cardId}`, {
    method: method,
    headers: {
      authorization: "a937dc3d-a867-499c-a146-3d115cd1c807",
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return res.json().then((err) => {
          throw err;
        });
      }
    })
    .then((data) => {
      likeCounter.textContent = data.likes.length;
      likeButton.classList.toggle("card__like-button_is-active", !isLiked);
    })
    .catch((err) => {
      console.error("Ошибка при изменении лайка:", err);
    });
}
