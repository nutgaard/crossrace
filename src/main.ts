import './style.css';
import './crossrace.css';
import {findOrdering} from "./crossrace";

const input = document.getElementById('input') as HTMLTextAreaElement;
const debug = document.getElementById('debug') as HTMLTextAreaElement;
const output = document.getElementById('output') as HTMLTextAreaElement;

input.addEventListener('input', (e) => {
    const target = e.target as HTMLTextAreaElement;
    findOrderingAndUpdate(target.value);
})

input.value = `
1 2 3
1 3
1 2
`.trim();
findOrderingAndUpdate(input.value);

function findOrderingAndUpdate(value: string) {
    const ordering = findOrdering(value);
    debug.value = JSON.stringify(ordering, null, 2);
    output.value = ordering.map(it => it.rider).join('\n');
}