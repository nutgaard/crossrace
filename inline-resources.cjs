const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const source = process.argv[2];
const basesource = path.dirname(source);
const output = process.argv[3];

const content = fs.readFileSync(source, 'utf-8');

const $ = cheerio.load(content);

$('link[rel="stylesheet"]')
    .filter((index, element) => {
        return !$(element).attr('href').startsWith('http');
    })
    .each((index, element) => {
        const $element = $(element);
        const href = $element.attr('href');

        const css = fs.readFileSync(path.join(basesource, href), 'utf-8');

        $element.replaceWith(`<style>${css}</style>`)
    });

$('script[src]')
    .filter((index, element) => {
        return !$(element).attr('src').startsWith('http');
    })
    .each((index, element) => {
        const $element = $(element);
        const src = $element.attr('src');

        const js = fs.readFileSync(path.join(basesource, src), 'utf-8');

        $element.replaceWith(`<script defer>${js}</script>`)
    });

fs.writeFileSync(output, $.html(), 'utf-8');
