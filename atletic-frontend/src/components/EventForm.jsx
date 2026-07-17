import { useState } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';

function EventForm({ onEventCreated, editingEvent, onCancelEdit }) {

  const [eventName, setEventName] = useState(editingEvent ? (editingEvent.name || '') : '');
  const [eventDateTime, setEventDateTime] = useState(editingEvent ? (editingEvent.date_time || '') : '');
  const [eventType, setEventType] = useState(editingEvent ? editingEvent.event_type : 'Entrenament');
  const [eventLocation, setEventLocation] = useState(editingEvent ? (editingEvent.location || '') : '');
  const [eventDescription, setEventDescription] = useState(editingEvent ? (editingEvent.description || '') : '');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!eventName || !eventDateTime) {
      alert("Si us plau, completa tots els camps obligatoris.");
      return;
    }

    const token = localStorage.getItem('token');

    const payload = {
      event_type: eventType,
      name: eventName,
      date_time: new Date(eventDateTime).toISOString(),
      location: eventLocation || null,
      description: eventDescription || null,
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    if (editingEvent) {
      axios.put(`http://127.0.0.1:8000/events/${editingEvent.id}`, payload, config)
        .then(() => {
          alert("✏️ Convocatòria actualitzada correctament!");
          resetForm();
          onEventCreated();
        })
        .catch(error => console.error("Error al editar:", error));
    } else {
      axios.post('http://127.0.0.1:8000/events', payload, config)
        .then(() => {
          alert("🎉 Convocatòria creada correctament!");
          resetForm();
          onEventCreated();
        })
        .catch(error => console.error("Error al crear:", error));
    }
  }

  const resetForm = () => {
    setEventName('');
    setEventDateTime('');
    setEventLocation('');
    onCancelEdit();
    if (onCancelEdit) onCancelEdit(); 
  };

  return (
    <div style={theme.form_overlay} onClick={onCancelEdit}>
      <div style={theme.form_container} onClick={(e) => e.stopPropagation()}>
        <h2 style={theme.form_title}>{editingEvent ? "✏️ Modificar Esdeveniment" : "🏐 Nova Convocatòria"}</h2>

        <form onSubmit={handleSubmit} style={theme.form_content}>
          <div>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={theme.inputField}>
              <option value="Entrenament" style={{fontSize: '10px'}}>Entrenament</option>
              <option value="Partit" style={{fontSize: '10px'}}>Partit</option>
            </select>
          </div>
          
          <div>
            <label style={theme.infoLabel}>Nom de la convocatòria</label>
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Ex: Entrenament A" style={theme.inputField} required />
          </div>

          <div>
            <label style={theme.infoLabel}>Data i hora</label>
            <input type="datetime-local" value={eventDateTime} onChange={(e) => setEventDateTime(e.target.value)} style={theme.inputField} required />
          </div>

          <div>
            <label style={theme.infoLabel}>Lloc</label>
            <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Ex: Sagrat Cor" style={theme.inputField} />
          </div>

          <div>
            <label style={theme.infoLabel}>Descripció</label>
            <input type="text" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Ex: Convocatòria per al partit contra el Barça" style={theme.inputField} />
          </div>

          <div style={theme.form_button_container}>
            <button type="button" onClick={onCancelEdit} style={theme.btnSecondary}>Cancel·lar</button>
            <button type="submit" style={theme.btnPrimary}>{editingEvent ? "Desar canvis" : "Crear convocatòria"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;