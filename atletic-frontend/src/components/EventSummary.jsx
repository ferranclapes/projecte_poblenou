import { useState, useEffect } from 'react';
import axios from 'axios';

function EventSummary({ eventId, onBack }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/events/${eventId}/summary/`)
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
        style={{ background: 'var(--border)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', color: 'var(--text)' }}
      >
        ⬅️ Tornar al llistat
      </button>

      <header style={{ background: 'var(--accent)', color: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{color: 'black', margin: 0, fontSize: '20px' }}>📊 Estat de la Convocatòria</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Confirmats totals: <strong>{summary.total_confirmed}</strong></p>
      </header>

      {/* 1. BALANÇ MIXTE */}
      <section style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '15px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '5px', color: 'var(--text-h)' }}>👫 Balanç Mixte</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px', color: 'var(--text)' }}>
          <div>🔹 Nois: <strong>{summary.sex_balance["Home"]}</strong></div>
          <div>🔸 Noies: <strong>{summary.sex_balance["Dona"]}</strong></div>
        </div>
      </section>

      {/* 2. COMPTADOR DE POSICIONS */}
      <section style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '15px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '5px', color: 'var(--text-h)' }}>🏐 Posicions Cobertes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          {Object.entries(summary.position_balance).map(([position, quantity]) => (
            <div key={position} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
              <span>{position}:</span>
              <span style={{ fontWeight: 'bold', color: quantity > 0 ? 'darkgreen' : 'var(--accent)' }}>{quantity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Espai reservat per a les alineacions en el futur */}
      <div style={{ background: 'var(--code-bg)', border: '1px dashed var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'var(--text)', fontSize: '13px' }}>
        🛠️ <em>Espai per a la planificació de la tècnica i alineacions (Properament)</em>
      </div>

    </div>
  );

}

export default EventSummary;