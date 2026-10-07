import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';
import API_URL from '../services/api.js';

function UserSearcher({logo, onOpenMenu}) {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetPasswordPermision] = useState((localStorage.getItem('is_admin') === 'true' ? true : false));

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/users`, {
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

    if (loading) { return <p>Carregant usuaris...</p>; }

    return (
        <div>
            <div style={theme.teamSummary_header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logo} alt="Logo" style={theme.teamSummary_logo} /> 
                    <h1 style={theme.teamSummary_header_title}>Cercador de Usuaris</h1>
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
                        {filteredUsers.map(user => renderUserCard(user))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
                        No s'ha trobat cap jugador amb aquest nom.
                    </p>
                )}

            </div>
        </div>
    );

    function renderUserCard(user){
        // No mostrar l'usuari si és un administrador
        if (!user || user.user_type === 'Administrador') return;

        const displayName = user.prefered_name !== user.name && localStorage.getItem('user_type') === 'Entrenador' ? `${user.prefered_name} (${user.name})` : user.prefered_name;
        const teamNames = user.teams && user.teams.length > 0 
            ? user.teams.map(t => t.name).join(', ') 
            : 'Sense equip';
        const positions = user.secondary_position !== "-" ? `${user.main_position}, ${user.secondary_position}` : user.main_position;

        return (
            <div key={user.id} style={{ ...theme.teamSummary_player_continer, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333' }}>
                        {displayName} {user.surname1} {user.surname2}
                    </h3>
                    {user.user_type === 'Jugador' &&
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                        <strong>Posició:</strong> {positions} | <strong>Equip:</strong> {teamNames}
                    </p>
                    }
                </div>
                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: user.user_type === 'Entrenador' ? '#333' : '#ff3131', color: '#fff', fontWeight: 'bold' }}>
                    {user.user_type.toUpperCase()}
                </span>
                {resetPasswordPermision && (
                    <span>
                    <button style={{...theme.btnSecondary, marginTop: '8px'}} onClick={() => {
                        if (window.confirm(`Segur que vols reiniciar la contrasenya de ${displayName}?`)) {
                            const token = localStorage.getItem('token');
                            axios.post(`${API_URL}/users/${user.id}/reset-password`, {}, {
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
                            axios.delete(`${API_URL}/users/${user.id}`, {
                                headers: {'Authorization': `Bearer ${token}`}
                            })
                            .then(response => {
                                alert(`${response.data.message}`);
                                // Actualitzar la llista de jugadors després d'eliminar
                                setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
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
    }

}
export default UserSearcher;