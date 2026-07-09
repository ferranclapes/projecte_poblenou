import { useState } from 'react';
import axios from 'axios';

function LoginForm({ onLoginSuccess }) {
    const [name, setName] = useState('');
    const [surname1, setSurname1] = useState('');
    const [surname2, setSurname2] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        setUsername(`${name.toLowerCase()}_${surname1.toLowerCase()}_${surname2.toLowerCase()}`);

        axios.post('http://127.0.0.1:8000/auth/login/', { username, password })
        .then(response => {
            const data = response.data;

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('is_admin', data.is_admin);
            localStorage.setItem('user_id', data.player_id);
            localStorage.setItem('username', data.player_username);
            localStorage.setItem('prefered_name', data.prefered_name);

            onLoginSuccess();
        })
        .catch(error => {
            if (error.response && error.response.data && error.response.data.detail) {
                setErrorMessage(error.response.data.detail);
            } else {
                setErrorMessage('Error desconegut. Torna-ho a provar.');
            }
        });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <form onSubmit={handleSubmit} style={{ background: 'var(--bg)', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow)', width: '100%', maxWith: '400px', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '350px' }}>

                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h2 style={{ margin: '0 0 5px 0', color: 'var(--accent)' }}>🏐 Atlètic Poblenou</h2>
                    <p style={{ margin: 0, color: 'var(--text)', fontSize: '14px' }}>Inicia sessió per accedir a la teva àrea de jugador</p>
                </div>

                {errorMessage && (
                    <div style={{ background: 'var(--accent-bg)', color: 'var(--accent)', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                        ⚠️ {errorMessage}
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: 'var(--text)' }}>Nom</label>
                    <input 
                        type="name" 
                        required
                        placeholder="Ex: Ferran" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: 'var(--text)' }}>1r Cognom</label>
                    <input 
                        type="surname1" 
                        required
                        placeholder="Ex: Clapés" 
                        value={surname1}
                        onChange={(e) => setSurname1(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: 'var(--text)' }}>2n Cognom</label>
                    <input 
                        type="surname2" 
                        required
                        placeholder="Ex: Costa" 
                        value={surname2}
                        onChange={(e) => setSurname2(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: 'var(--text)' }}>Contrasenya</label>
                <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                />
                </div>

                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>
                Entrar a l'App
                </button>
            </form>
        </div>
    );
}

export default LoginForm;