import { findOrdering, findUnrecognizedDrivers, parseRacers, RiderOrder } from './crossrace';
import {
  CREATE_NEW,
  DIRTY_CONTENT, PRINT_REQUEST,
  SAVE_REQUEST,
  SAVE_RESPONSE,
  SAVE_SUCCESS,
  SET_CONTENT, TOGGLE_DEBUG,
} from '../../common/ipc-commands';
import { Toaststack } from './toaststack';
import { debounce } from './utils';
// @ts-ignore Just importing a type
import type { Api } from '../../preload/index';

async function insertVersions(): Promise<void> {
  const versions = window.electron.process.versions
  const api = window.api as Api;
  replaceText('.app-version', `v${await api.getVersion()}`);
  replaceText('.electron-version', `Electron v${versions.electron}`)
  replaceText('.chrome-version', `Chromium v${versions.chrome}`)
  replaceText('.node-version', `Node v${versions.node}`)
}

function replaceText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.innerText = text
  }
}

function runApp(): void {
  let contentFileFromFile = {
    racers: '',
    data: '',
  };
  const inputEl = document.getElementById('input') as HTMLTextAreaElement;
  const debugLabel = document.querySelector('[for=debug]') as HTMLLabelElement;
  const debugEl = document.getElementById('debug') as HTMLTextAreaElement;
  const outputEl = document.getElementById('output') as HTMLTextAreaElement;
  const outputFilterEl = document.getElementById('output_filter') as HTMLInputElement;
  const filenameEl = document.getElementById('filename') as HTMLSpanElement;
  const racersEl = document.getElementById('racers') as HTMLTextAreaElement;
  const errorsEl = document.querySelector('.errors') as HTMLDivElement;
  const toaststack = new Toaststack();
  const updateErrorDebounced = debounce(updateError, 300);

  runCalculations();
  inputEl.addEventListener('input', runCalculations);
  racersEl.addEventListener('input', runCalculations);
  outputFilterEl.addEventListener('input', runCalculations);

  window.electron.ipcRenderer.on(SET_CONTENT, (_, { filename, content }) => {
    contentFileFromFile = structuredClone(content);
    racersEl.value = content.racers;
    inputEl.value = content.data;
    filenameEl.textContent = ` - ${filename}`;
    runCalculations();
    toaststack.appendSuccess('Opened file', `Opened ${filename}`);
  });

  window.electron.ipcRenderer.on(SAVE_REQUEST, (_, filename) => {
    const content = {
      racers: racersEl.value,
      data: inputEl.value
    };

    window.electron.ipcRenderer.send(SAVE_RESPONSE, {
      filename,
      content
    });
  });

  window.electron.ipcRenderer.on(SAVE_SUCCESS, (_, filename) => {
    toaststack.appendSuccess('Saved file', `Saved as ${filename}`);
    contentFileFromFile = {
      racers: racersEl.value,
      data: inputEl.value,
    };
    filenameEl.textContent = ` - ${filename}`;
    dirtyCheck();
  });

  window.electron.ipcRenderer.on(CREATE_NEW, () => {
    toaststack.appendSuccess('New file');
    inputEl.value = '';
    racersEl.value = '';
    filenameEl.textContent = ``;
    runCalculations();
  });

  window.electron.ipcRenderer.on(PRINT_REQUEST, () => {
    window.print();
  });

  window.electron.ipcRenderer.on(TOGGLE_DEBUG, () => {
    const hidden = debugLabel.classList.contains('hidden');
    if (hidden) {
      debugLabel.classList.remove('hidden');
    } else {
      debugLabel.classList.add('hidden')
    }
  });

  errorsEl.addEventListener('click', (e: MouseEvent) => {
    const htmlTarget = e.target as HTMLElement;
    if (htmlTarget instanceof HTMLAnchorElement) {
      selectFirstOccurenceOf(htmlTarget.dataset.rider);
      console.log('clicked link', htmlTarget.dataset.rider);
    } else {
      console.log('clicked elsewhere')
    }
  });

  function runCalculations(): void {
    const racers = parseRacers(racersEl.value);
    const ordering = findOrdering(inputEl.value);
    const unrecognizedRacers = findUnrecognizedDrivers(inputEl.value, racersEl.value);
    const filter = outputFilterEl.value;
    dirtyCheck();
    updateOutput(racers, ordering, filter);
    updateErrorDebounced(unrecognizedRacers);
  }

  function updateOutput(racers: Record<string, string>, ordering: RiderOrder[], filter: string): void {
    debugEl.value = JSON.stringify(ordering, null, 2);
    outputEl.value = ordering
      .map((it) => `${it.rider} ${racers[it.rider] ?? '???'}`)
      .filter(it => {
        if (filter.length === 0) return true;
        return it.toLowerCase().includes(filter.toLowerCase());
      })
      .map((it, i) => `${(i + 1).toString().padStart(2, ' ')}. ${it}`)
      .join('\n');
  }

  function updateError(unrecognizedRacers: string[]): void {
    errorsEl.innerHTML = '';
    errorsEl.textContent = unrecognizedRacers.length === 0 ? '' : `Found unrecognized riders. Check: `
    for (let i = 0; i < unrecognizedRacers.length; i++) {
      const unrecognizedRacer = unrecognizedRacers[i];
      const isLast = i === (unrecognizedRacers.length - 1);
      const isNextToLast = i === (unrecognizedRacers.length - 2);

      const link = document.createElement('a');
      link.href = `#`;
      link.dataset.rider = unrecognizedRacer;
      link.textContent = unrecognizedRacer;
      errorsEl.appendChild(link);

      const divider = document.createElement('span');
      divider.textContent = isLast ? '.' : isNextToLast ? ' and ' : ', ';
      errorsEl.appendChild(divider);
    }
  }

  function selectFirstOccurenceOf(rider: string | undefined): void {
    if (!rider) return;

    const length = rider.length;
    const start = inputEl.value.indexOf(rider);

    inputEl.setSelectionRange(start, start + length);
    inputEl.focus();
  }

  function dirtyCheck(): void {
    const racersHasChanged = racersEl.value !== contentFileFromFile.racers;
    const contentHasChanged = inputEl.value !== contentFileFromFile.data;

    const hasChanges = racersHasChanged || contentHasChanged;
    window.electron.ipcRenderer.send(DIRTY_CONTENT, { hasChanges });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  insertVersions();
  runApp();
});
