import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';

const POSITIONS = ["Col·locador", "Central", "Punta", "Oposat", "Líbero"];
const ROLES = [{ label: "Jugador/a", value: "jugador" }, { label: "Entrenador/a", value: "entrenador" }];

function TeamSummary({logo, onOpenMenu}) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlayerId, setExpandedPlayerId] = useState(null);
    const [editingPermission] = useState((localStorage.getItem('is_admin') === 'true' || localStorage.getItem('role') === 'coach') ? true : false);
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [availableTeams, setAvailableTeams] = useState([]);

    const togglePlayerDetails = (playerId) => {
        setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
    };

    const fetchPlayers = () => {
        axios.get('http://127.0.0.1:8000/players')
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
        axios.get('http://127.0.0.1:8000/teams')
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
    }, []);

    const startEditing = (playerId, field, currentValue) => {
        setEditingCell({ playerId, field });
        if (field === 'teams') {
            setEditValue(currentValue || []);
        } else {
            setEditValue(currentValue ?? '');
        }
    };

    const saveFieldUpdate = (playerId) => {
        const token = localStorage.getItem('token');
        const { field } = editingCell;

        if (field === 'teams') {
            axios.put(`http://127.0.0.1:8000/players/${playerId}/teams`, { team_ids: editValue }, {
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

        axios.patch(`http://127.0.0.1:8000/players/${playerId}`, payload, {
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

                    const isEditing = (field) => editingCell?.playerId === player.id && editingCell?.field === field;

                    return (
                        <div key={player.id} style={theme.teamSummary_player_continer}>
                            <button onClick={() => togglePlayerDetails(player.id)} style={theme.teamSummary_player_expand_button}>
                                {isExpanded ? '▲ ' : '▼ '} {player.prefered_name ? player.prefered_name : player.name} {player.surname1} {player.surname2}
                            </button>

                            <div style={{...theme.teamSummary_detail_container, gridTemplateRows: isExpanded ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}>

                                <div style={{...theme.teamSummary_detail_container, padding: 0, width: '100%', minHeight: 0}}>

                                <div style={theme.teamSummary_detail_row}>
                                    {isEditing('main_position') ? (
                                        <div style={theme.teamSummary_edit_detail_container}>
                                            <div>
                                                <strong>Posició Principal:</strong>
                                            <select value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                                                {POSITIONS.map(pos => <option key={pos} value={pos} style={theme.teamSummary_select_input_option}>{pos}</option>)}
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
                                            {editingPermission && (
                                                <button onClick={() => startEditing(player.id, 'main_position', player.main_position)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    {isEditing('secondary_position') ? (
                                        <div style={theme.teamSummary_edit_detail_container}>
                                            <div>
                                                <strong>Posició Secundària:</strong>
                                            <select value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                                                {POSITIONS.map(pos => <option key={pos} value={pos} style={theme.teamSummary_select_input_option}>{pos}</option>)}
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
                                            {editingPermission && (
                                                <button onClick={() => startEditing(player.id, 'secondary_position', player.secondary_position)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    <div>
                                        <strong>Sexe:</strong> {player.sex}
                                    </div>
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    {isEditing('teams') ? (
                                        <div style={theme.teamSummary_edit_detail_container}>
                                            <div style={{display: 'flex', alignContent: 'flex-start'}}>
                                                <strong>Equips:</strong>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px'}}>
                                                    {availableTeams.map(t => {
                                                        // Comprovem si l'equip ja està seleccionat
                                                        const isChecked = Array.isArray(editValue) && editValue.includes(t.id);

                                                        return (
                                                            <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setEditValue([...editValue, t.id]);
                                                                        } else {
                                                                            setEditValue(editValue.filter(id => id !== t.id));
                                                                        }
                                                                    }}
                                                                />
                                                                {t.name} {t.category ? `(${t.category})` : ''}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                                <button onClick={() => saveFieldUpdate(player.id)} style={theme.teamSummary_edit_detail_button}>💾</button>
                                                <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <strong>Equips:</strong>{' '}
                                                {player.teams && player.teams.length > 0
                                                    ? player.teams.map(t => t.name).join(', ')
                                                    : 'No assignats'}
                                            </div>
                                            {editingPermission && (
                                                <button 
                                                    onClick={() => {
                                                        // 🚀 Passem un array pur amb els IDs [1, 2] per als checkboxes
                                                        const currentTeamIds = player.teams ? player.teams.map(t => t.id) : [];
                                                        startEditing(player.id, 'teams', currentTeamIds);
                                                    }} 
                                                    style={theme.teamSummary_edit_detail_button}
                                                >
                                                    ✏️
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    {isEditing('role') ? (
                                        <div style={theme.teamSummary_edit_detail_container}>
                                            <div>
                                                <strong>Rol:</strong>
                                            <select value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                                                {ROLES.map(r => <option key={r.value} value={r.value} style={theme.teamSummary_select_input_option}>{r.label}</option>)}
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
                                            {editingPermission && (
                                                <button onClick={() => startEditing(player.id, 'role', player.role)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div style={theme.teamSummary_detail_row}>
                                    {isEditing('is_admin') ? (
                                        <div style={theme.teamSummary_edit_detail_container}>
                                            <div>
                                                <strong>Accés Admin:</strong>
                                            <input 
                                                type="checkbox" 
                                                checked={Boolean(editValue)} 
                                                onChange={(e) => setEditValue(e.target.checked)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            </div>
                                            <div>
                                            <button onClick={() => saveFieldUpdate(player.id)} style={theme.teamSummary_edit_detail_button}>💾</button>
                                            <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div><strong>Accés Admin:</strong> {player.is_admin ? 'Sí' : 'No'}</div>
                                            {editingPermission && (
                                                <button onClick={() => startEditing(player.id, 'is_admin', player.is_admin)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                                            )}
                                        </>
                                    )}
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