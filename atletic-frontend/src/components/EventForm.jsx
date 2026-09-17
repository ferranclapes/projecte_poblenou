import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';
import API_URL from '../services/api.js';

function EventForm({ onEventCreated, editingEvent, onCancelEdit }) {

  const [eventName, setEventName] = useState(editingEvent ? (editingEvent.name || '') : '');
  const [eventDateTime, setEventDateTime] = useState(editingEvent ? (editingEvent.date_time || '') : '');
  const [eventType, setEventType] = useState(editingEvent ? editingEvent.event_type : 'Entrenament');
  const [eventLocation, setEventLocation] = useState(editingEvent ? (editingEvent.location || '') : '');
  const [eventDescription, setEventDescription] = useState(editingEvent ? (editingEvent.description || '') : '');

  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState(editingEvent && editingEvent.team_ids ? editingEvent.team_ids : []);

  const [isPeriodic, setIsPeriodic] = useState(false);
  const [periodicity, setPeriodicity] = useState('setmanal');
  const [occurrences, setOccurrences] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setTeams(response.data))
    .catch(error => console.error("Error al obtenir els equips:", error));
  }, []);

  const handleCheckboxChange = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  };

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
      team_ids: selectedTeams,
      is_periodic: isPeriodic,
      periodicity: isPeriodic ? periodicity : null,
      occurrences: isPeriodic ? Number(occurrences) : null
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    if (editingEvent) {
      axios.put(`${API_URL}/events/${editingEvent.id}`, payload, config)
        .then(() => {
          alert("✏️ Convocatòria actualitzada correctament!");
          resetForm();
          onEventCreated();
        })
        .catch(error => console.error("Error al editar:", error));
    } else {
      axios.post(`${API_URL}/events`, payload, config)
        .then(() => {
          alert("🎉 Convocatòria creada correctament!");
          resetForm();
          onEventCreated();
        })
        .catch(error => console.error("Error al crear:", error));
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("⚠️ Segur que vols eliminar aquesta convocatòria? Es borraran totes les assistències.")) {
      const token = localStorage.getItem('token');
      axios.delete(`${API_URL}/events/${editingEvent.id}`, {
        headers: {Authorization: `Bearer ${token}`}
      })
      .then(() => {
        alert("🗑️ Convocatòria eliminada correctament!");
        resetForm();
        onEventCreated();
      })
      .catch(error => {
        console.error("Error al eliminar la convocatòria:", error);
        alert("Hi ha hagut un error al eliminar la convocatòria.");
      });
    }
  }

  const resetForm = () => {
    setEventName('');
    setEventDateTime('');
    setEventLocation('');
    setEventDescription('');
    setEventType('Entrenament');
    setSelectedTeams([]);
    setIsPeriodic(false);
    setPeriodicity('setmanal');
    setOccurrences(1);
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

          <div>
            <label style={theme.infoLabel}>Equips</label>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', justifyItems: 'start', maxHeight: '120px', overflowY: 'auto', padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}>
              {teams.map(team => (
                <label key={team.id} style={{display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={selectedTeams.some(id => Number(id) === Number(team.id))}
                    onChange={() => handleCheckboxChange(team.id)}
                    style={{marginRight: '8px'}}
                  />
                  {team.name}
                </label>
              ))}
              </div>
          </div>

          {!editingEvent && ( // Normalment només es crea periòdicament al crear, no al modificar un d'individual
          <div>
            <label style={theme.infoLabel}>
              <input
                    type="checkbox"
                    checked={isPeriodic}
                    onChange={(e) => setIsPeriodic(e.target.checked)}
                    style={{ marginRight: '8px', width: '16px', height: '16px' }}
                  />
                Es repeteix
              </label>
                

              {isPeriodic && (
              <div style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', alignItems: 'center'}}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <label style={theme.infoLabel}>Freqüència</label>
                    <select 
                      value={periodicity} 
                      onChange={(e) => setPeriodicity(e.target.value)} 
                      style={theme.inputField}
                    >
                      <option value="diari">Cada dia</option>
                      <option value="setmanal">Cada setmana</option>
                      <option value="mensual">Cada mes</option>
                    </select>
                  </div>

                  <div>
                    <label style={theme.infoLabel}>Repeticions totals</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="52" 
                      value={occurrences} 
                      onChange={(e) => setOccurrences(e.target.value)} 
                      style={theme.inputField} 
                      required={isPeriodic}
                    />
                  </div>
                </div>
              </div>
              )}
          </div>
          )}

          <div style={theme.form_button_container}>
            <button type="submit" style={theme.btnPrimary}>{editingEvent ? "Desar canvis" : "Crear convocatòria"}</button>
            <button type="button" onClick={onCancelEdit} style={theme.btnSecondary}>Cancel·lar</button>
            {editingEvent && (
              <button type="button" onClick={handleDelete} style={theme.btnSecondary}>Eliminar</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;