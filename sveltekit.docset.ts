import { DocsetBuilder } from '.';
import fs from 'fs-extra';
import front from 'front-matter';
import globby from "globby";
import toc from 'remark-toc';
import slug from 'remark-slug';
import highlight from 'remark-prism';

const transformHTML = doc => {

    let headers = doc.dom('h2');

    headers.each(function(this: any) {
        const header = doc.dom(this);
        header.attr('data-dash-type', 'section');
        header.attr('data-dash-name', header.text());

    });

    return doc;
}

async function processFile(filename: string) {

    const { attributes: meta, body } = await fs.readFile(filename, 'utf8').then(front);

    const content = '## ' + meta.title + "\n" + body;

    return { filename, meta, content };
}

async function generateDocuments() {
    const markdownFiles = await globby('./kit/documentation/docs/*.md');
    markdownFiles.sort();

    const docs = await Promise.all(markdownFiles.map(processFile));

    return [{
        filename: 'index.md',
        content: "# Svelte kit\n\n" +
            "## Table of Contents\n\n"
            + docs.map(({ content }) => content).join("\n\n")
    }];

}


new DocsetBuilder({
    name: 'Svelte kit',
    icon: './kit/examples/hn.svelte.dev/static/favicon.png',
    cssFiles: ['./assets/prism.css', './assets/github-pandoc.css'],
    platform_family: 'svelte-kit',
    output_dir: './build',
    homepage: 'https://kit.svelte.dev/',
    docs: generateDocuments,
    transformHTML,
    remarkConfig: remark => remark.use(toc).use(slug).use(highlight)
}).build();

