import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/';
import { theme } from '../styles.js';
import API_URL from '../services/api.js';


function TeamSummary({logo, onOpenMenu}) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlayerId, setExpandedPlayerId] = useState(null);
    const [expandedSection, setExpandedSection] = useState({});
    const [editingPermission] = useState((localStorage.getItem('is_admin') === 'true' || localStorage.getItem('role') === 'entrenador') ? true : false);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [availableTeams, setAvailableTeams] = useState([]);
    const [positions, setPositions] = useState([]);
    const [roles, setRoles] = useState([]);

    const toggleSelection = (sectionKey) => {
        setExpandedSection(prevState => ({
            ...prevState,
            [sectionKey]: !prevState[sectionKey]
        }));
    }

    const togglePlayerDetails = (playerId) => {
        setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
    };

    const fetchPlayers = () => {
        axios.get(`${API_URL}/players`)
        .then(response => {
            setPlayers(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching players:', error);
            setLoading(false);
        });
    }

    const fetchTeams = () => {
        axios.get(`${API_URL}/teams`)
            .then(response => {
                setAvailableTeams(response.data);
            })
            .catch(error => {
                console.error('Error carregant equips:', error);
            });
    };

    useEffect(() => {
        fetchPlayers();
        fetchTeams();
        axios.get(`${API_URL}/utils/enums`)
            .then(response => {
                setPositions(response.data.positions);
                setRoles(response.data.roles);
            })
            .catch(error => {
                console.error('Error fetching enums:', error);
            });
    }, []);

    const startEditing = (playerId, field, currentValue) => {
        setEditingCell({ playerId, field });
        if (field === 'teams') {
            setEditValue(currentValue && currentValue.length > 0 ? currentValue[0] : '');
        } else {
            setEditValue(currentValue ?? '');
        }
    };

    const saveFieldUpdate = (playerId) => {
        const token = localStorage.getItem('token');
        const { field } = editingCell;

        if (field === 'teams') {
            axios.put(`${API_URL}/players/${playerId}/teams`, { team_ids: editValue }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(() => {
                setEditingCell(null);
                fetchPlayers();
            })
            .catch(error => {
                console.error('Error updating player teams:', error);
            });
            return;
        }

        let payload = {};
        payload[field] = editValue;

        axios.patch(`${API_URL}/players/${playerId}`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setEditingCell(null);
            fetchPlayers();
        })
        .catch(error => {
            console.error('Error updating player:', error);
        });
    }

    const saveFieldUpdateWithCustomValue = (playerId, customTeamsArray) => {
        const token = localStorage.getItem('token');
        
        axios.put(`${API_URL}/players/${playerId}/teams`, { team_ids: customTeamsArray }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
            setEditingCell(null);
            fetchPlayers();
        })
        .catch(error => console.error('Error updating player teams:', error));
    };
    
    if (loading) return <p>Carregant la plantilla de l'equip...</p>

    const coachesGroup = players.filter(player => player.role === 'entrenador');

    const teamGroups = availableTeams.map(team => {
        const teamPlayers = players.filter(player => 
            player.role !== 'entrenador' && player.teams && player.teams.some(t => t.id === team.id)
        );
        return { team, players: teamPlayers };
    });

    const unassignedPlayers = players.filter(player => 
        player.role !== 'entrenador' && (!player.teams || player.teams.length === 0)
    );

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
                {/* --- SECCIÓ D'ENTRENADORS --- */}
                {coachesGroup.length > 0 && (
                    <div style={{marginBottom: '20px'}}>
                        <button
                            onClick={() => toggleSelection('coaches')}
                            style={theme.teamSummary_group_expand_button}
                        >
                            <span>👨‍🏫Entrenadors ({coachesGroup.length})</span>
                            <span>{expandedSection['coaches'] ? '▲ ' : '▼ '}</span>
                        </button>

                        {expandedSection['coaches'] && (
                            <div style={theme.teamSummary_section_content}>
                                {coachesGroup.map(player => (renderUserCard(player)))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- SECCIÓ D'EQUIPS --- */}
                {teamGroups.map(({ team, players: teamPlayers }) => {
                    const storedTeamIds = JSON.parse(localStorage.getItem('team_ids')) || [];
                    const isAdmin = localStorage.getItem('is_admin') === 'true';

                    if (!isAdmin && !storedTeamIds.includes(team.id)) {
                        return null;
                    }

                    return (
                        <div key={team.id} style={{marginBottom: '20px'}}>
                            <button
                                onClick={() => toggleSelection(team.id)}
                                style={theme.teamSummary_group_expand_button}
                            >
                                <span>🏐 {team.name} {team.category ? `(${team.category})` : ''} ({teamPlayers.length})</span>
                                <span>{expandedSection[team.id] ? '▲ ' : '▼ '}</span>
                            </button>

                            {expandedSection[team.id] && (
                                <div style={theme.teamSummary_section_content}>
                                    {teamPlayers.map(player => (renderUserCard(player)))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* --- SECCIÓ DE JUGADORS NO ASSIGNATS --- */}
                {unassignedPlayers.length > 0 && (
                    <div style={{marginBottom: '20px'}}>
                        <button
                            onClick={() => toggleSelection('unassigned')}
                            style={theme.teamSummary_group_expand_button}
                        >
                            <span>Jugadors sense equip assignat ({unassignedPlayers.length})</span>
                            <span>{expandedSection['unassigned'] ? '▲ ' : '▼ '}</span>
                        </button>

                        {expandedSection['unassigned'] && (
                            <div style={theme.teamSummary_section_content}>
                                {unassignedPlayers.map(player => (renderUserCard(player)))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    function renderUserCard(player) {
        const isExpanded = expandedPlayerId === player.id;
        const isEditing = (field) => editingCell?.playerId === player.id && editingCell?.field === field;

        return(
            <div key={player.id} style={{ ...theme.teamSummary_player_continer, width: '100%', boxSizing: 'border-box' }}>
                <button onClick={() => togglePlayerDetails(player.id)} style={theme.teamSummary_player_expand_button}>
                    {isExpanded ? '▲ ' : '▼ '} {player.prefered_name ? player.prefered_name : player.name} {player.surname1} {player.surname2}
                </button>

                <div style={{...theme.teamSummary_detail_container, gridTemplateRows: isExpanded ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}>
                    <div style={{...theme.teamSummary_detail_container, padding: 0, width: '100%', minHeight: 0}}>

                        {/* Posició Principal */}
                        <div style={theme.teamSummary_detail_row}>
                            {isEditing('main_position') ? (
                                <div style={theme.teamSummary_edit_detail_container}>
                                    <div>
                                        <strong>Posició Principal:</strong>
                                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                                            {positions.filter(pos => pos.value !== '-').map(pos => <option key={pos.value} value={pos.value} style={theme.teamSummary_select_input_option}>{pos.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <button onClick={() => saveFieldUpdate(player.id)} style={theme.teamSummary_edit_detail_button}>💾</button>
                                        <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div><strong>Posició Principal:</strong> {player.main_position}</div>
                                    {editingPermission && <button onClick={() => startEditing(player.id, 'main_position', player.main_position)} style={theme.teamSummary_edit_detail_button}>✏️</button>}
                                </>
                            )}
                        </div>

                        {/* Posició Secundària */}
                        <div style={theme.teamSummary_detail_row}>
                            {isEditing('secondary_position') ? (
                                <div style={theme.teamSummary_edit_detail_container}>
                                    <div>
                                        <strong>Posició Secundària:</strong>
                                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                                            {positions.map(pos => <option key={pos.value} value={pos.value} style={theme.teamSummary_select_input_option}>{pos.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <button onClick={() => saveFieldUpdate(player.id)} style={theme.teamSummary_edit_detail_button}>💾</button>
                                        <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div><strong>Posició Secundària:</strong> {player.secondary_position || 'No assignada'}</div>
                                    {editingPermission && <button onClick={() => startEditing(player.id, 'secondary_position', player.secondary_position)} style={theme.teamSummary_edit_detail_button}>✏️</button>}
                                </>
                            )}
                        </div>

                        {/* Sexe */}
                        <div style={theme.teamSummary_detail_row}>
                            <div><strong>Sexe:</strong> {player.sex}</div>
                        </div>

                        {/* Equips */}
                        <div style={theme.teamSummary_detail_row}>
                            {isEditing('teams') ? (
                                <div style={theme.teamSummary_edit_detail_container}>
                                    <div>
                                        <strong>Equip:</strong>
                                        <select 
                                            value={editValue} 
                                            onChange={(e) => setEditValue(e.target.value)}
                                            style={theme.teamSummary_select_input_team}
                                        >
                                            <option value="">Sense equip assignat</option>
                                            {availableTeams.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} {t.category ? `(${t.category})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        {/* Enviem un array amb l'ID seleccionat (o buit si no s'ha triat res) */}
                                        <button 
                                            onClick={() => {
                                                // Modificuem temporalment l'editValue a array només per a la petició si cal, 
                                                // o ho gestionem directament enviant [Number(editValue)]
                                                const payloadValue = editValue ? [Number(editValue)] : [];
                                                // Trucar directament a saveFieldUpdate passant l'array convertit
                                                saveFieldUpdateWithCustomValue(player.id, payloadValue);
                                            }} 
                                            style={theme.teamSummary_edit_detail_button}
                                        >
                                            💾
                                        </button>
                                        <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div><strong>Equip:</strong> {player.teams && player.teams.length > 0 ? player.teams.map(t => t.name).join(', ') : 'No assignats'}</div>
                                    {editingPermission && player.role !== 'entrenador' && (
                                        <button onClick={() => startEditing(player.id, 'teams', player.teams ? player.teams.map(t => t.id) : [])} style={theme.teamSummary_edit_detail_button}>✏️</button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Rol */}
                        <div style={theme.teamSummary_detail_row}>
                            {isEditing('role') ? (
                                <div style={theme.teamSummary_edit_detail_container}>
                                    <div>
                                        <strong>Rol:</strong>
                                        <select value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                                            {roles.map(r => <option key={r.value} value={r.value} style={theme.teamSummary_select_input_option}>{r.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <button onClick={() => saveFieldUpdate(player.id)} style={theme.teamSummary_edit_detail_button}>💾</button>
                                        <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div><strong>Rol:</strong> {player.role}</div>
                                    {editingPermission && <button onClick={() => startEditing(player.id, 'role', player.role)} style={theme.teamSummary_edit_detail_button}>✏️</button>}
                                </>
                            )}
                        </div>

                        {/* Accés Admin */}
                        <div style={theme.teamSummary_detail_row}>
                            {isEditing('is_admin') ? (
                                <div style={theme.teamSummary_edit_detail_container}>
                                    <div>
                                        <strong>Accés Admin:</strong>
                                        <input type="checkbox" checked={Boolean(editValue)} onChange={(e) => setEditValue(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                    </div>
                                    <div>
                                        <button onClick={() => saveFieldUpdate(player.id)} style={theme.teamSummary_edit_detail_button}>💾</button>
                                        <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div><strong>Accés Admin:</strong> {player.is_admin ? 'Sí' : 'No'}</div>
                                    {editingPermission && <button onClick={() => startEditing(player.id, 'is_admin', player.is_admin)} style={theme.teamSummary_edit_detail_button}>✏️</button>}
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default TeamSummary;