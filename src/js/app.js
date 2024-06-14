import { Trello } from "./Trello";

const container = document.querySelector(".container");
const trello = new Trello(container);

trello.bindToDOM();
trello.addTask();
