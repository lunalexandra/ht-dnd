export class Card {
  constructor(title) {
    this.title = title;
  }

  markup() {
    return `
        <div class="card">
          <h3>${this.title}</h3>
          <div class="small-menu">
            <div class="small-menu-point"></div>
            <div class="small-menu-point"></div>
            <div class="small-menu-point"></div>
          </div>
          <div class="card-body"></div>
          <button type="button" class="addition-card">+ Add another card</button>
        </div>
      `;
  }
}
