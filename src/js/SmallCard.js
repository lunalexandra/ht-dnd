export class SmallCard {
  constructor(text) {
    this.text = text;
  }

  markup() {
    return `
        <div class="small-card">${this.text}</div>
        `;
  }
}
