class LqipImage extends HTMLElement {
  connectedCallback() {
    const image = this.querySelector(".lqip__image");
    if (!image) return;

    const reveal = () => this.classList.add("is-loaded");
    if (image.complete) image.decode().then(reveal, reveal);
    else image.addEventListener("load", reveal, { once: true });
    image.addEventListener("error", reveal, { once: true });
  }
}

customElements.define("lqip-image", LqipImage);
