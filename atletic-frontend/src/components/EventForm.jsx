import { useState } from 'react';
import axios from 'axios';

function EventForm({ onEventCreated, editingEvent, onCancelEdit }) {
    
  let initialDateTime = '';
  if (editingEvent && editingEvent.date_time) {
    const dateObj = new Date(editingEvent.date_time);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    initialDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  
  const [showForm, setShowForm] = useState(!!editingEvent);
  const [eventType, setEventType] = useState(editingEvent ? editingEvent.event_type : 'Entrenament');
  const [eventName, setEventName] = useState(editingEvent ? (editingEvent.name || '') : '');
  const [eventDateTime, setEventDateTime] = useState(initialDateTime);
  const [eventLocation, setEventLocation] = useState(editingEvent ? (editingEvent.location || '') : '');

  const handleSaveEvent = (e) => {
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

    if (editingEvent) {
      axios.put(`http://127.0.0.1:8000/events/${editingEvent.id}`, payload)
        .then(() => {
          alert("✏️ Convocatòria actualitzada correctament!");
          resetForm();
          onEventCreated(); 
        })
        .catch(error => console.error("Error al editar:", error));
    } else {
      axios.post('http://127.0.0.1:8000/events/', payload)
        .then(() => {
          alert("🎉 Convocatòria creada correctament!");
          resetForm();
          onEventCreated(); 
        })
        .catch(error => console.error("Error al crear:", error));
    }
  };

  const resetForm = () => {
    setEventName('');
    setEventDateTime('');
    setEventLocation('');
    setShowForm(false);
    if (onCancelEdit) onCancelEdit(); 
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {!editingEvent && (
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={{ width: '100%', background: '#eaeaea', color: '#333', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          {showForm ? "🔼 Tancar Formulari" : "➕ Nova Convocatòria"}
        </button>
      )}
      
      {showForm && (
        <form onSubmit={handleSaveEvent} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: 0, color: '#0070f3' }}>{editingEvent ? "✏️ Modificar Esdeveniment" : "🏐 Nova Convocatòria"}</h4>
          
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value="Entrenament">Entrenament</option>
            <option value="Partit">Partit</option>
          </select>
          <input type="text" placeholder="Nom / Rival" value={eventName} onChange={(e) => setEventName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="datetime-local" value={eventDateTime} onChange={(e) => setEventDateTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" placeholder="Lloc" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, background: '#0070f3', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editingEvent ? "💾 Desar Canvis" : "Publicar"}
            </button>
            {editingEvent && (
              <button type="button" onClick={resetForm} style={{ background: '#ccc', color: '#333', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default EventForm;