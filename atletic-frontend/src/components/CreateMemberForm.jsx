import { useState, useEffect } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';

function CreateMemberForm({onMemberCreated, logo, onOpenMenu}) {
    const [name, setName] = useState('');
    const [surname1, setSurname1] = useState('');
    const [surname2, setSurname2] = useState('');
    const [preferedName, setPreferedName] = useState('');
    const [pronouns, setPronouns] = useState('Ell');
    
    const [sex, setSex] = useState('Home');
    const [mainPosition, setMainPosition] = useState('Punta');
    const [secondaryPosition, setSecondaryPosition] = useState('-');
    const [role, setRole] = useState('jugador');

    const [errorMessage, setErrorMessage] = useState('');

    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');

    useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/teams', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        setTeams(response.data);
        if(response.data.length > 0) {
            setSelectedTeam(response.data[0].id);
        }
        })
    .catch(error => console.error("Error al obtenir els equips:", error));
  }, []);
  const handleRoleChange = (newRole) => {
        setRole(newRole);
        if (newRole === 'jugador' && teams.length > 1) {
            // Si passa a jugador i en tenia molts, deixem només el primer
            setSelectedTeam([teams[0].id]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        const formattedTeamIds = role === 'jugador'
            ? [Number(selectedTeam)]
            : teams.map(t => t.id);

        const payload = {
            name: name,
            surname1: surname1,
            surname2: surname2,
            prefered_name: preferedName,
            pronouns: pronouns,

            sex: sex,
            main_position: mainPosition,
            secondary_position: secondaryPosition ? secondaryPosition : null,

            role: role,

            team_ids: formattedTeamIds,

            password: preferedName+surname1
        }

        axios.post('http://127.0.0.1:8000/players', payload,{
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            console.log("Jugador creat correctament:", response.data);
        })
        .then(() => {
            alert('Registre completat amb èxit!');
            onMemberCreated();
        })
        .catch(error => {
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (typeof data.detail === 'string') {
                    setErrorMessage(error.response.data.detail);
                } else if (Array.isArray(data.detail) && data.detail[0] && data.detail[0].msg) {
                    setErrorMessage(data.detail[0].msg);
                } else if (data.message) {
                    setErrorMessage(data.message);
                } else {
                    setErrorMessage('Les dades introduïdes no tenen un format correcte.');
                }
            } else {
                setErrorMessage('Error desconegut al registrar el jugador.');
            }
        });
    };

    return (
        <div>
            <div style={theme.teamSummary_header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <img src={logo} alt="Logo" style={theme.teamSummary_logo} /> 
                    <h1 style={theme.teamSummary_header_title}>Crear nou membre</h1>
                </div>
                <button onClick={onOpenMenu} style={theme.teamSummary_menu_button}>
                ☰
                </button>
            </div>

            <form onSubmit={handleSubmit} style={theme.teamSummary_player_list_container}>
                {errorMessage && (
                    <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                        ⚠️ {errorMessage}
                    </div>
                )}

                <h3 style={{ margin: '10px 0 5px 0', color: '#ff3131', fontSize: '18px' }}>Informació Personal</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Nom</label>
                        <input type="text" required placeholder="Ex: Ferran" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Nom Preferit</label>
                        <input type="text" placeholder="Ex: Ferran" value={preferedName} onChange={(e) => setPreferedName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>1r Cognom</label>
                        <input type="text" required placeholder="Ex: Clapés" value={surname1} onChange={(e) => setSurname1(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>2n Cognom</label>
                        <input type="text" required placeholder="Ex: Costa" value={surname2} onChange={(e) => setSurname2(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Pronoms</label>
                        <select value={pronouns} onChange={(e) => setPronouns(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                            <option value="Ell">Ell</option>
                            <option value="Elle">Ella</option>
                            <option value="Els">Elle</option>
                            <option value="Altres">Altres</option>
                        </select>
                    </div>
                </div>


                <h3 style={{ margin: '10px 0 5px 0', color: '#ff3131', fontSize: '18px' }}>Informació de Jugador/a</h3>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Rol</label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <select value={role} onChange={(e) => handleRoleChange(e.target.value)} style={{ width: '50%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px' }}>
                        <option value="jugador">Jugador/a</option>
                        <option value="entrenador">Entrenador/a</option>
                    </select>
                </div>

                {role === 'jugador' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Equip</label>
                            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Sexe</label>
                            <select value={sex} onChange={(e) => setSex(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                            <option value="Home">Home</option>
                            <option value="Dona">Dona</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Posició</label>
                            <select value={mainPosition} onChange={(e) => setMainPosition(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                            <option value="Central">Central</option>
                            <option value="Punta">Punta</option>
                            <option value="Oposat">Oposat</option>
                            <option value="Col·locador">Col·locador</option>
                            <option value="Líbero">Líbero</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Posició secundària</label>
                            <select value={secondaryPosition} onChange={(e) => setSecondaryPosition(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                            <option value="-">-</option>
                            <option value="Central">Central</option>
                            <option value="Punta">Punta</option>
                            <option value="Oposat">Oposat</option>
                            <option value="Col·locador">Col·locador</option>
                            <option value="Líbero">Líbero</option>
                            </select>
                        </div>
                    </div>
                )}

                <button type="submit" style={{ background: '#ff3131', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}>
                Crear Membre
                </button>
            </form>
        </div>
    );
}
export default CreateMemberForm;