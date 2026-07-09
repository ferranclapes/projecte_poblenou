import { useState } from 'react';
import axios from 'axios';

function RegisterForm({ onCancel, onRegisterSuccess }) {
    const [name, setName] = useState('');
    const [surname1, setSurname1] = useState('');
    const [surname2, setSurname2] = useState('');
    const [preferedName, setPreferedName] = useState('');
    const [pronouns, setPronouns] = useState('Ell');
    
    const [sex, setSex] = useState('Home');
    const [mainPosition, setMainPosition] = useState('Punta');
    const [secondaryPosition, setSecondaryPosition] = useState('Punta');

    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        const payload = {
            name: name,
            surname1: surname1,
            surname2: surname2,
            prefered_name: preferedName,
            pronouns: pronouns,

            sex: sex,
            main_position: mainPosition,
            secondary_position: secondaryPosition ? secondaryPosition : null,

            role: 'jugador',

            password: password
        }

        axios.post('http://127.0.0.1:8000/players/', payload)
        .then(() => {
            alert('Registre completat amb èxit! Ara pots iniciar sessió.');
            onRegisterSuccess();
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' }}>
            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#0070f3' }}>📝 Nou Jugador</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Uneix-te a la plantilla de l'Atlètic Poblenou</p>
                </div>

                {errorMessage && (
                    <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                        ⚠️ {errorMessage}
                    </div>
                )}

                <h3 style={{ margin: '10px 0 5px 0', color: '#0070f3', fontSize: '14px' }}>Informació Personal</h3>
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


                <h3 style={{ margin: '10px 0 5px 0', color: '#0070f3', fontSize: '14px' }}>Informació de Jugador/a</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                        <option value="Central">Central</option>
                        <option value="Punta">Punta</option>
                        <option value="Oposat">Oposat</option>
                        <option value="Col·locador">Col·locador</option>
                        <option value="Líbero">Líbero</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px', color: '#333' }}>Contrasenya</label>
                    <input type="password" required placeholder="Minim 6 caràcters" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ background: '#0070f3', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}>
                Registrar-me 🏐
                </button>

                <button type="button" onClick={onCancel} style={{ background: 'none', color: '#0070f3', border: 'none', padding: '5px', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
                Tornar al Login
                </button>

            </form>
        </div>
    );
}
export default RegisterForm;