import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '')
    const message = typeof body === 'string' ? body : body?.error
    throw new Error(message || `HTTP ${response.status}`)
  }

  if (!isJson) {
    const text = await response.text().catch(() => '')
    throw new Error(`Resposta não-JSON em ${url}: ${text.slice(0, 120)}`)
  }

  return response.json()
}

function LeafletMap({ geojson, focusedFeature }) {
  const mapDivRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!mapDivRef.current) return

    const map = L.map(mapDivRef.current, {
      crs: L.CRS.Simple,
      minZoom: -5,
      maxZoom: 5,
      zoomSnap: 0.1,
      zoomControl: false,
    })

    mapRef.current = map
    L.control.zoom({ position: 'topright' }).addTo(map)
    map.setView([400, 400], -1)

    return () => {
      layerRef.current = null
      mapRef.current = null
      map.remove()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (layerRef.current) {
      layerRef.current.remove()
      layerRef.current = null
    }

    if (!geojson) return

    const geoJsonLayer = L.geoJSON(geojson, {
      style(feature) {
        const type = feature?.properties?.type
        if (type === 'room') {
          return {
            fillColor: '#4466ffAA',
            weight: 2,
            opacity: 0.8,
            color: '#5577ff',
            fillOpacity: 0.4,
          }
        }
        return {
          color: '#ffffff33',
          weight: 1,
          opacity: 0.5,
        }
      },
      onEachFeature(feature, layer) {
        const props = feature?.properties || {}
        layer.bindPopup(`
          <div class="popup-content">
            <strong>${props.id || 'Sem ID'}</strong><br/>
            Tipo: ${props.type || 'desconhecido'}<br/>
            Andar: ${props.level ?? '-'}
          </div>
        `)

        layer.on('mouseover', function () {
          this.setStyle({ fillOpacity: 0.8, weight: 3 })
        })
        layer.on('mouseout', function () {
          geoJsonLayer.resetStyle(this)
        })
      },
    }).addTo(map)

    layerRef.current = geoJsonLayer

    const bounds = geoJsonLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [geojson])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusedFeature) return

    const bounds = L.geoJSON(focusedFeature).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 1 })
    }
  }, [focusedFeature])

  return <div id="map" ref={mapDivRef} />
}

export default function PlantasPage() {
  const fileInputRef = useRef(null)

  const [libraryFiles, setLibraryFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dropActive, setDropActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [geojsonRaw, setGeojsonRaw] = useState(null)
  const [activeLevel, setActiveLevel] = useState(0)
  const [focusedFeature, setFocusedFeature] = useState(null)

  const geojson = useMemo(() => {
    if (!geojsonRaw) return null
    const features = (geojsonRaw.features || []).filter((feature) => {
      const level = feature?.properties?.level
      if (level === undefined || level === null) return true
      return Number(level) === Number(activeLevel)
    })
    return { ...geojsonRaw, features }
  }, [geojsonRaw, activeLevel])

  const rooms = useMemo(() => {
    if (!geojson) return []
    return (geojson.features || []).filter((feature) => feature?.properties?.type === 'room')
  }, [geojson])

  async function loadLibrary() {
    try {
      setErrorMsg('')
      const files = await fetchJson('/api/library')
      setLibraryFiles(Array.isArray(files) ? files : [])

      const target =
        (Array.isArray(files) && files.find((f) => String(f).toLowerCase().includes('terreo'))) ||
        (Array.isArray(files) ? files[0] : null)

      if (target) {
        await loadLocalPDF(target)
      }
    } catch (err) {
      console.error('Erro ao carregar biblioteca:', err)
      setLibraryFiles([])
      setErrorMsg(err?.message || 'Erro ao carregar biblioteca.')
    }
  }

  async function loadLocalPDF(fileName) {
    setLoading(true)
    setSelectedFile(fileName)
    setFocusedFeature(null)
    setErrorMsg('')

    try {
      const data = await fetchJson(`/api/pdf/load-local?file=${encodeURIComponent(fileName)}`)
      setGeojsonRaw(data)
    } catch (err) {
      console.error('Erro ao carregar PDF local:', err)
      setErrorMsg(err?.message || 'Erro ao carregar PDF.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(file) {
    if (!file) return
    if (file.type !== 'application/pdf') return

    setLoading(true)
    setSelectedFile(file.name)
    setFocusedFeature(null)
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const data = await fetchJson('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      })
      setGeojsonRaw(data)
    } catch (err) {
      console.error('Erro no upload:', err)
      const msg = err?.message || 'Erro ao processar o PDF. Tente outro arquivo.'
      setErrorMsg(msg)
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLibrary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div id="app">
      <aside id="sidebar">
        <header>
          <div className="logo">
            <span className="altas-text">ALTAS</span>
          </div>
          <p className="subtitle">Indoor Mapping System</p>
        </header>

        <section id="library-section">
          <h3>Biblioteca do IFC</h3>
          <div id="library-list" className="library-list">
            {libraryFiles.length === 0 ? (
              <p className="status">{loading ? 'Carregando biblioteca...' : 'Nenhum PDF encontrado.'}</p>
            ) : (
              libraryFiles.map((file) => (
                <div
                  key={file}
                  className="lib-item"
                  role="button"
                  tabIndex={0}
                  aria-label={`Carregar ${file}`}
                  onClick={() => loadLocalPDF(file)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') loadLocalPDF(file)
                  }}
                  style={
                    selectedFile === file
                      ? { background: '#5577ff22', borderColor: '#5577ff' }
                      : undefined
                  }
                >
                  <span className="icon">📄</span>
                  <span className="name">{file}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="upload-section">
          <h3>Upload Manual</h3>
          <div
            id="dropzone"
            className={`dropzone ${dropActive ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDropActive(true)
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDropActive(false)
              const file = e.dataTransfer.files?.[0]
              handleUpload(file)
            }}
          >
            <div className={`drop-content ${loading ? 'hidden' : ''}`}>
              <span className="icon">📄</span>
              <p>Arraste seu PDF aqui</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
            </div>

            <div id="upload-progress" className={loading ? '' : 'hidden'}>
              <div className="progress-bar">
                <div id="progress-indicator" />
              </div>
              <p className="status">Processando PDF...</p>
            </div>
          </div>
        </section>

        <section id="features-section">
          <h3>Salas & Áreas</h3>
          <div id="feature-list" className="feature-list">
            {errorMsg ? <p className="empty-msg">{errorMsg}</p> : null}
            {rooms.length === 0 ? (
              <p className="empty-msg">Nenhuma área detectada.</p>
            ) : (
              rooms.map((room, index) => (
                <div
                  key={`${room?.id || 'room'}-${index}`}
                  className="feature-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => setFocusedFeature(room)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setFocusedFeature(room)
                  }}
                >
                  <div className="feature-info">
                    <span className="id">#{index + 1}</span>
                    <span className="type">ESPAÇO</span>
                  </div>
                  <div className="feature-name">Área Detectada {index + 1}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <footer id="footer">
          <p>IFC — Câmpus Videira</p>
        </footer>
      </aside>

      <main id="map-container">
        <LeafletMap geojson={geojson} focusedFeature={focusedFeature} />

        <div id="map-controls">
          <div id="level-switcher">
            <span className="label">ANDAR</span>
            {[0, 1, 2].map((level) => (
              <button
                key={level}
                type="button"
                className={`level-btn ${Number(activeLevel) === level ? 'active' : ''}`}
                onClick={() => setActiveLevel(level)}
              >
                {level === 0 ? 'T' : level}
              </button>
            ))}
          </div>
        </div>

        <div id="loading-overlay" className={loading ? '' : 'hidden'}>
          <div className="progress-bar">
            <div id="progress-indicator" />
          </div>
          <p>Processando PDF...</p>
        </div>
      </main>
    </div>
  )
}
