import { useState, useEffect } from 'react';
import axios from 'axios';

const colors = {
  primary: "#dd092c",      // Club red
  primaryDark: "#9E1025",
  background: "#F8F8F8",
  white: "#FFFFFF",
  border: "#E5E5E5",
  text: "#222222",
  success: "#2E7D32",
  warning: "#E6A700",
  danger: "#C62828",
};

// =============================================================================
// COMPONENT 1: EVENT SUMMARY PAGE (Opened when clicking on an event in the main page)
// =============================================================================

function EventSummary({ eventId, onBack }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/events/${eventId}/summary`)
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching event summary:', err);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregant resum de la pinya...</div>;
  if (!summary) return <div style={{ padding: '20px', textAlign: 'center' }}>No s'ha pogut carregar el resum.</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={onBack}
        style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        ⬅️ Tornar al llistat
      </button>

      <header style={{ background: '#FFFFFF', border:'2px solid #C8102E', color: '#C8102E', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>📊 Estat de la Convocatòria</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Confirmats totals: <strong>{summary.total_confirmed}</strong></p>
      </header>

      {/* 1. BALANÇ MIXTE */}
      <section style={{ background: '#FFFFFF', border: '1px solid #C8102E', borderRadius: '10px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color:'#C8102E', margin: '0 0 10px 0', fontSize: '16px', borderBottom: '2026-07-04 1px solid #eee', paddingBottom: '5px' }}>👫 Balanç Mixte</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
          <div>🔹 Nois: <strong>{summary.gender_balance["Masculí"]}</strong></div>
          <div>🔸 Noies: <strong>{summary.gender_balance["Femení"]}</strong></div>
        </div>
      </section>

      {/* 2. COMPTADOR DE POSICIONS */}
      <section style={{ background: '#FFFFFF', border: '1px solid #C8102E', borderRadius: '10px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color:'#C8102E', margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>🏐 Posicions Cobertes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          {Object.entries(summary.position_balance).map(([position, quantity]) => (
            <div key={position} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #f0f0f0' }}>
              <span>{position}:</span>
              <span style={{ fontWeight: 'bold', color: quantity > 0 ? '#137333' : '#c5221f' }}>{quantity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Espai reservat per a les alineacions en el futur */}
      <div style={{ background: '#fafafa', border: '1px dashed #bbb', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
        🛠️ <em>Espai per a la planificació de la tècnica i alineacions (Properament)</em>
      </div>

    </div>
  );

}

// =============================================================================
// COMPONENT PRINCIPAL: GESTIONA QUINA PANTALLA ES MOSTRA
// =============================================================================

function App() {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [currentEventId, setCurrentEventId] = useState(null);
  const [loading, setLoading] = useState(true);

  
  // Fetch the events and players data from the API
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

  // Called when clicking an assistance button
  const handleVote = (eventId, status, e) => {
    e.stopPropagation(); // Prevent the event card click from triggering
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
    .then(() => {
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

  // If an event is selected, show the EventSummary component
  if (currentEventId !== null) {
    return (
      <EventSummary
        eventId={currentEventId}
        onBack={() => setCurrentEventId(null)}
      />
    );
  }


  return (
    <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px',background:colors.background, minHeight:'100vh'}}>
      {/*Capçalera*/}
      <header style={{background: colors.primary, color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px'}}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>🏐 Atlètic Poblenou</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>El millor equip del món</p>
      </header>
      {/* Selector de jugador simulat (Temporal fins que s'implementi un login real)*/}
      <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #E5E5E5', boxShadow: '0 2px 4px rgba(200,16,46,.08)' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: colors.text }}>👤 Qui ets? (Simulador de Login)</label>
        <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}>
          {players.length === 0 && <option value="">Crea un jugador al Swagger primer!</option>}
          {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.main_position})</option>)}
        </select>
      </div>
      {/* Llistat d'events */}
      <h2 style={{ color:'#C8102E', fontSize: '18px', marginBottom: '15px' }}>Properes Convocatòries</h2>
      {events.length === 0 && <p>No hi ha cap event programat.</p>}
      {/* Bucle que recorre els teves events d'SQL i en fa una targeta per a cadascun */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {events.map((event) => (
          <div 
          key={event.id} 
          onClick={() => setCurrentEventId(event.id)}
          style={{ border: '2px solid #C8102E20', background: colors.white, borderRadius: '8px', padding: '15px', boxShadow:'0 3px 8px rgba(0,0,0,.08)', cursor: 'pointer', transition: 'transform 0.2s' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: event.event_type === 'Partit' ? '#C8102E' : '#D32F2F',
                color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
              }}>
                {event.event_type}
              </span>
              <small style={{ color: '#666' }}>{new Date(event.date_time).toLocaleDateString()}</small>
            </div>
            
            <h3 style={{ color:'#C8102E', margin: '10px 0 5px 0', fontSize: '16px' }}>
              {event.name ? event.name : "Entrenament de l'equip"}
            </h3>
            
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
              📍 <strong>Lloc:</strong> {event.location || "Per determinar"}
            </p>
            
            {/* Botons d'assistència */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <button
                onClick={(e) => handleVote(event.id, 'Assisteix', e)}
                style={{ background: '#EAF6EC', color: '#2E7D32', border: '1px solid #2E7D32', padding: '8px 4px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                🟢 Vinc!
              </button>
              <button 
                onClick={(e) => handleVote(event.id, 'No assisteix', e)}
                style={{ background: '#FDECEC', color: '#C62828', border: '1px solid #C62828', padding: '8px 4px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                🔴 No puc
              </button>
              <button 
                onClick={(e) => handleVote(event.id, 'Dubte', e)}
                style={{ background: '#FFF8E5', color: '#B26A00', border: '1px solid #E6A700', padding: '8px 4px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
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