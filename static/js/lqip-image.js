class LqipImage extends HTMLElement {
  connectedCallback() {
    const image = this.querySelector(".lqip__image");
    if (!image) return;

    const reveal = () => this.classList.add("is-loaded");
    image.addEventListener("load", () => image.decode().then(reveal, reveal), { once: true });
    image.addEventListener("error", reveal, { once: true });
    if (image.complete && image.naturalWidth) {
      this.classList.add("is-cached");
      reveal();
    }
  }
}

customElements.define("lqip-image", LqipImage);
