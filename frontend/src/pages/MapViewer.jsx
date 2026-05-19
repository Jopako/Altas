import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importamos o useNavigate
import axios from 'axios';

import {
  MapContainer,
  ImageOverlay,
  GeoJSON
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css'; // Garantindo que os estilos do Leaflet carreguem

const bounds = [
  [0, 0],
  [1000, 1000]
];

export default function MapViewer() {
  const { id } = useParams(); // Pega o ID da URL do navegador (ex: /map-viewer/123)
  const navigate = useNavigate(); // Para atualizar a URL ao escolher um mapa
  
  const [mapData, setMapData] = useState(null);
  const [mapList, setMapList] = useState([]); // Guarda a lista de mapas caso não tenha ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      // Se tem ID na URL, busca o mapa específico
      async function loadMap() {
        try {
          setLoading(true);
          const res = await axios.get(`http://localhost:3000/api/maps/${id}`);
          setMapData(res.data);
          setError(null);
        } catch (err) {
          console.error("Erro ao carregar o mapa:", err);
          setError("Não foi possível abrir este mapa.");
        } finally {
          setLoading(false);
        }
      }
      loadMap();
    } else {
      // Se NÃO tem ID na URL, lista os mapas para visualização pública
      async function fetchMaps() {
        try {
          setLoading(true);
          const res = await axios.get("http://localhost:3000/api/maps");
          setMapList(res.data);
          setMapData(null);
          setError(null);
        } catch (err) {
          console.error("Erro ao listar mapas:", err);
          setError("Erro ao carregar a galeria de mapas.");
        } finally {
          setLoading(false);
        }
      }
      fetchMaps();
    }
  }, [id]);

  if (loading) {
    return <h1 style={{ padding: '20px', fontFamily: 'sans-serif' }}>Carregando dados...</h1>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
        <h2>Ops! {error}</h2>
        <button onClick={() => navigate('/map-viewer')}>Voltar para a Galeria</button>
      </div>
    );
  }

  // TELA 1: Se o ID estiver ausente na URL, mostra a galeria pública de mapas
  if (!id) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>🗺️ Galeria de Mapas Disponíveis</h2>
        <button onClick={handleLogout}>Sair</button>
        <p style={{ color: '#666' }}>Selecione um mapa abaixo para visualizar os pontos e detalhes:</p>
        
        {mapList.length === 0 ? (
          <p style={{ marginTop: '20px', fontStyle: 'italic' }}>Nenhum mapa foi publicado no sistema ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {mapList.map((map) => (
              <div 
                key={map.id} 
                onClick={() => navigate(`/map-viewer/${map.id}`)} // Navega adicionando o ID na URL
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <img 
                  src={`http://localhost:3000${map.imageUrl}`} 
                  alt={map.name} 
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }} 
                />
                <h4 style={{ margin: '12px 0 4px 0', color: '#333' }}>{map.name}</h4>
                <small style={{ color: '#999' }}>Código: {map.id}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function handleLogout() {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    }

  // TELA 2: Se houver ID na URL, abre o mapa em tela cheia com seus pontos (GeoJSON)
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      
      {/* Botão flutuante para voltar à galeria sem estragar o mapa */}
      <button 
        onClick={() => navigate('/map-viewer')}
        style={{
          position: 'absolute',
          top: '15px',
          left: '60px', // Deslocado para não tampar os botões de Zoom do Leaflet
          zIndex: 1000,
          padding: '10px 16px',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ⬅ Sair do Mapa
      </button>

      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        <ImageOverlay
          url={`http://localhost:3000${mapData.imageUrl}`}
          bounds={bounds}
        />

        <GeoJSON
          key={id} // Evita que dados de mapas anteriores fiquem cacheados na tela
          data={mapData.features}
          onEachFeature={(feature, layer) => {
            const props = feature.properties;

            layer.bindPopup(`
              <div style="font-family: sans-serif;">
                <h3 style="margin: 0 0 5px 0; color: #007bff;">${props.name || 'Sem nome'}</h3>
                <p style="margin: 0; color: #555; font-size: 13px;">${props.description || 'Nenhuma descrição fornecida.'}</p>
              </div>
            `);
          }}
        />
      </MapContainer>
    </div>
  );
}