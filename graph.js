/**
 * @extension
 * @title Graphs
 * @author Flarom
 * @version 1.0.0
 * @updateLink https://github.com/flarom/cohesion-extensions/blob/main/graph.js
 * @documentationLink https://github.com/flarom/cohesion-extensions/wiki/Graphs
 * @description Implementation of pie, bars and line charts for Cohesion.
 * @icon bar_chart
 * @color var(--text-color)
 */

CommandRegistry.register("graph", {
    description: "Pie, bar, or line chart",
    icon: "bar_chart",
    exec: function (arg) {
        selectFromMenu(["pizza", "bars", "lines"], function (selectedIndex) {
            switch (selectedIndex) {
                case 0: insertSnippet("> [!graph:pie]\n> ${1:Label 1}, ${2:numeric value}\n> ${3:Label 2}, ${4:numeric value}"); break;
                case 1: insertSnippet("> [!graph:bar]\n> ${1:Label 1}, ${2:numeric value}\n> ${3:Label 2}, ${4:numeric value}"); break;
                case 2: insertSnippet("> [!graph:line]\n> ${1:Label 1}, ${2:Label 2}\n> ${3:numeric value}, ${4:numeric value}"); break;
            }
        });
    }
});

BlockRegistry.register("GRAPH", {
    allowHtml: true,
    render: function (title, contentText) {
        let type = "pie";
        let actualTitle = title || "";

        if (title) {
            const typeMatch = title.match(/^\s*(bars|bar|pie|pizza|lines|line)\s*$/i);

            if (typeMatch) {
                type = typeMatch[1].toLowerCase();
                actualTitle = "";
            } else {
                const colonType = title.match(/^(.*?):\s*(bars|bar|pie|pizza|lines|line)\s*$/i);
                if (colonType) {
                    actualTitle = colonType[1].trim();
                    type = colonType[2].toLowerCase();
                }
            }
        }

        const lines = contentText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        const textColor = "var(--title-color, #000)";
        const borderColor = "var(--border-light-color, #ccc";

        const colors = ["var(--quote-blue  , #3498db)", "var(--quote-purple, #9b59b6)", "var(--quote-red   , #e74c3c)", "var(--quote-yellow, #f1c40f)", "var(--quote-green , #2ecc71)"];

        const colorsBg = ["var(--quote-blue-bg  , transparent)", "var(--quote-purple-bg, transparent)", "var(--quote-red-bg   , transparent)", "var(--quote-yellow-bg, transparent)", "var(--quote-green-bg , transparent)"];

        // SVG parameters
        const width = 640,
            height = 320,
            margin = 40;
        let svg = "";

        if (type === "bar" || type === "bars") {
            // === BAR CHART ===
            // Parse lines: label,value
            let hasPercent = false;
            const data = lines
                .map((line) => {
                    const m = line.match(/^(.+?)[,;:\t ]+([0-9.]+)\s*(%)?$/);
                    if (m) {
                        if (m[3] === "%") hasPercent = true;
                        return { label: m[1], value: parseFloat(m[2]) };
                    }
                    return null;
                })
                .filter(Boolean);
            if (data.length === 0) return "";

            const barCount = data.length;
            const maxValue = Math.max(...data.map((d) => d.value));
            const barThickness = Math.floor(((width - 2 * margin) / barCount) * 0.6);

            svg += `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

            data.forEach((d, i) => {
                const color = colors[i % colors.length];
                const colorBg = colorsBg[i % colorsBg.length];
                const x = margin + i * ((width - 2 * margin) / barCount);
                const barH = Math.max(2, (d.value / maxValue) * (height - 2 * margin));
                const y = height - margin - barH;
                svg += `<rect x="${x}" y="${y}" width="${barThickness}" height="${barH}" fill="${colorBg}" stroke="${color}" stroke-width="1" />`;
                svg += `<text x="${x + barThickness / 2}" y="${height - margin + 16}" font-size="13" text-anchor="middle" fill="${textColor}">${d.label}</text>`;
                svg += `<text x="${x + barThickness / 2}" y="${y - 6}" font-size="12" text-anchor="middle" fill="${textColor}">${d.value}${hasPercent ? "%" : ""}</text>`;
            });

            svg += `</svg>`;
        } else if (type === "pie" || type === "pizza") {
            // === PIE CHART ===
            let hasPercent = false;
            const data = lines
                .map((line) => {
                    const m = line.match(/^(.+?)[,;:\t ]+([0-9.]+)\s*(%)?$/);
                    if (m) {
                        if (m[3] === "%") hasPercent = true;
                        return { label: m[1], value: parseFloat(m[2]) };
                    }
                    return null;
                })
                .filter(Boolean);
            if (data.length === 0) return "";

            const cx = width / 2,
                cy = height / 2,
                r = Math.min(width, height) / 2 - margin;
            const total = data.reduce((sum, d) => sum + d.value, 0);
            let angle = 0;
            svg += `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

            data.forEach((d, i) => {
                const color = colors[i % colors.length];
                const colorBg = colorsBg[i % colorsBg.length];
                const sliceAngle = (d.value / total) * 2 * Math.PI;
                const x1 = cx + r * Math.cos(angle);
                const y1 = cy + r * Math.sin(angle);
                angle += sliceAngle;
                const x2 = cx + r * Math.cos(angle);
                const y2 = cy + r * Math.sin(angle);
                const largeArc = sliceAngle > Math.PI ? 1 : 0;
                const path = [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`, "Z"].join(" ");
                svg += `<path d="${path}" fill="${colorBg}" stroke="${color}" stroke-width="1"/>`;
            });

            // Labels
            angle = 0;
            data.forEach((d, i) => {
                const sliceAngle = (d.value / total) * 2 * Math.PI;
                const midAngle = angle + sliceAngle / 2;
                const lx = cx + r * 0.6 * Math.cos(midAngle);
                const ly = cy + r * 0.6 * Math.sin(midAngle);
                svg += `<text x="${lx}" y="${ly}" font-size="13" text-anchor="middle" fill="${textColor}">${d.label} (${d.value}${hasPercent ? "%" : ""})</text>`;
                angle += sliceAngle;
            });

            svg += `</svg>`;
        } else if (type === "line" || type === "lines") {
            // === LINE CHART ===
            if (lines.length < 2) return "";
            const seriesNames = lines[0]
                .split(/[,;|\t]+/)
                .map((s) => s.trim())
                .filter(Boolean);
            const seriesCount = seriesNames.length;

            const rows = lines
                .slice(1)
                .map((l) =>
                    l
                        .split(/[,;|\t]+/)
                        .map((v) => v.trim())
                        .filter(Boolean)
                        .map(Number)
                )
                .filter((r) => r.length === seriesCount);

            if (rows.length === 0) return "";

            const points = rows.map((values, i) => ({
                x: i + 1,
                values,
            }));

            const xMin = 1;
            const xMax = points.length;
            const yMin = 0;
            const yMax = Math.max(...points.flatMap((p) => p.values));

            function scaleX(x) {
                return margin + ((x - xMin) / (xMax - xMin)) * (width - 2 * margin);
            }
            function scaleY(y) {
                return height - margin - ((y - yMin) / (yMax - yMin)) * (height - 2 * margin);
            }

            svg += `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

            // Horizontal rules
            for (let i = 0; i <= 5; i++) {
                const yVal = yMin + (i / 5) * (yMax - yMin);
                const y = scaleY(yVal);
                if (yVal != 0) svg += `<line x1="${margin}" y1="${y}" x2="${width - margin}" y2="${y}" stroke="${borderColor}"/>`;
                svg += `<text x="${margin - 5}" y="${y + 4}" font-size="12" text-anchor="end" fill="${textColor}">${yVal}</text>`;
            }

            // Axys
            svg += `<line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="${textColor}" />`;
            svg += `<line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="${textColor}" />`;

            // Lines
            seriesNames.forEach((s, si) => {
                const color = colors[si % colors.length];
                let path = "";
                points.forEach((p, pi) => {
                    const x = scaleX(p.x);
                    const y = scaleY(p.values[si]);
                    path += (pi === 0 ? "M" : "L") + x + " " + y + " ";
                });
                svg += `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"/>`;

                points.forEach((p) => {
                    const x = scaleX(p.x);
                    const y = scaleY(p.values[si]);
                    svg += `<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
                });

                svg += `<text x="${width - margin + 10}" y="${margin + si * 16}" font-size="12" fill="${color}">● ${s}</text>`;
            });

            svg += `</svg>`;
        }

        return `<div class="graph-block" style="overflow:auto;">
${actualTitle ? `<div class="graph-title" style="color:${textColor}">${actualTitle}</div>` : ""}
${svg}
</div>
<style>
.graph-title { font-weight:bold; font-size:1.1em; margin-bottom:0.5em; }
</style>`;
    },
});