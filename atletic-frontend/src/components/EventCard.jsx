import { useState } from 'react';
import axios from 'axios';
import {theme} from '../styles.js';

function EventCard({event, onClickEvent, onEdit, onRefreshEvents}) {
  const [assistance, setAssistance] = useState(null);

  //* Handle the deletion of an event
  const handleDeleteEvent = (e) => {
    e.stopPropagation();
    if (window.confirm("⚠️ Segur que vols eliminar aquesta convocatòria? Es borraran totes les assistències.")) {
      const token = localStorage.getItem('token');
      axios.delete(`http://127.0.0.1:8000/events/${event.id}`, {
        headers: {Authorization: `Bearer ${token}`}
      })
      .then(() => {
        alert("🗑️ Convocatòria eliminada correctament!");
        onRefreshEvents;
      })
      .catch(error => {
        console.error("Error al eliminar la convocatòria:", error);
        alert("Hi ha hagut un error al eliminar la convocatòria.");
      });
    }
  }

  //* Called when clicking an assistance button
  const handleVote = (status, e) => {
    e.stopPropagation(); // Prevent the event card click from triggering

    if (!localStorage.getItem('user_id')) {
      alert('Si us plau, selecciona un jugador abans de votar.');
      return;
    }

    const payload = {
      player_id: parseInt(localStorage.getItem('user_id'), 10),
      status: status,
      comment: ""
    };

    axios.post(`http://127.0.0.1:8000/events/${event.id}/assistances/`, payload)
    .then(() => {
      alert(`S'ha registrat la teva assistència: ${status}`);
      setAssistance(status);
      onRefreshEvents();
    })
    .catch(error => {
      console.error("Error al registrar el vot:", error);
      alert('Hi ha hagut un error al registrar la teva assistència.');
    });
  };

    return (
        <div onClick={onClickEvent} style={theme.event_container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/*//TODO: Canviar color segons tipus d'esdeveniment utilizant un loopUp object per a millor escalabilitat */}
            <span style={{...theme.event_type_badge, background: event.event_type === 'Partit' ? '#ff3131' : 'lightgreen'}}>{event.event_type}</span>
            {localStorage.getItem('is_admin') === 'true' && (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <button onClick={onEdit} style={theme.edit_event_button} title="Editar">✏️</button>
              <button onClick={(e) => handleDeleteEvent(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text)' }} title="Eliminar">🗑️</button>
            </div>
            )}
          </div>
          <h3 style={theme.event_name}>{event.name || "Entrenament de l'equip"}</h3>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'left'}}>
            <p style={{...theme.event_info_box, textTransform: 'uppercase'}}>{new Date(event.date_time).toLocaleDateString('ca-ES', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <p style={theme.event_info_box}> {new Date(event.date_time).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            <p style={theme.event_info_box}>📍{event.location || "Per determinar"}</p>
          </div>

          <p style={theme.event_description_text}> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tortor arcu, viverra nec augue eu, consequat vulputate enim. Nam volutpat nisl id commodo vehicula. Donec placerat enim eu lacus mollis viverra. Curabitur vel rutrum nisi. Fusce et felis aliquam, commodo magna nec, sollicitudin augue.</p>
          
          
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
            <button onClick={(e) => handleVote('Assisteix', e)} style={{...theme.event_assistance_button, background: assistance === 'Assisteix' ? '#ff2020' : '#ff9090'}}>🟢 Vinc!</button>
            <button onClick={(e) => handleVote('No assisteix', e)} style={{ ...theme.event_assistance_button, background: assistance === 'No assisteix' ? '#ff2020' : '#ff9090'}}>🔴 No puc</button>
            <button onClick={(e) => handleVote('Dubte', e)} style={{ ...theme.event_assistance_button, background: assistance === 'Dubte' ? '#ff2020' : '#ff9090'}}>🟡 Dubte</button>
            </div>
          </div>
    );
}
export default EventCard;