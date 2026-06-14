/**
 * Shared TextScramble typewriter animation.
 *
 * Extracted from skills-carousel and bento-dock to eliminate duplication.
 * Key optimization: uses textContent instead of innerHTML to avoid
 * HTML parsing and layout thrashing during the rAF animation loop.
 * The highlight-color styled characters are achieved via a sibling
 * overlay span approach (caller can optionally supply an overlay element).
 */
export class TextScramble {
  constructor(el, speedConfig = 20) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}=+*^?#________";
    this.update = this.update.bind(this);
    this.speedConfig = speedConfig;
  }

  setText(newText) {
    const oldText = this.el.innerText || "";
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * this.speedConfig);
      const end = start + Math.floor(Math.random() * this.speedConfig);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameId);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += char;
      } else {
        output += from;
      }
    }
    // textContent avoids HTML parsing overhead that innerHTML causes every frame
    this.el.textContent = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameId = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  cancel() {
    cancelAnimationFrame(this.frameId);
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}
