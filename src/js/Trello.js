import { Card } from "./Cards";
import { SmallCard } from "./SmallCard";
import { TextArea } from "./TextArea";

export class Trello {
  constructor(parentEl) {
    this.parentEl = parentEl;
    this.smallCards = [];
    this.cardsTextArr = [[], [], []]; // тексты карточек
    this.timeout = null;
  }

  addCard() {
    const todoCard = new Card("TODO");
    const progressCard = new Card("IN PROGRESS");
    const doneCard = new Card("DONE");

    return `
        ${todoCard.markup()}
        ${progressCard.markup()}
        ${doneCard.markup()}
    `;
  }

  bindToDOM() {
    this.parentEl.innerHTML = this.addCard();
    this.load();
    this.initializeDragAndDrop();
  }

  addSmallCard(text) {
    const small = new SmallCard(text);
    return small.markup();
  }

  addTask() {
    const addBtns = this.parentEl.querySelectorAll(".addition-card");
    addBtns.forEach((btn, index) => {
      btn.addEventListener("click", (event) => {
        const card = event.currentTarget.closest(".card");
        const cardBody = card.querySelector(".card-body");

        const form = new TextArea(cardBody);
        form.render();
        btn.classList.add("hidden"); // скрываем кнопку добавления внизу

        const addCardBtn = card.querySelector(".add-card-btn");
        const textareaCloseBtn = card.querySelector(".textarea-close-btn");
        const input = card.querySelector("textarea");
        addCardBtn.addEventListener("click", (e) => {
          e.preventDefault();
          if (input.value) {
            cardBody.insertAdjacentHTML(
              "beforeend",
              this.addSmallCard(input.value),
            );
            this.cardsTextArr[index].push(input.value);
            this.save(index);
            this.showCloseBtn(index, cardBody);
            form.remove();
            btn.classList.remove("hidden");
            this.initializeDragAndDrop();
          }
        });
        textareaCloseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          form.remove();
          btn.classList.remove("hidden");
        });
      });
    });
  }

  showCloseBtn(index, element) {
    this.smallCards = element.querySelectorAll(".small-card");

    this.smallCards.forEach((item, i) => {
      item.addEventListener("mouseenter", (event) => {
        if (!item.querySelector(".cross")) {
          const cross = document.createElement("button");
          cross.classList.add("cross");
          cross.textContent = "✖";
          event.currentTarget.style.cursor = "pointer";
          item.appendChild(cross);

          cross.addEventListener("click", () => {
            item.remove();
            this.cardsTextArr[index].splice(i, 1);
            this.save(index);
          });
        }
      });

      item.addEventListener("mouseleave", () => {
        const cross = item.querySelector(".cross");
        if (cross) {
          cross.remove();
        }
      });
    });
  }

  save(index) {
    localStorage.setItem(
      `cards_${index}`,
      JSON.stringify(this.cardsTextArr[index]),
    );
  }

  load() {
    const cards = this.parentEl.querySelectorAll(".card");
    cards.forEach((el, index) => {
      const savedCards = JSON.parse(localStorage.getItem(`cards_${index}`));
      if (savedCards) {
        this.cardsTextArr[index] = savedCards;
        savedCards.forEach((text) => {
          const smallCardMarkup = this.addSmallCard(text);
          el.querySelector(".card-body").insertAdjacentHTML(
            "beforeend",
            smallCardMarkup,
          );
        });
        this.showCloseBtn(index, el.querySelector(".card-body"));
      }
    });
  }

  initializeDragAndDrop() {
    const items = this.parentEl.querySelectorAll(".small-card");

    items.forEach((item) => {
      item.addEventListener("mousedown", (e) => this.onMouseDown(e, item));
      item.addEventListener("selectstart", (e) => {
        e.preventDefault();
      });
    });

    document.addEventListener("mousemove", (e) => this.onMouseMove(e));
    document.addEventListener("mouseup", (e) => this.onMouseUp(e));
  }

  onMouseDown(e, item) {
    // Проверяем, был ли клик на кнопке закрытия текстового поля
    if (e.target.classList.contains("cross")) return;

    this.timeout = setTimeout(() => {
      // Если таймаут закончится, это будет считаться перетаскиванием
      this.timeout = null;
      e.preventDefault();
      this.draggedItem = item;
      this.originalParent = item.parentElement;
      this.nextSibling = item.nextSibling;
      this.offsetX = e.clientX - item.getBoundingClientRect().left;
      this.offsetY = e.clientY - item.getBoundingClientRect().top;
    }, 200);
  }

  onMouseMove(e) {
    if (!this.draggedItem) return;

    // Перемещаем draggedItem в document.body
    document.body.appendChild(this.draggedItem);
    this.draggedItem.style.pointerEvents = "none";
    // Устанавливаем стили для draggedItem
    this.draggedItem.classList.add("dragged");
    this.draggedItem.style.cursor = "grabbing";
    this.draggedItem.style.left = e.pageX - this.offsetX + "px";
    this.draggedItem.style.top = e.pageY - this.offsetY + "px";

    // Находим элементы под курсором
    const elementsUnderCursor = document.elementsFromPoint(
      e.clientX,
      e.clientY,
    );

    // Находим следующий элемент, перед которым будем вставлять
    const nextEl = elementsUnderCursor.find(
      (el) => el.classList.contains("small-card") && el !== this.draggedItem,
    );

    // Находим существующий пустой элемент
    const oldEmpty = document.querySelector(".empty");

    // Проверяем, находится ли курсор над пустым элементом
    const isCursorOverEmpty = elementsUnderCursor.includes(oldEmpty);

    // Если курсор не над пустым элементом и пустой элемент существует, удаляем его
    if (!isCursorOverEmpty && oldEmpty) {
      oldEmpty.remove();
    }

    // Если есть nextEl и пустая карточка не существует, создаем её
    if (nextEl && !oldEmpty) {
      const emptyEl = document.createElement("div");
      emptyEl.style.height = this.draggedItem.offsetHeight + "px";
      emptyEl.style.width = "100%";
      emptyEl.classList.add("empty");

      nextEl.parentNode.insertBefore(emptyEl, nextEl);
    }

    // Если есть nextEl и пустая карточка уже существует, перемещаем её
    if (nextEl && oldEmpty) {
      if (nextEl.previousSibling !== oldEmpty) {
        nextEl.parentNode.insertBefore(oldEmpty, nextEl);
      }
    }
  }

  onMouseUp(e) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
      console.log("Click event");
      return;
    }

    if (!this.draggedItem) return;
    const oldEmpty = document.querySelector(".empty");
    if (oldEmpty) {
      oldEmpty.remove();
    }

    // Получаем элементы под курсором
    const elementsUnderCursor = document.elementsFromPoint(
      e.clientX,
      e.clientY,
    );
    console.log("Elements under cursor:", elementsUnderCursor);

    const nextEl = elementsUnderCursor.find(
      (el) => el.classList.contains("small-card") && el !== this.draggedItem,
    );
    const newParent = elementsUnderCursor.find((el) =>
      el.classList.contains("card-body"),
    );

    console.log("Next element:", nextEl);
    console.log("New parent:", newParent);

    if (newParent) {
      if (nextEl && newParent.contains(nextEl)) {
        newParent.insertBefore(this.draggedItem, nextEl);
      } else {
        newParent.appendChild(this.draggedItem);
      }
    } else {
      // Возвращаем элемент на исходное место
      if (this.nextSibling) {
        this.originalParent.insertBefore(this.draggedItem, this.nextSibling);
      } else {
        this.originalParent.appendChild(this.draggedItem);
      }
    }

    // Сбрасываем стили и переменные
    this.draggedItem.style.pointerEvents = "auto";
    this.draggedItem.style.left = 0;
    this.draggedItem.style.top = 0;
    this.draggedItem.classList.remove("dragged");
    this.draggedItem = null;

    this.updateCardsTextArr();
  }

  updateCardsTextArr() {
    this.cardsTextArr = [[], [], []];
    const cardBodies = this.parentEl.querySelectorAll(".card-body");

    cardBodies.forEach((cardBody, index) => {
      const smallCards = cardBody.querySelectorAll(".small-card");
      smallCards.forEach((smallCard) => {
        this.cardsTextArr[index].push(
          smallCard.textContent.replace("✖", "").trim(),
        );
      });
      this.save(index);
    });
  }
}
