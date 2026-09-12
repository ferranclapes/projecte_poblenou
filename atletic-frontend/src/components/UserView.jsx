import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';

function UserView({ logo, onOpenMenu}) {
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [player, setPlayer] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');

        if (userId) {
            axios.get(`http://127.0.0.1:8000/players/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => setPlayer(response.data))
            .catch(error => console.error("Error carregant el perfil:", error));
        }
    }, []);

    const startEditing = (filed, currentValue) => {
        setEditingCell(filed);
        setEditValue(currentValue);
    }
    
    const saveFieldUpdate = () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        const payload = { [editingCell]: editValue };

        axios.patch(`http://127.0.0.1:8000/players/${userId}`, payload, {
            headers: {
                'Authorization': `Bearer ` + token
            }
        })
        .then(() => {
            // Actualitzem l'estat localment per veure el canvi a l'instant
            setPlayer(prev => ({ ...prev, [editingCell]: editValue }));
            setEditingCell(null);
            alert("✅ Informació actualitzada correctament!");
        })
        .catch(error => {
            console.error("Error actualitzant la informació de l'usuari:", error);
            alert("❌ Error actualitzant la informació. Si us plau, torna-ho a intentar.");
        });
    }

    return(
        <div>
            <div style={theme.teamSummary_header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <img src={logo} alt="Logo" style={theme.teamSummary_logo} /> 
                    <h1 style={theme.teamSummary_header_title}>Gestió del perfil</h1>
                </div>
                <button onClick={onOpenMenu} style={theme.teamSummary_menu_button}>
                ☰
                </button>
            </div>

            <div style={theme.userProfile_container}>
                <h3 style={{margin: '10px 0 5px 0', color: '#ff3131', fontSize: '20px'}}>Informació personal</h3>
                <div style={{...theme.teamSummary_detail_row, marginBottom: '5px'}}>
                    {editingCell === 'name' ? (
                        <div style={theme.teamSummary_edit_detail_container}>
                            <div>
                                <strong>Nom:</strong>
                                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}></input>
                            </div>
                            <div>
                                <button onClick={() => saveFieldUpdate()} style={theme.teamSummary_edit_detail_button}>💾</button>
                                <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div><strong>Nom:</strong> {player.name}</div>
                        <button onClick={() => startEditing("name", player.name)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                    </>
                    )}
                </div>
                <div style={{...theme.teamSummary_detail_row, marginBottom: '5px'}}>
                    {editingCell === 'surname1' ? (
                        <div style={theme.teamSummary_edit_detail_container}>
                            <div>
                                <strong>1r Cognom:</strong>
                                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}></input>
                            </div>
                            <div>
                                <button onClick={() => saveFieldUpdate()} style={theme.teamSummary_edit_detail_button}>💾</button>
                                <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div><strong>1r Cognom:</strong> {player.surname1}</div>
                        <button onClick={() => startEditing("surname1", player.surname1)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                    </>
                    )}
                </div>
                <div style={{...theme.teamSummary_detail_row, marginBottom: '5px'}}>
                    {editingCell === 'surname2' ? (
                        <div style={theme.teamSummary_edit_detail_container}>
                            <div>
                                <strong>2n Cognom:</strong>
                                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}></input>
                            </div>
                            <div>
                                <button onClick={() => saveFieldUpdate()} style={theme.teamSummary_edit_detail_button}>💾</button>
                                <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div><strong>2n Cognom:</strong> {player.surname2}</div>
                        <button onClick={() => startEditing("surname2", player.surname2)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                    </>
                    )}
                </div>
                <div style={{...theme.teamSummary_detail_row, marginBottom: '5px'}}>
                    {editingCell === 'pronouns' ? (
                        <div style={theme.teamSummary_edit_detail_container}>
                            <div>
                                <strong>Pronoms:</strong>
                                <select value={editValue} onChange={(e) => setEditValue(e.target.value)}>
                                    <option value="Ell">Ell</option>
                                    <option value="Ella">Ella</option>
                                    <option value="Elle">Elle</option>
                                    <option value="Altres">Altres</option>
                                </select>
                            </div>
                            <div>
                                <button onClick={() => saveFieldUpdate()} style={theme.teamSummary_edit_detail_button}>💾</button>
                                <button onClick={() => setEditingCell(null)} style={theme.teamSummary_edit_detail_button}>❌</button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div><strong>Pronoms:</strong> {player.pronouns}</div>
                        <button onClick={() => startEditing("pronouns", player.pronouns)} style={theme.teamSummary_edit_detail_button}>✏️</button>
                    </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserView;