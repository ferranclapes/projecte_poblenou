import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';

function UserSearcher({logo, onOpenMenu}) {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetPasswordPermision] = useState((localStorage.getItem('is_admin') === 'true' ? true : false));

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8000/players', {
            headers: {'Authorization': `Bearer ${token}`}
        })
        .then(response => {
            setUsers(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching users: ', error);
            setLoading(false);
        })
    }, [])

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const fullName = `${user.name} ${user.surname1} ${user.surname2}`.toLowerCase();
        const preferedName = user.prefered_name ? user.prefered_name.toLowerCase() : '';

        return fullName.includes(query) || preferedName.includes(query);
    });

    if (loading) { return <p>Carregant jugadors...</p>; }

    return (
        <div>
            <div style={theme.teamSummary_header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logo} alt="Logo" style={theme.teamSummary_logo} /> 
                    <h1 style={theme.teamSummary_header_title}>Cercador de Jugadors</h1>
                </div>
                <button onClick={onOpenMenu} style={theme.teamSummary_menu_button}>
                    ☰
                </button>
            </div>

            <div style={theme.teamSummary_player_list_container}>
                
                {/* Barra de cerca */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Busca per nom o cognom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '15px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Resultats de la cerca */}
                {filteredUsers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filteredUsers.map(player => {
                            const displayName = player.prefered_name !== player.name && localStorage.getItem('role') === 'entrenador' ? `${player.prefered_name} (${player.name})` : player.prefered_name;
                            const teamNames = player.teams && player.teams.length > 0 
                                ? player.teams.map(t => t.name).join(', ') 
                                : 'Sense equip';
                            const positions = player.secondary_position !== "-" ? `${player.main_position}, ${player.secondary_position}` : player.main_position;

                            return (
                                <div key={player.id} style={{ ...theme.teamSummary_player_continer, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333' }}>
                                            {displayName} {player.surname1} {player.surname2}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                            <strong>Posició:</strong> {positions} | <strong>Equip:</strong> {teamNames} | <strong>Rol:</strong> {player.role}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: player.role === 'entrenador' ? '#333' : '#ff3131', color: '#fff', fontWeight: 'bold' }}>
                                        {player.role.toUpperCase()}
                                    </span>
                                    {resetPasswordPermision && (
                                        <span>
                                        <button style={{...theme.btnSecondary, marginTop: '8px'}} onClick={() => {
                                            if (window.confirm(`Segur que vols reiniciar la contrasenya de ${displayName}?`)) {
                                                const token = localStorage.getItem('token');
                                                axios.post(`http://localhost:8000/players/${player.id}/reset-password`, {}, {
                                                    headers: {'Authorization': `Bearer ${token}`}
                                                })
                                                .then(response => {
                                                    alert(`${response.data.message}`);
                                                })
                                                .catch(error => {
                                                    console.error('Error resetting password: ', error);
                                                    alert('S\'ha produït un error en reiniciar la contrasenya.');
                                                });
                                            }
                                        }}>
                                            Reiniciar contrasenya
                                        </button>
                                        <button style={{...theme.btnSecondary, marginTop: '8px', marginLeft: '8px'}} onClick={() => {
                                            if (window.confirm(`Segur que vols eliminar el jugador ${displayName}?`)) {
                                                const token = localStorage.getItem('token');
                                                axios.delete(`http://localhost:8000/players/${player.id}`, {
                                                    headers: {'Authorization': `Bearer ${token}`}
                                                })
                                                .then(response => {
                                                    alert(`${response.data.message}`);
                                                    // Actualitzar la llista de jugadors després d'eliminar
                                                    setUsers(prevUsers => prevUsers.filter(u => u.id !== player.id));
                                                })
                                                .catch(error => {
                                                    console.error('Error deleting player: ', error);
                                                    alert('S\'ha produït un error en eliminar el jugador.');
                                                });
                                            }
                                        }}>
                                            Eliminar jugador
                                        </button>
                                    </span>

                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
                        No s'ha trobat cap jugador amb aquest nom.
                    </p>
                )}

            </div>
        </div>
    )
}
export default UserSearcher;