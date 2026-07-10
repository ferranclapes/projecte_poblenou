import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import EventSummary from './components/EventSummary';
import EventForm from './components/EventForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TeamSummary from './components/TeamSummary';

function App() {
  const [events, setEvents] = useState([]);
  const [currentEventId, setCurrentEventId] = useState(null);
  
  const [editingEvent, setEditingEvent] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toISOString().split('T')[0]);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {return !!localStorage.getItem('token')});
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTeamSummaryVisible, setIsTeamSummaryVisible] = useState(false);

  const [preferedName, setPreferedName] = useState(() => {return localStorage.getItem('prefered_name') || ''});

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setPreferedName(localStorage.getItem('prefered_name') || '');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setPreferedName('');
    setEvents([]);
  };

  const fetchEvents = useCallback(() => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/events/',{
      headers: {Authorization: `Bearer ${token}`}
    })
    .then(response => setEvents(response.data))
    .catch(error => {
      console.error('Error carregant els esdeveniments: ', error)
      if (error.response && error.response.status === 401) {
        alert('La sessió ha caducat. Torna a iniciar sessió.');
        handleLogout();
      }
    })
  }, []);  

  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents();
    }
  }, [isLoggedIn, fetchEvents]);

  //* Calculate the days of the week
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

  //* Change the current week by a given offset (in weeks)
  const changeWeek = (weekOffset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (weekOffset * 7));
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays(currentDate);

  //* Check if a given date has any events
  const dayHasEvents = (dateStr) => {
    return events.some(event => event.date_time.split('T')[0] === dateStr);
  };

  //* Handle the deletion of an event
  const handleDeleteEvent = (eventId, e) => {
    e.stopPropagation();
    if (window.confirm("⚠️ Segur que vols eliminar aquesta convocatòria? Es borraran totes les assistències.")) {
      const token = localStorage.getItem('token');
      axios.delete(`http://127.0.0.1:8000/events/${eventId}`, {
        headers: {Authorization: `Bearer ${token}`}
      })
      .then(() => {
        alert("🗑️ Convocatòria eliminada correctament!");
        fetchEvents();
      })
      .catch(error => {
        console.error("Error al eliminar la convocatòria:", error);
        alert("Hi ha hagut un error al eliminar la convocatòria.");
      });
    }
  }

  //* Called when clicking an assistance button
  const handleVote = (eventId, status, e) => {
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

    axios.post(`http://127.0.0.1:8000/events/${eventId}/assistances/`, payload)
    .then(() => {
      alert(`S'ha registrat la teva assistència: ${status}`);
      fetchEvents();
    })
    .catch(error => {
      console.error("Error al registrar el vot:", error);
      alert('Hi ha hagut un error al registrar la teva assistència.');
    });
  };

  //* SHOW LOGGIN SCREEN IF NOT LOGGED IN
  if (!isLoggedIn) {
    if (isRegistering) {
      return (
        <RegisterForm onCancel={() => setIsRegistering(false)} onRegisterSuccess={() => setIsRegistering(false)} />
      );
    }
    return <LoginForm onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setIsRegistering(true)} />;
  }

  //* SHOW TEAM SUMMARY IF USER WANTS TO SEE IT
  if (isTeamSummaryVisible) {
    return ( <TeamSummary onBack={() => setIsTeamSummaryVisible(false)} />);
  }

  //* SHOW EVENT SUMMARY IF AN EVENT IS SELECTED
  if (currentEventId !== null) {
    return (<EventSummary eventId={currentEventId} onBack={() => setCurrentEventId(null)}/>);
  }

  const filteredEvents = events.filter(event => event.date_time.split('T')[0] === selectedDayStr);

  //* MAIN RENDER
  return (
    <div style={{fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px', background: 'var(--bg)', minHeight: '100vh', boxSizing: 'border-box'}}>
      
      {/* Barra superior de l'usuari connectat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'var(--code-bg)', padding: '10px 20px', borderRadius: '8px' }}>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)' }}>🏐 Atlètic Poblenou</span>
          <span style={{ marginLeft: '15px', color: 'var(--text)', fontSize: '14px' }}>Hola, <strong>{preferedName}</strong>!</span>
        </div>
        <button
          onClick={() => setIsTeamSummaryVisible(true)}
          style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          ⚙️ Plantilla i Permisos
        </button>
        
        <button 
          onClick={handleLogout}
          style={{ background: 'var(--border)', color: 'var(--text)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          Tancar sessió
        </button>
      </div>

      {/* 3. COMPONENT FORMULARI (Invocat de forma neta i modular) 📦 */}
      {localStorage.getItem('is_admin') === 'true' && (
      <EventForm 
        key={editingEvent ? `edit-${editingEvent.id}` : 'nou-event'}
        onEventCreated={fetchEvents} 
        editingEvent={editingEvent} 
        onCancelEdit={() => setEditingEvent(null)} 
      />
      )} 

      {/* 2. CALENDARI HORITZONTAL SETMANAL */}
      <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '15px', border: '1px solid var(--border)', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={() => changeWeek(-1)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px', color: 'var(--text)' }}>⬅️</button>
          <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-h)', textTransform: 'capitalize' }}>
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
              <div key={dateStr} onClick={() => setSelectedDayStr(dateStr)} style={{ padding: '10px 5px', borderRadius: '8px', cursor: 'pointer', background: isSelected ? 'var(--accent)' : 'transparent', color: isSelected ? 'var(--bg)' : 'var(--text)', transition: '0.2s', position: 'relative', fontWeight: isSelected ? 'bold' : 'normal' }}>
                <small style={{ display: 'block', fontSize: '10px', color: isSelected ? 'var(--bg)' : 'var(--text)', marginBottom: '4px' }}>{nomDia}</small>
                <span style={{ fontSize: '15px' }}>{diaNum}</span>
                {hasEvent && (
                  <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: isSelected ? 'var(--bg)' : 'var(--accent)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LLISTAT D'EVENTS */}
      <h2 style={{ fontSize: '16px', color: 'var(--text-h)', marginBottom: '12px' }}>
        Esdeveniments del dia {new Date(selectedDayStr).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
      </h2>
      
      {filteredEvents.length === 0 && (
        <p style={{ color: 'var(--text)', textAlign: 'center', padding: '30px 0', fontSize: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          🏖️ Cap esdeveniment planificat per aquest dia. ¡Descans!
        </p>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredEvents.map((event) => (
        <div key={event.id} onClick={() => setCurrentEventId(event.id)} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '15px', boxShadow: 'var(--shadow)', background: 'var(--bg)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {localStorage.getItem('is_admin') === 'true' && (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span style={{ background: event.event_type === 'Partit' ? 'var(--accent)' : 'lightgreen', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{event.event_type}</span>
              <button onClick={(e) => { e.stopPropagation(); setEditingEvent(event); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text)' }} title="Editar">✏️</button>
              <button onClick={(e) => handleDeleteEvent(event.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text)' }} title="Eliminar">🗑️</button>
            </div>
            )}
            <small style={{ color: 'var(--text)', fontWeight: 'bold' }}>🕒 {new Date(event.date_time).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}</small>
          </div>
          <h3 style={{ margin: '12px 0 6px 0', fontSize: '16px', color: 'var(--text-h)' }}>{event.name || "Entrenament de l'equip"}</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text)' }}>📍 {event.location || "Per determinar"}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
            <button onClick={(e) => handleVote(event.id, 'Assisteix', e)} style={{ background: 'var(--accent-bg)', color: 'darkgreen', border: 'none', padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🟢 Vinc!</button>
            <button onClick={(e) => handleVote(event.id, 'No assisteix', e)} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🔴 No puc</button>
            <button onClick={(e) => handleVote(event.id, 'Dubte', e)} style={{ background: 'gold', color: 'black', border: 'none', padding: '8px 4px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🟡 Dubte</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;