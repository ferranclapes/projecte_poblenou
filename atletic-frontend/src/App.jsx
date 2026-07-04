import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchdata = () => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/events/'),
      axios.get('http://127.0.0.1:8000/players/')
    ])
    .then(([eventsRes, playersRes]) => {
      setEvents(eventsRes.data);
      setPlayers(playersRes.data);
      
      if (playersRes.data.length > 0 && !selectedPlayer) {
        setSelectedPlayer(playersRes.data[0].id);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data from the API:', error);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchdata();
  }, []);

  // Fetch the events and players data from the API
  

  // Called when clicking an assistance button
  const handleVote = (eventId, status) => {
    if (!selectedPlayer) {
      alert('Si us plau, selecciona un jugador abans de votar.');
      return;
    }

    const payload = {
      player_id: parseInt(selectedPlayer),
      status: status,
      comment: ""
    };

    axios.post(`http://127.0.0.1:8000/events/${eventId}/assistances/`, payload)
    .then(response => {
      alert(`S'ha registrat la teva assistència: ${status}`);
      fetchdata(); // Refresh the events data after voting
    })
    .catch(error => {
      console.error("Error al registrar el vot:", error);
      alert('Hi ha hagut un error al registrar la teva assistència.');
    });
  };

  if (loading) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Carregant l'applicació del Poblenou...</div>;
  }


  return (
    <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px'}}>

      {/*Capçalera*/}
      <header style={{background: '#0070f3', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px'}}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>🏐 Atlètic Poblenou</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>El millor equip del món</p>
      </header>

      {/* Selector de jugador simulat (Temporal fins que s'implementi un login real)*/}
      <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #d0e0f0' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
          👤 Qui ets? (Simulador de Login)
        </label>
        <select 
          value={selectedPlayer} 
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}
        >
          {players.length === 0 && <option value="">Crea un jugador al Swagger primer!</option>}
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.main_position})</option>
          ))}
        </select>
      </div>

      <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Properes Convocatòries</h2>

      {/* Si no hi ha events a la BBDD */}
      {events.length === 0 && <p>No hi ha cap event programat.</p>}

      {/* Bucle que recorre els teves events d'SQL i en fa una targeta per a cadascun */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {events.map((event) => (
          <div key={event.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: event.event_type === 'Partit' ? '#ff4d4d' : '#4caf50',
                color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
              }}>
                {event.event_type}
              </span>
              <small style={{ color: '#666' }}>{new Date(event.date_time).toLocaleDateString()}</small>
            </div>
            
            <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px' }}>
              {event.name ? event.name : "Entrenament de l'equip"}
            </h3>
            
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
              📍 <strong>Lloc:</strong> {event.location || "Per determinar"}
            </p>
            
            {/* Botons d'assistència */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <button
                onClick={() => handleVote(event.id, 'Assisteix')}
                style={{ background: '#e6f4ea', color: '#137333', border: '1px solid #137333', padding: '8px 4px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                🟢 Vinc!
              </button>
              <button 
                onClick={() => handleVote(event.id, 'No assisteix')}
                style={{ background: '#fce8e6', color: '#c5221f', border: '1px solid #c5221f', padding: '8px 4px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                🔴 No puc
              </button>
              <button 
                onClick={() => handleVote(event.id, 'Dubte')}
                style={{ background: '#fef7e0', color: '#b06000', border: '1px solid #b06000', padding: '8px 4px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                🟡 Dubte
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>

  );

}

export default App;