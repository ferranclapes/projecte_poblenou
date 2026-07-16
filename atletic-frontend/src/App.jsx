import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {theme} from './styles.js';

import EventSummary from './components/EventSummary';
import EventForm from './components/EventForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TeamSummary from './components/TeamSummary';
import EventCard from './components/EventCard';
import Calendar from './components/Calendar';
import SideMenu from './components/SideMenu';

import logo from '../assets/logo-atletic.png';


function App() {
  const [events, setEvents] = useState([]);
  const [currentEventId, setCurrentEventId] = useState(null);
  
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toISOString().split('T')[0]);
  
  const [editingEvent, setEditingEvent] = useState(null);


  const [isLoggedIn, setIsLoggedIn] = useState(() => {return !!localStorage.getItem('token')});
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTeamSummaryVisible, setIsTeamSummaryVisible] = useState(false);

  const [preferedName, setPreferedName] = useState(() => {return localStorage.getItem('prefered_name') || ''});

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginSuccess = () => {
    setIsMenuOpen(false);
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


  //======================================================================================
  // RENDERING LOGIC
  //======================================================================================

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

    

    <div style={theme.background}>

      {/* Side Menu */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
      />

      <div style={theme.headers_container}>
        
        {/* User Header */}
        <div style={theme.user_header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
              <img src={logo} alt="Logo" style={theme.logo} /> 
              <h1 style={theme.user_header_title}>Hola, {preferedName}!</h1>
          </div>
          <button 
            onClick={() => setIsMenuOpen(true)}
            style={theme.menu_button}
          >
            ☰
          </button>
        </div>

        {/* Calendar */}
        <Calendar events={events} selectedDayStr={selectedDayStr} setSelectedDayStr={setSelectedDayStr}/>
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
      
      {/* 4. LLISTAT D'EVENTS */}
      {/*<h2 style={{ fontSize: '16px', color: 'var(--text-h)', marginBottom: '12px' }}>
        Esdeveniments del dia {new Date(selectedDayStr).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
      </h2>*/}
      
      {filteredEvents.length === 0 && (
        <p style={theme.event_container}>
          🏖️ Cap esdeveniment planificat per aquest dia. ¡Descans!
        </p>
      )}
      
      <div style={theme.event_list_container}>
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClickEvent={() => setCurrentEventId(event.id)}
            onEdit={(e) => { e.stopPropagation(); setEditingEvent(event); }}
            onRefreshEvents={fetchEvents}
          />
        ))}
      </div>

    </div>
  );
}

export default App;