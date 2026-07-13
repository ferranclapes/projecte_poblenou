export const theme = {
    // Fons de la pàgina principal
    background: {
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '5000px', 
        margin: '0', 
        background: '#000000', 
        minHeight: '100vh', 
        boxSizing: 'border-box'
    },

    /*==================================================
    =                    USER HEADER                   =
    ==================================================*/

    // Contenidor de la capçalera i el calendari
    headers_container: {
        background: '#ffffff',
        borderRadius: '0 0 30px 30px' // Same as calendar_container for visual consistency
    },

    // Capçalera de l'usuari
    user_header:{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        background: '#ff3131',
        padding: '30px 10px 15px 15px', //top, right, bottom, left
        borderRadius: '0 0 15px 15px',
        boxSizing: 'border-box'
    },

    // Escut de l'equip
    logo: {
        width: '50px',
        height: '50px',
        objectFit: 'cover'
    },

    // Títol de la capçalera de l'usuari
    user_header_title: {
        margin: '0',
        color: 'white',
        padding: '0 0 5px 0',
        fontSize: '40px',
        fontWeight: 'bold',

    },

    menu_button: {
        background: 'none',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '40px',
        padding: '0 0 10px 0'
    },

    // Contenidor del calendari
    calendar_container: {
        background: '#ffffff',
        borderRadius: '0 0 30px 30px',
        padding: '10px 10px 20px',
        marginBottom: '15px',
    },

    /*==================================================
    =                       EVENT                      =
    ==================================================*/

    // Contenidor de la llista d'esdeveniments
    event_list_container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px' 
    },

    // Contenidor de cada esdeveniment
    event_container: {
        background: '#ffffff',
        marginLeft: '20px',
        marginRight: '20px',
        padding: '30px 20px',
        borderRadius: '15px',
    },

    // Etiqueta del tipus d'esdeveniment
    event_type_badge: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',

        height: '30px',
        padding: '0 8px',

        color: 'white',
        borderRadius: '5px',
        fontSize: '11px',
        fontWeight: 'bold',
    },

    edit_event_button: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',

        height: '30px',
        padding: '0 10px',

        background: '#8c8c8c',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        borderRadius: '6px',
    },

    event_name: {
        margin: '12px 0 6px 0',
        fontSize: '20px',
        color: 'var(--text-h)',
        textAlign: 'left',
    },

    event_info_box: {
        color: '#222222',
        fontSize: '14px',
        background: '#8c8c8c',
        padding: '3px 6px',
        borderRadius: '6px'
    },

    event_description_text: {
        color: '#222222',
        fontSize: '14px',
        marginTop: '10px',
        marginBottom: '10px',
        textAlign: 'left',
        lineHeight: '1.2'
    },

    event_assistance_button: {
        background: '#f85e5e',
        border: 'none',
        padding: '8px 4px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px' 
    },

    event_check_assistance_button: {
        border: 'none',
        padding: '8px 4px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px' 
    }
}