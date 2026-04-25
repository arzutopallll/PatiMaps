import fetch from 'node-fetch';
import Papa from 'papaparse';

async function test() {
  const res = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQefia9vVQVX8wtyB2OJPu21dNn3onLfOK48dkumqlW0lf8qiX2Q_hucFkLmcluomkGLYD0CeRsJxQ5/pub?output=csv");
  const text = await res.text();
  Papa.parse(text, {
    skipEmptyLines: true,
    complete: async (results) => {
        const rows = results.data as string[][];
        const dataRows = rows.slice(2);
        
        dataRows.forEach((row, i) => {
            const name = row[0]?.trim() || '';
            let media = row[16]?.trim() || '';
            if (!media && row.length > 0) {
                const lastCol = row[row.length - 1];
                if (lastCol && lastCol.trim().startsWith('http')) {
                    media = lastCol.trim();
                }
            }
            if (name !== '') {
                // console.log(`Item: ${name} | Media: ${media ? 'OK' : 'MISSING'}`);
                if (name.includes('Beykoz') || name.includes('çekmece')) {
                     console.log(`Found: ${name} Media: ${media}`);
                }
            }
        });
    }
  });
}
test();
