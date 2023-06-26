import './style.css';
import './crossrace.css';
import {findOrdering, parseRacers} from "./crossrace";

window.addEventListener('DOMContentLoaded', () => {
    startApp()
});

function startApp() {
    const input = document.getElementById('input') as HTMLTextAreaElement;
    const debug = document.getElementById('debug') as HTMLTextAreaElement;
    const output = document.getElementById('output') as HTMLTextAreaElement;
    const racersInput = document.getElementById('racers') as HTMLTextAreaElement;

    let racers = parseRacers(racersInput.value);
    let ordering = findOrdering(input.value);
    updateOutput();

    input.addEventListener('input', (e) => {
        const target = e.target as HTMLTextAreaElement;
        ordering = findOrdering(target.value);
        updateOutput();
    });

    racersInput.addEventListener('input', (e) => {
        const target = e.target as HTMLTextAreaElement;
        racers = parseRacers(target.value);
        console.log('racers', racers);
        updateOutput();
    });

    function updateOutput() {
        debug.value = JSON.stringify(ordering, null, 2);
        output.value = ordering
            .map(it => `${it.rider} ${racers[it.rider] ?? '???'}`).join('\n');
    }
}