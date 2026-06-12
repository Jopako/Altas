import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FeatureGroup, GeoJSON, ImageOverlay, MapContainer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const bounds = [
  [0, 0],
  [1000, 1000]
];

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const areaShapeOptions = {
  color: '#00d4ff',
  weight: 3,
  opacity: 0.95,
  fillColor: '#00d4ff',
  fillOpacity: 0.22
};

const selectedShapeOptions = {
  color: '#ffcc00',
  weight: 4,
  opacity: 1,
  fillColor: '#ffcc00',
  fillOpacity: 0.28
};

function getLayerKind(layer) {
  return layer instanceof L.Marker ? 'point' : 'area';
}

function applyDefaultLayerStyle(layer) {
  if (typeof layer.setStyle === 'function') {
    layer.setStyle(areaShapeOptions);
  }
}

function applySelectedLayerStyle(layer) {
  if (typeof layer.setStyle === 'function') {
    layer.setStyle(selectedShapeOptions);
  }
}

function MapSetup({ activeTool, featureGroupRef, selectedLayerRef, selectLayerHandlerRef, setActiveTool }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const drawnItems = featureGroupRef.current;

    const stopLayerClick = (event) => {
      if (event.originalEvent) {
        L.DomEvent.stopPropagation(event.originalEvent);
      }
    };

    const attachLayerSelection = (layer) => {
      layer.off('click');
      layer.on('click', (event) => {
        stopLayerClick(event);
        selectLayerHandlerRef.current(layer);
      });
    };

    const createMappedLayer = (layer) => {
      const poiId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      applyDefaultLayerStyle(layer);
      layer.feature = {
        type: 'Feature',
        properties: {
          id: poiId,
          kind: getLayerKind(layer),
          name: '',
          description: '',
          photoUrl: ''
        }
      };
      drawnItems.addLayer(layer);
      attachLayerSelection(layer);
      selectLayerHandlerRef.current(layer);
    };

    const editControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: false
    });
    map.addControl(editControl);

    const onCreated = (event) => {
      createMappedLayer(event.layer);
      setActiveTool('select');
    };

    const onDeleted = (event) => {
      event.layers.eachLayer((layer) => {
        if (selectedLayerRef.current === layer) {
          selectedLayerRef.current = null;
        }
      });
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.DELETED, onDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(editControl);
    };
  }, [map, featureGroupRef, selectedLayerRef, selectLayerHandlerRef, setActiveTool]);

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const imageBounds = L.latLngBounds(bounds);
    let drawHandler = null;

    map.getContainer().style.cursor = activeTool === 'select' ? '' : 'crosshair';

    const createPointOnClick = (event) => {
      if (!imageBounds.contains(event.latlng)) return;
      map.fire(L.Draw.Event.CREATED, {
        layer: L.marker(event.latlng),
        layerType: 'marker'
      });
    };

    if (activeTool === 'point') {
      map.on('click', createPointOnClick);
    }

    if (activeTool === 'polygon') {
      drawHandler = new L.Draw.Polygon(map, {
        allowIntersection: false,
        showArea: true,
        shapeOptions: areaShapeOptions,
        drawError: {
          color: '#ff6b6b',
          message: 'As linhas da área não podem se cruzar.'
        }
      });
      drawHandler.enable();
    }

    return () => {
      map.off('click', createPointOnClick);
      map.getContainer().style.cursor = '';
      if (drawHandler) {
        drawHandler.disable();
      }
    };
  }, [activeTool, featureGroupRef, map]);

  return null;
}

export default function MapPoiEditor() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [mapData, setMapData] = useState(null);
  const [mapList, setMapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Estados para o formulário de Upload
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Estados para edição do POI
  const [selectedLayerKey, setSelectedLayerKey] = useState(null);
  const [selectedLayerKind, setSelectedLayerKind] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [poiName, setPoiName] = useState("");
  const [poiDescription, setPoiDescription] = useState("");
  const [poiPhotoUrl, setPoiPhotoUrl] = useState("");
  const [uploadingPoiPhoto, setUploadingPoiPhoto] = useState(false);
  
  const featureGroupRef = useRef();
  const selectedLayerRef = useRef(null);
  const selectLayerHandlerRef = useRef(() => {});

  // Verificação de acesso Admin
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'admin') {
      alert("Acesso negado. Esta área é restrita a administradores.");
      navigate('/map-viewer');
      return;
    }
    setUser(decoded);
  }, [navigate]);

  async function fetchMaps() {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/maps");
      setMapList(res.data);
      setMapData(null);
      setError(null);
    } catch (err) {
      console.error("Erro ao listar mapas:", err);
      setError("Erro ao carregar a lista de mapas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      async function loadMap() {
        try {
          setLoading(true);
          const res = await axios.get(`http://localhost:3000/api/maps/${id}`);
          setMapData(res.data);
          setError(null);
        } catch (err) {
          console.error("Erro ao carregar o mapa:", err);
          setError("Não foi possível carregar este mapa.");
        } finally {
          setLoading(false);
        }
      }
      loadMap();
    } else {
      fetchMaps();
    }
  }, [id]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return alert("Selecione uma imagem primeiro!");

    try {
      setUploading(true);
      const token = localStorage.getItem('jwt_token');

      const formData = new FormData();
      formData.append("name", newName || "Mapa sem nome");
      formData.append("image", selectedFile);

      await axios.post("http://localhost:3000/api/maps/upload-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Mapa criado com sucesso!");
      setNewName("");
      setSelectedFile(null);
      fetchMaps();
    } catch (err) {
      console.error("Erro no upload:", err);
      alert(err.response?.data?.error || "Erro ao fazer upload. Você está logado como Admin?");
    } finally {
      setUploading(false);
    }
  }

  async function saveFeatures() {
    try {
      const layers = featureGroupRef.current.toGeoJSON();
      const token = localStorage.getItem('jwt_token');

      await axios.put(
        `http://localhost:3000/api/maps/${id}/features`,
        layers,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Mapa salvo com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar. Verifique se você está logado como Admin.');
    }
  }

  async function handlePoiPhotoUpload(file) {
    if (!file) return;
    const token = localStorage.getItem('jwt_token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingPoiPhoto(true);
      const res = await axios.post('http://localhost:3000/api/maps/upload-poi-photo', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setPoiPhotoUrl(res.data.imageUrl);
    } catch {
      alert('Erro ao enviar foto do ponto.');
    } finally {
      setUploadingPoiPhoto(false);
    }
  }

  function selectLayer(layer) {
    if (selectedLayerRef.current && selectedLayerRef.current !== layer) {
      applyDefaultLayerStyle(selectedLayerRef.current);
    }
    selectedLayerRef.current = layer;
    applySelectedLayerStyle(layer);
    setSelectedLayerKey(layer.feature?.properties?.id || `layer-${L.stamp(layer)}`);
    setSelectedLayerKind(getLayerKind(layer));
    const props = layer.feature?.properties || {};
    setPoiName(props.name || '');
    setPoiDescription(props.description || '');
    setPoiPhotoUrl(props.photoUrl || '');
  }

  useEffect(() => {
    selectLayerHandlerRef.current = selectLayer;
  });

  function clearPoiForm() {
    if (selectedLayerRef.current) {
      applyDefaultLayerStyle(selectedLayerRef.current);
    }
    selectedLayerRef.current = null;
    setSelectedLayerKey(null);
    setSelectedLayerKind(null);
    setPoiName('');
    setPoiDescription('');
    setPoiPhotoUrl('');
  }

  function applyPoiChanges() {
    const layer = selectedLayerRef.current;
    if (!layer) return;
    const poiId = layer.feature?.properties?.id || `poi-${Date.now()}`;
    layer.feature = {
      type: 'Feature',
      properties: {
        ...(layer.feature?.properties || {}),
        id: poiId,
        kind: getLayerKind(layer),
        name: poiName,
        description: poiDescription,
        photoUrl: poiPhotoUrl
      }
    };
    clearPoiForm();
  }

  function handleLogout() {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  }


  function selectMappingTool(tool) {
    clearPoiForm();
    setActiveTool(tool);
  }

  function getToolButtonStyle(tool) {
    const isActive = activeTool === tool;
    return {
      padding: '9px 12px',
      background: isActive ? 'linear-gradient(135deg, #00d4ff, #5577ff)' : 'rgba(255,255,255,0.07)',
      border: isActive ? '1px solid rgba(0,212,255,0.85)' : '1px solid rgba(255,255,255,0.12)',
      color: '#fff',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '12px',
      boxShadow: isActive ? '0 8px 20px rgba(0, 212, 255, 0.24)' : 'none'
    };
  }

  const activeToolHint = {
    select: 'Selecione uma área ou ponto já criado para editar.',
    point: 'Ponto específico: clique uma vez no local exato da planta.',
    polygon: 'Selecionar local: clique nos cantos da área seguindo as linhas da planta e finalize clicando no primeiro ponto.'
  }[activeTool];

  if (loading) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: '#e0e0f0', fontFamily: 'sans-serif' }}>Carregando...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', gap: '20px' }}>
        <h2 style={{ color: '#ff6b6b' }}>Ops! {error}</h2>
        <button 
          onClick={() => navigate('/map-editor')}
          style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Voltar para a Lista
        </button>
      </div>
    );
  }

  // TELA 1: LISTAGEM + FORMULÁRIO DE UPLOAD
  if (!id) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a1a', color: '#e0e0f0', fontFamily: "'Inter', sans-serif" }}>
        
        {/* BARRA LATERAL: Formulário de Upload */}
        <div style={{ width: '320px', padding: '30px', borderRight: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(17, 17, 34, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', color: '#e0e0f0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>➕ Criar Novo Mapa</h3>
          
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#888899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Nome do Mapa:
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="Ex: Bloco A, Campus..." 
                style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#e0e0f0', outline: 'none' }}
                required
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#888899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Imagem do Mapa:
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                style={{ padding: '8px 0', color: '#aaa', cursor: 'pointer' }}
                required
              />
            </label>

            <button 
              type="submit" 
              disabled={uploading}
              style={{ padding: '12px', background: 'linear-gradient(135deg, #4466ff 0%, #aa55ff 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(85, 119, 255, 0.3)' }}
            >
              {uploading ? "Enviando..." : "Fazer Upload"}
            </button>
          </form>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => navigate('/map-viewer')}
              style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e0e0f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              👁 Ir para o Visualizador
            </button>
            <button 
              onClick={handleLogout}
              style={{ padding: '10px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff6b6b', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* ÁREA PRINCIPAL: Grid de Mapas */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Painel do Administrador</h2>
            <p style={{ margin: '4px 0 0 0', color: '#888899', fontSize: '14px' }}>Selecione um mapa abaixo para editar e posicionar pontos de interesse:</p>
          </div>

          {(() => {
            const myMaps = mapList.filter(m => user && m.creatorEmail === user.email);
            return myMaps.length === 0 ? (
              <p style={{ marginTop: '20px', color: '#888899', fontStyle: 'italic' }}>Você ainda não criou nenhum mapa. Use o formulário ao lado para fazer o upload do primeiro!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                {myMaps.map((map) => (
                  <div
                    key={map.id}
                    onClick={() => navigate(`/map-editor/${map.id}`)}
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: 'rgba(17, 17, 34, 0.6)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      transition: 'transform 0.2s, border-color 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = '#5577ff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <img
                      src={`http://localhost:3000${map.imageUrl}`}
                      alt={map.name}
                      style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                    />
                    <h4 style={{ margin: '0 0 4px 0', color: '#e0e0f0', fontSize: '16px', fontWeight: '600' }}>{map.name}</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#888899', fontSize: '12px' }}>Criado por: {map.creatorName || 'Admin'}</p>
                    <small style={{ color: '#5577ff', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>ID: {map.id}</small>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

      </div>
    );
  }

  // TELA 2: EDITOR DO LEAFLET — Layout lado a lado
  return (
    <div style={{ background: '#0a0a1a', height: '100vh', display: 'flex', flexDirection: 'column', color: '#e0e0f0', fontFamily: "'Inter', sans-serif" }}>
      {/* Topbar */}
      <div style={{ padding: '12px 24px', background: 'rgba(17, 17, 34, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/map-editor')}
          style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e0e0f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
        >
          ⬅ Lista de Mapas
        </button>
        <button
          onClick={saveFeatures}
          style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #28a745, #20c85a)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(40,167,69,0.3)' }}
        >
          💾 Salvar Alterações
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#888899' }}>
          Editando: <strong style={{ color: '#e0e0f0' }}>{mapData?.name}</strong>
        </span>
      </div>

      {/* Corpo: Mapa (65%) + Painel POI (35%) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* MAPA */}
        <div style={{ flex: '0 0 65%', position: 'relative' }}>
          <MapContainer
            crs={L.CRS.Simple}
            bounds={bounds}
            maxBounds={bounds}
            maxBoundsViscosity={0.8}
            style={{ height: '100%', width: '100%' }}
          >
            <ImageOverlay
              url={`http://localhost:3000${mapData?.imageUrl}`}
              bounds={bounds}
            />
            <FeatureGroup ref={featureGroupRef}>
              <GeoJSON key={id} data={mapData?.features} onEachFeature={(_feature, layer) => {
                applyDefaultLayerStyle(layer);
                layer.on('click', (event) => {
                  if (event.originalEvent) {
                    L.DomEvent.stopPropagation(event.originalEvent);
                  }
                  selectLayer(layer);
                });
              }} />
            </FeatureGroup>
            <MapSetup
              activeTool={activeTool}
              featureGroupRef={featureGroupRef}
              selectedLayerRef={selectedLayerRef}
              selectLayerHandlerRef={selectLayerHandlerRef}
              setActiveTool={setActiveTool}
            />
          </MapContainer>
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, width: 'min(420px, calc(100% - 32px))', background: 'rgba(10,10,26,0.86)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', boxShadow: '0 18px 45px rgba(0,0,0,0.32)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#e0e0f0' }}>Ferramentas de mapeamento</strong>
              <span style={{ fontSize: '11px', color: '#8899aa' }}>GeoJSON</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button type="button" onClick={() => selectMappingTool('select')} style={getToolButtonStyle('select')}>Selecionar</button>
              <button type="button" onClick={() => selectMappingTool('point')} style={getToolButtonStyle('point')}>Ponto específico</button>
              <button type="button" onClick={() => selectMappingTool('polygon')} style={getToolButtonStyle('polygon')}>Selecionar local</button>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '11px', lineHeight: 1.45, color: '#aab0c0' }}>{activeToolHint}</p>
          </div>
          {!selectedLayerKey && (
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(17,17,34,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 18px', fontSize: '12px', color: '#888899', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              {activeToolHint}
            </div>
          )}
        </div>

        {/* PAINEL POI */}
        <div style={{ flex: '0 0 35%', background: 'rgba(17,17,34,0.95)', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {selectedLayerKey ? (selectedLayerKind === 'area' ? '✏️ Editar Área Mapeada' : '✏️ Editar Ponto de Interesse') : '📍 Mapeamento'}
          </h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '12px', color: '#888899', lineHeight: '1.5' }}>
            {selectedLayerKey
              ? 'Preencha os dados abaixo e clique em "Confirmar Mapeamento".'
              : 'Use as ferramentas no mapa para criar um ponto ou contornar uma área.'}
          </p>

          {selectedLayerKey ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#888899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nome do Mapeamento
                <input
                  type="text"
                  value={poiName}
                  onChange={(e) => setPoiName(e.target.value)}
                  placeholder="Ex: Secretaria, Lab de Informática..."
                  style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e0e0f0', outline: 'none', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#888899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Descrição
                <textarea
                  value={poiDescription}
                  onChange={(e) => setPoiDescription(e.target.value)}
                  placeholder="Descreva o local, horário de funcionamento, etc."
                  rows={4}
                  style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e0e0f0', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#888899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Foto do Local
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePoiPhotoUpload(e.target.files[0])}
                  style={{ color: '#aaa', cursor: 'pointer', fontSize: '12px' }}
                />
              </label>

              {uploadingPoiPhoto && <p style={{ color: '#5577ff', fontSize: '12px', margin: 0 }}>⏳ Enviando foto...</p>}

              {poiPhotoUrl && (
                <div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888899', fontWeight: '600', textTransform: 'uppercase' }}>Foto Atual</p>
                  <img
                    src={`http://localhost:3000${poiPhotoUrl}`}
                    alt="foto ponto"
                    style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '160px', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
              )}

              <button
                onClick={applyPoiChanges}
                style={{ padding: '12px', background: 'linear-gradient(135deg, #4466ff, #aa55ff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(85,119,255,0.3)' }}
              >
                ✅ Confirmar Mapeamento
              </button>
              <button
                onClick={clearPoiForm}
                style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888899', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.35 }}>
              <span style={{ fontSize: '52px' }}>📍</span>
              <p style={{ margin: 0, fontSize: '13px', color: '#888899', textAlign: 'center' }}>Nenhum ponto selecionado</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
