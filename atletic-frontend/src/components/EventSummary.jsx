import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';
import API_URL from '../services/api.js';

function EventSummary({ eventId, onBack }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/events/${eventId}/summary`)
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
    <div style={theme.background}>
      <div style={theme.eventSummary_header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={onBack}
            style={{background: 'transparent', padding: '8px 12px', cursor: 'pointer', border: 'none', fontSize: '16px'}}>
            ⬅️
          </button>
          <h1 style={{color: 'black', margin: 0, fontSize: '20px', marginTop: '10px', gap: '10px', flex: 1}}>
          📊 Estat de la Convocatòria
          </h1>
          <div style={{ width: '40px' }}></div> {/* Placeholder for spacing */}
        </div>
        <p style={{ display:'flex', justifyContent:'space-between', margin: '5px 10px 0 10px', fontSize: '14px' }}>
          <strong>Num SI: {summary.total_confirmed}</strong>
          <strong>Num NO: {summary.total_declined}</strong>
          <strong>Pendents: {summary.total_pending}</strong>
        </p>
      </div>


      {/* 1. BALANÇ MIXTE */}
      <section style={theme.eventSummary_section}>
        <h3 style={theme.eventSummary_section_title}>👫 Balanç Mixte</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px', color: '#333333' }}>
          <div>🔹 Nois: <strong style={{color: summary.sex_balance["Home"] > 1 ? '#008000' : '#ff0000'}}>{summary.sex_balance["Home"]}</strong></div>
          <div>🔸 Noies: <strong style={{color: summary.sex_balance["Dona"] > 1 ? '#008000' : '#ff0000'}}>{summary.sex_balance["Dona"]}</strong></div>
        </div>
      </section>

      {/* 2. COMPTADOR DE POSICIONS */}
      <section style={theme.eventSummary_section}>
        <h3 style={theme.eventSummary_section_title}>🏐 Posicions Cobertes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          {Object.entries(summary.position_balance).map(([position, quantity]) => (
            <div key={position} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #cccccc' }}>
              <span>{position}:</span>
              <span style={{ fontWeight: 'bold', color: quantity > 0 ? '#008000' : '#ff0000' }}>{quantity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. LLISTAT DE JUGADORS CONFIRMATS */}
      <section style={theme.eventSummary_section}>
        <h3 style={theme.eventSummary_section_title}>📋 Jugadors Confirmats ({summary.total_confirmed})</h3>
        {summary.confirmed_players && summary.confirmed_players.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summary.confirmed_players.map(player => (
              <li key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: '#eeeeee', borderRadius: '5px', fontSize: '14px' }}>
                <span><strong>{player.prefered_name || player.name}</strong> {player.surname1}</span>
                <span style={{ fontSize: '12px', background: '#cccccc', padding: '2px 6px', borderRadius: '4px', color: '#333333' }}>
                  {player.main_position}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: '13px', color: 'gray', fontStyle: 'italic', margin: 0 }}>Encara no hi ha cap jugador confirmat per a aquest esdeveniment.</p>
        )}
      </section>

      {/* Espai reservat per a les alineacions en el futur */}
      <div style={{ background: '#eeeeee', border: '1px dashed #cccccc', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#333333', fontSize: '13px' }}>
        🛠️ <em>Espai per a la planificació de la tècnica i alineacions (Properament)</em>
      </div>

    </div>
  );

}

export default EventSummary;