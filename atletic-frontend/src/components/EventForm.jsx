import { useState } from 'react';
import axios from 'axios';

function EventForm({ onEventCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState('Entrenament');
  const [eventName, setEventName] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventDateTime) {
      alert("Si us plau, indica la data i hora.");
      return;
    }
    const payload = {
      event_type: eventType,
      name: eventName || null,
      date_time: new Date(eventDateTime).toISOString(),
      location: eventLocation || null
    };

    axios.post('http://127.0.0.1:8000/events/', payload)
      .then(() => {
        alert("🎉 Convocatòria creada correctament!");
        setEventName('');
        setEventDateTime('');
        setEventLocation('');
        setShowForm(false);
        if (onEventCreated) onEventCreated(); // Avisem al pare (App.jsx) que recarregui la llista
      })
      .catch(error => console.error("Error al crear:", error));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ width: '100%', background: '#eaeaea', color: '#333', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
      >
        {showForm ? "🔼 Tancar Formulari" : "➕ Nova Convocatòria"}
      </button>
      
      {showForm && (
        <form onSubmit={handleCreateEvent} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value="Entrenament">Entrenament</option>
            <option value="Partit">Partit</option>
          </select>
          <input type="text" placeholder="Nom / Rival" value={eventName} onChange={(e) => setEventName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="datetime-local" value={eventDateTime} onChange={(e) => setEventDateTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" placeholder="Lloc" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <button type="submit" style={{ background: '#0070f3', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Explicit Publicar</button>
        </form>
      )}
    </div>
  );
}

export default EventForm;