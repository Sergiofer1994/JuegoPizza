'use strict';

const PizzaRenderer = (() => {
    const NS = 'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
    }

    function drawBase(size, added) {
        const cx = size / 2, cy = size / 2, r = size / 2 - 5;
        const svg = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` });

        // Sombra
        svg.appendChild(svgEl('ellipse', { cx, cy: size - 7, rx: r * 0.82, ry: 10, fill: 'rgba(0,0,0,0.14)' }));
        // Borde masa
        svg.appendChild(svgEl('circle', { cx, cy, r, fill: '#D4A574' }));
        svg.appendChild(svgEl('circle', { cx, cy, r: r - 10, fill: '#C49060' }));
        // Base
        svg.appendChild(svgEl('circle', { cx, cy, r: r - 13, fill: '#F5DEB3' }));
        // Textura borde
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const bx = cx + Math.cos(a) * (r - 4), by = cy + Math.sin(a) * (r - 4);
            svg.appendChild(svgEl('ellipse', { cx: bx, cy: by, rx: 7, ry: 5, fill: '#C49060', opacity: 0.5, transform: `rotate(${a * 180 / Math.PI},${bx},${by})` }));
        }
        // Salsa
        if (added.some(i => i.id === 'tomato')) {
            svg.appendChild(svgEl('circle', { cx, cy, r: r - 16, fill: '#C0392B', opacity: 0.75 }));
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 + 0.3, dr = (r - 30) * 0.55;
                svg.appendChild(svgEl('ellipse', { cx: cx + Math.cos(a) * dr, cy: cy + Math.sin(a) * dr, rx: 14, ry: 10, fill: '#E74C3C', opacity: 0.4 }));
            }
        }
        // Queso
        if (added.some(i => i.id === 'cheese')) {
            svg.appendChild(svgEl('circle', { cx, cy, r: r - 20, fill: '#F9C74F', opacity: 0.82 }));
            for (let j = 0; j < 7; j++) {
                const a = (j / 7) * Math.PI * 2, dr = (r - 38) * 0.7;
                svg.appendChild(svgEl('ellipse', { cx: cx + Math.cos(a) * dr, cy: cy + Math.sin(a) * dr, rx: 13, ry: 10, fill: '#FFD166' }));
            }
        }
        return svg;
    }

    function addCutLines(svg, size) {
        const c = size / 2;
        [[c, 5, c, size - 5], [5, c, size - 5, c], [20, 20, size - 20, size - 20], [20, size - 20, size - 20, 20]].forEach(([x1, y1, x2, y2]) => {
            svg.appendChild(svgEl('line', { x1, y1, x2, y2, stroke: 'rgba(0,0,0,0.22)', 'stroke-width': 2, 'stroke-dasharray': '8,5' }));
        });
    }

    function randomToppingPos(size) {
        const cx = size / 2, cy = size / 2;
        const r = 8 + Math.random() * (size / 2 - 36);
        const a = Math.random() * Math.PI * 2;
        return { x: Math.round(cx + Math.cos(a) * r - 14), y: Math.round(cy + Math.sin(a) * r - 14) };
    }

    function render(ws, added, positions, cuts = false) {
        const size = ws.offsetWidth || 220;
        const badge = ws.querySelector('#chef-badge');
        ws.innerHTML = '';
        if (badge) ws.appendChild(badge);
        const svg = drawBase(size, added);
        if (cuts) addCutLines(svg, size);
        ws.insertBefore(svg, ws.firstChild);
        positions.forEach(tp => {
            const el = document.createElement('div');
            el.className = 'topping-on-pizza';
            el.textContent = tp.emoji;
            el.style.cssText = `left:${tp.x}px;top:${tp.y}px;font-size:${Math.max(16, size * 0.09)}px;`;
            ws.appendChild(el);
        });
    }

    return { render, randomToppingPos };
})();