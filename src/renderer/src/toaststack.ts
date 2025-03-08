export class Toaststack {
  private stack: HTMLElement;

  constructor() {
    const stack = document.querySelector<HTMLDivElement>('.toaststack')
    if (stack == null) {
      throw new Error('toaststack not found');
    }
    this.stack = stack;
  }

  appendSuccess(heading: string, message?: string): void {
    this.stack.appendChild(this.createToast('toast__success', heading, message));


  }
  appendError(heading: string, message: string): void {
    this.stack.appendChild(this.createToast('toast__error', heading, message));
  }

  private createToast(className: string, heading: string, message?: string): HTMLElement {
    const wrapperEl = document.createElement('section');
    wrapperEl.classList.add('toast', className);

    const headingEl = document.createElement('h1');
    headingEl.textContent = heading;
    wrapperEl.appendChild(headingEl);

    if (message) {
      const contentEl = document.createElement('p');
      contentEl.textContent = message;
      wrapperEl.appendChild(contentEl);
    }

    return wrapperEl;
  }
}
