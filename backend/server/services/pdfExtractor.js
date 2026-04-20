import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  '../../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url,
).href

export async function extractPaths(pdfPath) {
  try {
    const doc = await pdfjsLib.getDocument(pdfPath).promise
    const page = await doc.getPage(1)
    const ops = await page.getOperatorList()
    const { OPS } = pdfjsLib
    const features = []

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] !== OPS.constructPath) continue

      const args = ops.argsArray[i]
      const coords = args[1]?.[0]
      if (!coords || coords.length < 4) continue

      const points = []
      for (let j = 0; j < coords.length; j += 3) {
        const x = coords[j + 1]
        const y = coords[j + 2]
        if (x !== undefined && y !== undefined) {
          points.push([x, y])
        }
      }

      if (points.length < 2) continue

      const first = points[0]
      const last = points[points.length - 1]
      const closes = first[0] === last[0] && first[1] === last[1]

      if (closes && points.length >= 4) {
        features.push({
          type: 'Feature',
          properties: { type: 'room', level: 0 },
          geometry: { type: 'Polygon', coordinates: [points] },
        })
      } else {
        features.push({
          type: 'Feature',
          properties: { type: 'path', level: 0 },
          geometry: { type: 'LineString', coordinates: points },
        })
      }
    }

    console.log(`✅ Extraídas ${features.length} features do PDF.`)
    return { type: 'FeatureCollection', features }
  } catch (err) {
    console.error('Erro no processamento do PDF:', err)
    throw err
  }
}

