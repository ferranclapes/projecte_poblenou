import { useState, useEffect } from 'react';
import axios from 'axios';

import EventSummary from './components/EventSummary';
import EventForm from './components/EventForm';

function App() {
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [currentEventId, setCurrentEventId] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toISOString().split('T')[0]);

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

  // Calculate the days of the week
  const getWeekDays = (baseDate) => {
    const current = new Date(baseDate);
    const day = current.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust for Sunday
    const monday = new Date(current.setDate(current.getDate() + diffToMonday));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // Change the current week by a given offset (in weeks)
  const changeWeek = (weekOffset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (weekOffset * 7));
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays(currentDate);

  // Check if a given date has any events
  const dayHasEvents = (dateStr) => {
    return events.some(event => event.date_time.split('T')[0] === dateStr);
  };

  // Called when clicking an assistance button
  const handleVote = (eventId, status, e) => {
    e.stopPropagation(); // Prevent the event card click from triggering
    if (!selectedPlayer) {
      alert('Si us plau, selecciona un jugador abans de votar.');
      return;
    }

    const payload = {
      player_id: parseInt(selectedPlayer, 10),
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

  const filteredEvents = events.filter(event => event.date_time.split('T')[0] === selectedDayStr);


  return (
    <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px', background: '#fcfcfc', minHeight: '100vh'}}>
      
      {/* 1. SECTOR SUPERIOR: USUARI ACTIU */}
      <div style={{ background: '#222', color: '#fff', padding: '12px 15px', borderRadius: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>👤</span>
          <div>
            <small style={{ color: '#aaa', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Jugador actiu</small>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', outline: 'none', padding: 0 }}>
              {players.map(p => <option key={p.id} value={p.id} style={{color: '#000'}}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <span style={{ background: '#0070f3', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>🏐 MVP</span>
      </div>

      {/* 2. CALENDARI HORITZONTAL SETMANAL */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '15px', border: '1px solid #eee', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={() => changeWeek(-1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px' }}>⬅️</button>
          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#444', textTransform: 'capitalize' }}>
            {weekDays[0].toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeWeek(1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px' }}>➡️</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' }}>
          {weekDays.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDayStr;
            const hasEvent = dayHasEvents(dateStr);
            const diaNum = date.getDate();
            const nomDia = date.toLocaleDateString('ca-ES', { weekday: 'narrow' });

            return (
              <div key={dateStr} onClick={() => setSelectedDayStr(dateStr)} style={{ padding: '10px 5px', borderRadius: '8px', cursor: 'pointer', background: isSelected ? '#0070f3' : 'transparent', color: isSelected ? '#fff' : '#333', transition: '0.2s', position: 'relative', fontWeight: isSelected ? 'bold' : 'normal' }}>
                <small style={{ display: 'block', fontSize: '10px', color: isSelected ? '#fff' : '#999', marginBottom: '4px' }}>{nomDia}</small>
                <span style={{ fontSize: '15px' }}>{diaNum}</span>
                {hasEvent && (
                  <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: isSelected ? '#fff' : '#0070f3' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. COMPONENT FORMULARI (Invocat de forma neta i modular) 📦 */}
      <EventForm onEventCreated={fetchdata} />

      {/* 4. LLISTAT D'EVENTS */}
      <h2 style={{ fontSize: '16px', color: '#555', marginBottom: '12px' }}>
        Esdeveniments del dia {new Date(selectedDayStr).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
      </h2>
      
      {filteredEvents.length === 0 && (
        <p style={{ color: '#999', textAlign: 'center', padding: '30px 0', fontSize: '14px', background: '#fff', borderRadius: '12px', border: '1px dashed #eee' }}>
          🏖️ Cap esdeveniment planificat per aquest dia. ¡Descans!
        </p>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredEvents.map((event) => (
          <div key={event.id} onClick={() => setCurrentEventId(event.id)} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', background: '#fff', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: event.event_type === 'Partit' ? '#ff4d4d' : '#4caf50', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{event.event_type}</span>
              <small style={{ color: '#666', fontWeight: 'bold' }}>🕒 {new Date(event.date_time).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
            <h3 style={{ margin: '12px 0 6px 0', fontSize: '16px', color: '#222' }}>{event.name || "Entrenament de l'equip"}</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666' }}>📍 {event.location || "Per determinar"}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f5f5f5' }}>
              <button onClick={(e) => handleVote(event.id, 'Assisteix', e)} style={{ background: '#e6f4ea', color: '#137333', border: 'none', padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🟢 Vinc!</button>
              <button onClick={(e) => handleVote(event.id, 'No assisteix', e)} style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🔴 No puc</button>
              <button onClick={(e) => handleVote(event.id, 'Dubte', e)} style={{ background: '#fef7e0', color: '#b06000', border: 'none', padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🟡 Dubte</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;