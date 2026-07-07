import { useState, useEffect } from 'react';
import axios from 'axios';

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

      <header style={{ background: '#0070f3', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>📊 Estat de la Convocatòria</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Confirmats totals: <strong>{summary.total_confirmed}</strong></p>
      </header>

      {/* 1. BALANÇ MIXTE */}
      <section style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '2026-07-04 1px solid #eee', paddingBottom: '5px' }}>👫 Balanç Mixte</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
          <div>🔹 Nois: <strong>{summary.gender_balance["Masculí"]}</strong></div>
          <div>🔸 Noies: <strong>{summary.gender_balance["Femení"]}</strong></div>
        </div>
      </section>

      {/* 2. COMPTADOR DE POSICIONS */}
      <section style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>🏐 Posicions Cobertes</h3>
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

export default EventSummary;