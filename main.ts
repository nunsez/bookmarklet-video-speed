/**
 * @file A script to control the speed of html5 video playback in the browser.
 * @author Alexander Mandrikov <mad.nunsez@gmail.com>
 * @version 2.1.0
 * @license AGPLv3
 * @see {@link https://github.com/nunsez/bookmarklet-video-speed GitHub} for further information.
 */

const PREFIX = "nunsez-video-bookmarklet";
const DEFAULT_SPEED = 100;
const SEARCH_TIMEOUT = 500;
const STATE_ID = `${PREFIX}-state`;
const STORAGE_ID = `${PREFIX}-memory`;
const CONTROLLER_ID = `${PREFIX}-controller`;
const TICKMARKS_ID = `${PREFIX}-tickmarks`;
const STYLESHEET_ID = `${PREFIX}-stylesheet`;
const STYLES =
  `#${CONTROLLER_ID} * {box-sizing: border-box;color: #111;line-height:initial}` +
  `#${CONTROLLER_ID}, #${CONTROLLER_ID} .range, #${CONTROLLER_ID} .controls {margin: 0;padding: 4px;}` +
  `#${CONTROLLER_ID}, #${CONTROLLER_ID} .btn {border: 1px solid #444;border-radius: 4px;background-color: #eee;}` +
  `#${CONTROLLER_ID} {position: fixed;left: 8px;top: 8px;width: 150px;font: 15px monospace;box-shadow: 1px 1px 4px #444;user-select: none;z-index: 999999999;}` +
  `#${CONTROLLER_ID} .controls {display: flex;justify-content: space-between;align-items: center;}` +
  `#${CONTROLLER_ID} .btn {width: 20px;height: 20px;margin: 0;padding: 0;}` +
  `#${CONTROLLER_ID} .value {pointer-events: none;}` +
  `#${CONTROLLER_ID} .value::after {content: "%";margin-left: 2px;}` +
  `#${CONTROLLER_ID} .range {width: 100%;}` +
  `#${CONTROLLER_ID} .range ~ * {display: none;}`;

interface MyElement extends HTMLDivElement {
  [STATE_ID]?: State
}

function addStyles(document: Document) {
  if (document.head.querySelector(`#${STYLESHEET_ID}`)) return;

  const stylesheet = document.createElement("style");
  stylesheet.setAttribute("id", STYLESHEET_ID);
  stylesheet.textContent = STYLES;
  document.head.append(stylesheet);
}

class State {
  document: Document;
  speed: number;
  videos: HTMLVideoElement[] = [];
  controller: Controller;
  searchTimeoutId?: number;
  observer: MutationObserver;

  static getSpeed(): number {
    const storageSpeed = Number.parseInt(
      localStorage.getItem(STORAGE_ID) || "",
    );
    return Number.isNaN(storageSpeed) ? DEFAULT_SPEED : storageSpeed;
  }

  static getVideos(body: HTMLElement): HTMLVideoElement[] {
    const videos: HTMLVideoElement[] = [];

    body.querySelectorAll("video, iframe").forEach((el) => {
      if (el instanceof HTMLVideoElement) {
        videos.push(el);
      } else if (el instanceof HTMLIFrameElement) {
        const vid = State.getIDoc(el)?.querySelector("video");
        if (vid) {
          videos.push(vid);
        }
      }
    });

    return videos;
  }

  static getIDoc(ref: HTMLIFrameElement): Document | null {
    try {
      const doc = ref.contentWindow?.document || ref.contentDocument;
      return doc;
    } catch {
      console.log("iframe document is not reachable: " + ref.src);
      return null;
    }
  }

  constructor(document: Document) {
    this.document = document;
    this.speed = State.getSpeed();

    this.observer = new MutationObserver((mutations) =>
      this.refresh(mutations)
    );

    // create controller and his components
    this.controller = new Controller(this);
  }

  initialize() {
    this.observer.observe(document.body, { childList: true });

    // append controller to body tag
    this.controller.appendTo(document.body);
  }

  refresh(_mutationRecords: MutationRecord[]) {
    console.log('_mutationRecords', _mutationRecords)
    console.log('refresh', this.searchTimeoutId, this.controller);
    clearTimeout(this.searchTimeoutId);

    this.searchTimeoutId = setTimeout(() => {
      this.videos = State.getVideos(this.document.body);
      this.setSpeed(this.speed);
    }, SEARCH_TIMEOUT);
  }

  terminate() {
    console.log('terminate observer', this.observer)
    console.log('terminate oldController', this.controller)
    this.observer.disconnect();
    this.controller.el.remove();
    this.videos.forEach((v) => v.playbackRate = DEFAULT_SPEED / 100);
  }

  setSpeed(newSpeed: number) {
    if (!this.controller) return;
    if (Number.isNaN(newSpeed)) return;

    // The 0.05x playback rate is not in the supported playback range
    if (newSpeed === 5) {
      this.speed > 5 ? this.speed = 0 : this.speed = 10;
    } else if (newSpeed > 300) {
      this.speed = 300;
    } else if (newSpeed < 0) {
      this.speed = 0;
    } else {
      this.speed = newSpeed;
    }

    const speedString = this.speed.toString();

    this.controller.value.textContent = speedString;
    this.controller.range.value = speedString;
    this.videos.forEach((v) => v.playbackRate = this.speed / 100);

    console.log('set speed', this.videos, this.controller);

    localStorage.setItem(STORAGE_ID, speedString);
  }
}

class Controller {
  el: MyElement;
  subBtn: HTMLButtonElement = document.createElement("button");
  value: HTMLDivElement = document.createElement("div");
  addBtn: HTMLButtonElement = document.createElement("button");
  range: HTMLInputElement = document.createElement("input");

  static tickMarks = [10, 50, 100, 150, 200, 250, 300];

  constructor(state: State) {
    this.el = document.createElement("div");
    this.el[STATE_ID] = state;
  }

  appendTo(root: HTMLElement): Controller {
    // remove existing controller if exists
    root.querySelector(CONTROLLER_ID)?.remove();
    this.#build();
    this.#addListeners();
    root.append(this.el);
    return this;
  }

  get state(): State {
    return this.el[STATE_ID]!;
  }

  #addListeners() {
    this.range.addEventListener("input", () => {
      const speed = Number.parseFloat(this.range.value);
      this.state.setSpeed(speed);
    });

    this.subBtn.addEventListener(
      "click",
      () => this.state.setSpeed(this.state.speed - 5),
    );
    this.addBtn.addEventListener(
      "click",
      () => this.state.setSpeed(this.state.speed + 5),
    );
  }

  #build() {
    this.el.setAttribute("id", CONTROLLER_ID);
    this.el.append(
      this.#buildControls(),
      this.#buildRange(),
      this.#buildTickMarks(Controller.tickMarks),
    );
  }

  #buildControls(): HTMLDivElement {
    const controls = document.createElement("div");
    controls.classList.add("controls");
    controls.append(
      this.#buildSubButton(),
      this.#buildValue(),
      this.#buildAddButton(),
    );
    return controls;
  }

  #buildSubButton(): HTMLButtonElement {
    this.subBtn = document.createElement("button");
    this.subBtn.textContent = "-";
    this.subBtn.classList.add("btn", "sub");
    return this.subBtn;
  }

  #buildValue(): HTMLDivElement {
    this.value = document.createElement("div");
    this.value.textContent = this.state.speed.toString();
    return this.value;
  }

  #buildAddButton(): HTMLButtonElement {
    this.addBtn = document.createElement("button");
    this.addBtn.textContent = "+";
    this.addBtn.classList.add("btn", "add");
    return this.addBtn;
  }

  #buildRange(): HTMLInputElement {
    this.range = document.createElement("input");
    this.range.classList.add("range");
    this.range.setAttribute("type", "range");
    this.range.setAttribute("min", "10");
    this.range.setAttribute("max", "300");
    this.range.setAttribute("step", "10");
    this.range.setAttribute("list", TICKMARKS_ID);
    this.range.value = this.state.speed.toString();
    return this.range;
  }

  #buildTickMarks(values: number[]): HTMLDataListElement {
    const datalist = document.createElement("datalist");
    datalist.setAttribute("id", TICKMARKS_ID);

    const options = values.map((value) => {
      const option = document.createElement("option");
      option.value = value.toString();
      return option;
    });

    datalist.append(...options);
    return datalist;
  }
}

function main(window: Window) {
  const document = window.document;

  const myElement = document.querySelector<MyElement>(`#${CONTROLLER_ID}`);

  // remove controller if exist and restore video playback speed / toggle effect
  if (myElement) {
    const state = myElement[STATE_ID];
    state?.terminate();
    myElement.remove();
    return;
  }

  // add stylesheet if not exist
  addStyles(document);

  const state = new State(document);
  state.initialize();
}

main(window);
