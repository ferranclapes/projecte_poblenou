import { useState } from 'react';
import axios from 'axios';
import { theme } from '../styles.js';
import API_URL from '../services/api.js';

function PasswordForm({onCancel}) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (newPassword !== confirmNewPassword) {
        setErrorMessage("❌ Les noves contrasenyes no coincideixen.");
        return;
        }

        if (newPassword.length < 5) {
        setErrorMessage("❌ La nova contrasenya ha de tenir almenys 5 caràcters.");
        return;
        }

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        const payload = {
            current_password: currentPassword,
            new_password: newPassword
        }

        axios.post(`${API_URL}/players/${userId}/change-password`, payload, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        })
        .then(() => {
        alert("✅ Contrasenya canviada correctament!");
        setNewPassword('');
        setConfirmNewPassword('');
        setCurrentPassword('');
        onCancel();
        })
        .catch(error => {
        console.error('Error changing password:', error);
        if (error.response && error.response.data && error.response.data.detail) {
                setErrorMessage(error.response.data.detail);
        } else {
                setErrorMessage('❌ Error al canviar la contrasenya. Comprova que l’actual sigui correcta.');
        }
        });
    };

    return (
        <div style={theme.form_overlay} onClick={onCancel}>
            <div style={theme.form_container} onClick={(e) => e.stopPropagation()}>
                <h2 style={theme.form_title}>{"Canvia la Contrassenya"}</h2>
                {errorMessage && (
                    <div style={{ background: 'var(--accent-bg)', color: 'var(--accent)', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                        ⚠️ {errorMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{...theme.form_content, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <label style={theme.form_label}>Contrasenya actual:</label>
                    <input style={{width: '70%'}}
                        type="text" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                    <label style={theme.form_label}>Nova contrassenya:</label>
                    <input style={{width: '70%'}}
                        type="text" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <label style={theme.form_label}>Confirma la nova contrassenya:</label>
                    <input style={{width: '70%'}}
                        type="text" 
                        value={confirmNewPassword} 
                        onChange={(e) => setConfirmNewPassword(e.target.value)} 
                        required
                    />
                    <div style={theme.form_button_container}>
                        <button type="submit" style={theme.btnPrimary}>Canviar contrassenya</button>
                        <button type="button" onClick={onCancel} style={theme.btnSecondary}>Cancel·la</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default PasswordForm;