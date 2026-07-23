import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';

function TeamSummary({logo, onOpenMenu}) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlayerId, setExpandedPlayerId] = useState(null);

    const togglePlayerDetails = (playerId) => {
        setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
    };

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
        <div>
            <div style={theme.teamSummary_header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <img src={logo} alt="Logo" style={theme.teamSummary_logo} /> 
                    <h1 style={theme.teamSummary_header_title}>Gestió de l'Equip</h1>
                </div>
                <button onClick={onOpenMenu} style={theme.teamSummary_menu_button}>
                ☰
                </button>
            </div>

            <div style={theme.teamSummary_player_list_container}>
                {players.map(player => {
                    const isExpanded = expandedPlayerId === player.id;

                    return (
                        <div key={player.id} style={theme.teamSummary_player_continer}>
                            <button onClick={() => togglePlayerDetails(player.id)} style={theme.teamSummary_player_expand_button}>
                                {isExpanded ? '▲ ' : '▼ '} {player.prefered_name ? player.prefered_name : player.name} {player.surname1} {player.surname2}
                            </button>

                            <div style={{...theme.teamSummary_detail_container, gridTemplateRows: isExpanded ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}>

                                <div style={{...theme.teamSummary_detail_container, padding: 0, width: '100%', minHeight: 0}}>

                                <div style={theme.teamSummary_detail_row}>
                                    <div>
                                        <strong>Posició Principal:</strong> {player.main_position}
                                    </div>
                                    <button style={theme.teamSummary_edit_detail_button}>✏️</button>
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    <div>
                                        <strong>Segona Posició:</strong> {player.secondary_position ? player.secondary_position : 'No assignada'}
                                    </div>
                                    <button style={theme.teamSummary_edit_detail_button}>✏️</button>
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    <div>
                                        <strong>Sexe:</strong> {player.sex}
                                    </div>
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    <div>
                                        <strong>Equips:</strong> {player.teams?.join(', ') || 'No assignats'}
                                    </div>
                                    <button style={theme.teamSummary_edit_detail_button}>✏️</button>
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    <div>
                                        <strong>Rol:</strong> {player.role}
                                    </div>
                                    <button style={theme.teamSummary_edit_detail_button}>✏️</button>
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    <div>
                                        <strong>Accés Admin:</strong> {player.is_admin ? 'Sí' : 'No'}
                                    </div>
                                    <button style={theme.teamSummary_edit_detail_button}>✏️</button>
                                </div>

                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
export default TeamSummary;