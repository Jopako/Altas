import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { FeatureGroup, GeoJSON, ImageOverlay, MapContainer } from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const bounds = [
  [0, 0],
  [1000, 1000]
];

export default function MapEditor() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [mapData, setMapData] = useState(null);
  const [mapList, setMapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para o formulário de Upload
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const featureGroupRef = useRef();

  // Função isolada para carregar a lista de mapas (para podermos atualizar após o upload)
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

  // Função para lidar com o envio do novo mapa (Upload)
  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return alert("Selecione uma imagem primeiro!");

    try {
      setUploading(true);
      const token = localStorage.getItem('jwt_token');

      // Como vamos enviar um arquivo, precisamos usar FormData
      const formData = new FormData();
      formData.append("name", newName || "Mapa sem nome");
      formData.append("image", selectedFile);

      await axios.post("http://localhost:3000/api/maps/upload-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" // Informa ao axios que é um upload de arquivo
        }
      });

      alert("Mapa criado com sucesso!");
      setNewName("");
      setSelectedFile(null);
      
      // Recarrega a lista de mapas para o novo aparecer na tela
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
      const token = localStorage.getItem('token');

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

  function onMapCreated(map) {
    const drawnItems = featureGroupRef.current;
    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        rectangle: true,
        polygon: true,
        marker: true,
        polyline: false,
        circle: false,
        circlemarker: false
      }
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      const name = prompt('Nome do local:');
      const description = prompt('Descrição:');

      layer.feature = {
        type: 'Feature',
        properties: { name, description }
      };

      drawnItems.addLayer(layer);
    });
  }

  if (loading) {
    return <h1 style={{ padding: '20px' }}>Carregando...</h1>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Ops! {error}</h2>
        <button onClick={() => navigate('/map-editor')}>Voltar para a Lista</button>
      </div>
    );
  }

  // TELA 1: LISTAGEM + FORMULÁRIO DE UPLOAD
  if (!id) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        
        {/* BARRA LATERAL: Formulário de Upload */}
        <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #ccc', background: '#f5f5f5' }}>
          <h3>➕ Criar Novo Mapa</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Nome do Mapa:
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="Ex: Bloco A, Campus..." 
                style={{ padding: '6px' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Imagem do Mapa:
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                style={{ padding: '4px 0' }}
              />
            </label>

            <button 
              type="submit" 
              disabled={uploading}
              style={{ padding: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {uploading ? "Enviando..." : "Fazer Upload"}
            </button>
            <button onClick={handleLogout}>Sair</button>
          </form>
        </div>

        {/* ÁREA PRINCIPAL: Grid de Mapas */}
        <div style={{ flex: 1, padding: '20px' }}>
          <h2>Selecione um mapa para editar:</h2>
          {mapList.length === 0 ? (
            <p style={{ marginTop: '20px', color: '#666' }}>Nenhum mapa encontrado. Use o formulário ao lado para enviar o primeiro!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              {mapList.map((map) => (
                <div 
                  key={map.id} 
                  onClick={() => navigate(`/map-editor/${map.id}`)}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '15px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: '#f9f9f9',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#eef'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f9f9f9'}
                >
                  <img 
                    src={`http://localhost:3000${map.imageUrl}`} 
                    alt={map.name} 
                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} 
                  />
                  <h4 style={{ margin: '10px 0 0 0' }}>{map.name}</h4>
                  <small style={{ color: '#777' }}>ID: {map.id}</small>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  function handleLogout() {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    }

  // TELA 2: EDITOR DO LEAFLET (Mantido igual)
  return (
    <div>
      <div style={{ padding: '10px', background: '#f0f0f0', display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('/map-editor')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ⬅ Voltar para a Lista
        </button>
        <button onClick={saveFeatures} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          💾 Salvar Alterações
        </button>
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontWeight: 'bold' }}>Editando: {mapData.name}</span>
      </div>

      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        style={{ height: '85vh' }}
        whenCreated={onMapCreated}
      >
        <ImageOverlay
          url={`http://localhost:3000${mapData.imageUrl}`}
          bounds={bounds}
        />

        <FeatureGroup ref={featureGroupRef}>
          <GeoJSON key={id} data={mapData.features} />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}