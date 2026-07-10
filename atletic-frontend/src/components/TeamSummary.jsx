import { useState, useEffect } from 'react';
import axios from 'axios';

function TeamSummary({onBack}) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlayers = () => {
        axios.get('http://127.0.0.1:8000/players/')
        .then(response => {
            setPlayers(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching players:', error);
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handlePermissionChange = (playerId, newRole, isAdmin) => {
        const token = localStorage.getItem('token');

        axios.patch(`http://127.0.0.1:8000/players/${playerId}/permissions/`, {
            role: newRole,
            is_admin: isAdmin
        }, {
            headers: {'Authorization': `Bearer ${token}`}
        })
        .then(()=>{
            alert('⚙️ Permisos actualitzats correctament!');
            fetchPlayers();
        })
        .catch(error => {
            alert(error.response?.data?.detail || "No s'han pogut canviar els permisos.");
        });
    };

    if (loading) return <p>Carregant la plantilla de l'equip...</p>

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <button 
                onClick={onBack}
                style={{ background: 'var(--border)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', color: 'var(--text)' }}
            >
                ⬅️ Tornar al llistat
            </button>
            <h3 style={{ marginTop: 0, color: '#333' }}>📋 Gestió de la Plantilla i Permisos</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                Com a administrador, aquí pots ascendir jugadors a l'staff tècnic o concedir permisos de gestió.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', background: '#f9f9f9' }}>
                        <th style={{ padding: '12px' }}>Jugador/a</th>
                        <th style={{ padding: '12px' }}>Posició Principal</th>
                        <th style={{ padding: '12px' }}>Rol</th>
                        <th style={{ padding: '12px' }}>Accés Admin</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map(player => (
                        <tr key={player.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{player.name} {player.surname1}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ background: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                {player.main_position}
                                </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                                {localStorage.getItem('is_admin') === 'true' ? (
                                    // Desplegable per canviar el rol del jugador
                                    <select
                                    value={player.role}
                                    onChange={(e) => handlePermissionChange(player.id, e.target.value, player.is_admin)}
                                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                                    >
                                        <option value="jugador">Jugador/a</option>
                                        <option value="entrenador">Entrenador/a</option>
                                    </select>
                                ) : (
                                    <span style={{ 
                                    background: player.role === 'Coach' || player.role === 'Admin' ? '#e8f5e9' : '#f5f5f5', 
                                    color: player.role === 'Coach' || player.role === 'Admin' ? '#2e7d32' : '#666', 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '13px',
                                    fontWeight: '500'
                                    }}>
                                    {player.role}
                                    </span>
                                )}
                            </td>    
                            
                            <td style={{ padding: '12px' }}>
                                {localStorage.getItem('is_admin') === 'true' ? (
                                    //Checkbox per fer-lo Admin de l'app 
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={player.is_admin} 
                                        onChange={(e) => handlePermissionChange(player.id, player.role, e.target.checked)}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    {player.is_admin ? '👑 Si' : '❌ No'}
                                    </label>
                                ) :(
                                    <span style={{ fontSize: '14px'}}>
                                        {player.is_admin ? '👑 Si' : '❌ No'}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TeamSummary;