import {theme} from '../styles.js';

function SideMenu({ isOpen, onClose, onLogout }) {
  // Si no està obert, directament no dibuixem res a la pantalla (retornem null)
    const transformStyle = isOpen ? 'translateX(0)' : 'translateX(-290px)';

  return (
    <>
      {isOpen && (
        <div style={theme.overlay} onClick={onClose} />
      )}

      {/* 2. El contenidor del menú lateral (la barra que surt) */}
      <div style={{ ...theme.sideMenu_container, transform: transformStyle }}>
        <div style={theme.sideMenu_header}>
            <h2 style={theme.sideMenu_title}>Menú</h2>
        </div>

        {/* El contingut està buit per ara */}
        <div style={{ padding: '10px 15px 0 15px', display: 'flex', flexDirection: 'column'}}>
            <button style= {theme.sideMenu_button} onClick={onClose}>
            Això és un botó
            </button>
            <button style= {theme.sideMenu_button} onClick={onClose}>
            Això és un botó
            </button>
            <button style= {theme.sideMenu_button} onClick={onLogout}>
            Tancar sessió
            </button>
        </div>

      </div>
    </>
  );
}

export default SideMenu;