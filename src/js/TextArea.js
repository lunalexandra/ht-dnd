export class TextArea {
  constructor(element) {
    this.element = element;
  }

  markup() {
    return `
      <form class="text-area">
        <textarea id="text-space" class="text-space" placeholder="Enter a title for this card..."></textarea>
        <div class="text-area-footer">
          <button type="button" class="add-card-btn">Add Card</button>
          <button type="button" class="textarea-close-btn">✖</button>
          <div class="small-menu footer-menu">
            <div class="small-menu-point"></div>
            <div class="small-menu-point"></div>
            <div class="small-menu-point"></div>
          </div>
        </div>
      </form>
    `;
  }

  render() {
    this.element.insertAdjacentHTML("beforeend", this.markup());
  }

  remove() {
    const textArea = this.element.querySelector(".text-area");
    if (textArea) {
      textArea.remove();
    }
  }
}
