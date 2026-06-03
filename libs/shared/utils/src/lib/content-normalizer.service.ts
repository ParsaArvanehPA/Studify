import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

/** Result of normalizing a source study document. */
export interface NormalizedDoc {
    /** Sanitized prose HTML, ready to render inside `.prose`. */
    html: string;
    /** Whether the source is right-to-left (Persian / Arabic). */
    rtl: boolean;
}

/**
 * Takes any source study-HTML, strips its bespoke styling, and re-renders it into
 * the global design-system `.prose` format. Isomorphic TS port of the normalizer
 * in the design prototype's studify-reader.js — works in the browser and during
 * static prerendering (uses the injected DOCUMENT, never the live iframe trick).
 */
@Injectable({providedIn: 'root'})
export class ContentNormalizerService {
    private readonly document = inject(DOCUMENT);

    /** Normalize a full source HTML document string into prose markup. */
    normalize(sourceHtml: string, forceRtl = false): NormalizedDoc {
        const bodyHtml = this.extractBody(sourceHtml);
        const rtl = forceRtl || this.detectRtl(sourceHtml);

        const src = this.document.createElement('div');
        src.innerHTML = bodyHtml;
        this.buildQuizzes(src);

        const out = this.document.createElement('div');
        Array.from(src.childNodes).forEach((node) => this.convert(node, out));
        this.decorate(out);

        return {html: out.innerHTML, rtl};
    }

    // --- source parsing -------------------------------------------------------

    private extractBody(html: string): string {
        const match = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
        return match ? match[1] : html;
    }

    private detectRtl(html: string): boolean {
        const tag = /<html[^>]*>/i.exec(html);
        if (!tag) {
            return false;
        }
        const open = tag[0];
        return /dir\s*=\s*['"]?rtl/i.test(open) || /lang\s*=\s*['"]?(fa|ar|ur|he)/i.test(open);
    }

    // --- helpers --------------------------------------------------------------

    private classOf(el: Element): string {
        return (el.getAttribute('class') || '').toLowerCase();
    }

    private calloutType(el: Element): string {
        const c = this.classOf(el);
        const t = (el.textContent || '').toLowerCase();
        if (/warn|caution|danger|alert/.test(c)) {
            return 'warn';
        }
        if (/tip|note|info|check|success/.test(c)) {
            return 'tip';
        }
        if (/def|definition|key|concept|box/.test(c)) {
            return 'def';
        }
        if (/never|avoid|don.t|✗|mistake/.test(t) && el.querySelector('strong')) {
            return 'warn';
        }
        return 'def';
    }

    /** Drop inline styles and decorative presentational attributes from a subtree. */
    private strip<T extends Element>(node: T): T {
        const attrs = ['style', 'width', 'height', 'bgcolor', 'color', 'align', 'valign', 'cellpadding', 'cellspacing', 'border'];
        Array.from(node.querySelectorAll('*')).forEach((el) => attrs.forEach((a) => el.removeAttribute(a)));
        return node;
    }

    private stripQLabel(el: Element): string {
        const clone = this.strip(el.cloneNode(true) as Element);
        const s = clone.querySelector('strong,b');
        if (s && /^\s*(س(و|ؤ)ال|پرسش|question|q)\s*[\d۰-۹]*\s*[:：.-]?\s*$/i.test(s.textContent || '')) {
            s.remove();
        }
        return clone.innerHTML.trim();
    }

    // --- pre-pass: Q&A pairs / exam questions → one interactive quiz ----------

    private buildQuizzes(root: Element): void {
        const questions = Array.from(root.querySelectorAll('.question-box,.question,.q-box'));
        if (!questions.length) {
            return;
        }
        const quiz = this.document.createElement('section');
        quiz.className = 'quiz';
        quiz.setAttribute('data-ready', '');
        quiz.innerHTML =
            `<div class="quiz-head"><span class="qi">?</span>` +
            `<span class="qt">Self-test · check yourself</span>` +
            `<span class="qc">${questions.length} questions</span></div>`;
        const body = this.document.createElement('div');
        body.className = 'quiz-body';
        quiz.appendChild(body);

        const toRemove: Element[] = [];
        questions.forEach((q, n) => {
            let ans: Element | null = q.nextElementSibling;
            while (ans && !/answer-box|answer|a-box/.test(this.classOf(ans)) && !ans.classList.contains('question-box')) {
                ans = ans.nextElementSibling;
            }
            if (ans && ans.classList.contains('question-box')) {
                ans = null;
            }
            const det = this.document.createElement('details');
            det.className = 'qa';
            const num = String(n + 1).padStart(2, '0');
            det.innerHTML = `<summary><span class="qnum">${num}</span><span class="qtext">${this.stripQLabel(q)}</span></summary>`;
            if (ans) {
                const a = this.document.createElement('div');
                a.className = 'qa-a';
                a.innerHTML = this.strip(ans.cloneNode(true) as Element).innerHTML;
                det.appendChild(a);
                toRemove.push(ans);
            }
            body.appendChild(det);
            toRemove.push(q);
        });
        questions[0].parentNode?.insertBefore(quiz, questions[0]);
        toRemove.forEach((el) => el.remove());
    }

    // --- convert one source node into normalized DS markup --------------------

    private convert(el: Node, out: Element): void {
        if (el.nodeType === TEXT_NODE) {
            const s = (el.textContent || '').trim();
            if (s) {
                const p = this.document.createElement('p');
                p.textContent = el.textContent;
                out.appendChild(p);
            }
            return;
        }
        if (el.nodeType !== ELEMENT_NODE) {
            return;
        }
        const element = el as Element;
        const tag = element.tagName.toLowerCase();

        if (['script', 'style', 'link', 'meta'].includes(tag)) {
            return;
        }

        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'table', 'hr', 'blockquote', 'pre', 'figure'].includes(tag)) {
            out.appendChild(this.strip(element.cloneNode(true) as Element));
            return;
        }

        if (['div', 'section', 'article', 'aside'].includes(tag)) {
            const c = this.classOf(element);
            if (element.classList.contains('quiz')) {
                out.appendChild(element.cloneNode(true) as Element);
                return;
            }
            const tt = (element.textContent || '').trim();
            const CLOSER = /good ?luck|you'?ve got|you can do|congratulations|best of luck|happy studying|keep going|🎉|🎯/i;
            if (tt.length < 170 && CLOSER.test(tt)) {
                return;
            }
            if (/formula|equation|highlight/.test(c)) {
                const box = this.document.createElement('div');
                box.className = 'formula';
                box.innerHTML = this.strip(element.cloneNode(true) as Element).innerHTML;
                out.appendChild(box);
                return;
            }
            if (/two-col|grid|columns|row/.test(c) && element.children.length >= 2) {
                const grid = this.document.createElement('div');
                grid.className = 'grid2';
                Array.from(element.children).forEach((ch) => {
                    const box = this.document.createElement('div');
                    box.className = `callout ${this.calloutType(ch)}`;
                    box.innerHTML = this.strip(ch.cloneNode(true) as Element).innerHTML;
                    grid.appendChild(box);
                });
                out.appendChild(grid);
                return;
            }
            if (/box|def|warn|tip|note|info|card|alert|check|callout|panel/.test(c)) {
                const box = this.document.createElement('div');
                box.className = `callout ${this.calloutType(element)}`;
                box.innerHTML = this.strip(element.cloneNode(true) as Element).innerHTML;
                out.appendChild(box);
                return;
            }
            Array.from(element.childNodes).forEach((ch) => this.convert(ch, out));
            return;
        }

        if ((element.textContent || '').trim()) {
            out.appendChild(this.strip(element.cloneNode(true) as Element));
        }
    }

    // --- post-pass decoration -------------------------------------------------

    private decorate(root: Element): void {
        const CLOSER = /good ?luck|you'?ve got|you can do|congratulations|best of luck|happy studying|keep going|stay focused|🎉|🎯|📝\s*$/i;
        const blocks = Array.from(root.children);
        for (let i = blocks.length - 1; i >= Math.max(0, blocks.length - 4); i--) {
            const t = (blocks[i].textContent || '').trim();
            if (t.length < 140 && CLOSER.test(t)) {
                blocks[i].remove();
            } else if (t.length) {
                break;
            }
        }
        Array.from(root.querySelectorAll('span,strong,b,em')).forEach((el) => {
            const t = (el.textContent || '').trim();
            if (/^✓|^✔/.test(t)) {
                el.classList.add('check');
            } else if (/^✗|^✘|^×/.test(t)) {
                el.classList.add('cross');
            } else if (/^⚠/.test(t)) {
                el.classList.add('warnmark');
            }
        });
        const firstH1 = root.querySelector('h1');
        if (firstH1) {
            firstH1.remove();
        }
        Array.from(root.querySelectorAll('h1')).forEach((h) => {
            const h2 = this.document.createElement('h2');
            h2.innerHTML = h.innerHTML;
            h.replaceWith(h2);
        });
        Array.from(root.querySelectorAll('table')).forEach((t) => {
            if (t.parentElement?.classList.contains('table-wrap')) {
                return;
            }
            const w = this.document.createElement('div');
            w.className = 'table-wrap';
            t.replaceWith(w);
            w.appendChild(t);
        });
    }
}
