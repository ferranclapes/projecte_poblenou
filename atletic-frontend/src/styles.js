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

    headers_container: {
        background: '#ffffff',
        borderRadius: '0 0 30px 30px' // Same as calendar_container for visual consistency
    },
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
    logo: {
        width: '50px',
        height: '50px',
        objectFit: 'cover'
    },
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

    /*==================================================
    =                     SIDE MENU                    =
    ==================================================*/

    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(42, 15, 15, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 999,
        transition: 'opacity 0.3s ease-in-out'
    },
    sideMenu_container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '100vh',
        backgroundColor: '#000000',
        boxShadow: '4px 0 25px -5px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    sideMenu_header: {
        backgroundColor: '#ff3131',
        padding: '20px 0 20px 5px'
    },
    sideMenu_title: {
        margin: '0',
        color: 'white',
        textAlign: 'left',
        fontSize: '30px'
    },
    sideMenu_button: {
        background: '#000000',
        color: 'white',
        border: 'none',
        borderBottom: '2px solid #525252',
        padding: '15px 5px',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '16px',
    },

    /*==================================================
    =                      CALENDAR                    =
    ==================================================*/

    calendar_container: {
        background: '#ffffff',
        borderRadius: '0 0 30px 30px',
        padding: '10px 10px 20px',
        marginBottom: '15px',
    },
    today_button: {
        background: '#ff3131',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    calendar_days_container: {
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(6, 40px)',
        gap: '5px', 
        textAlign: 'center',
        transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
    },
    calendar_day: {
        padding: '10px 5px', 
        borderRadius: '8px', 
        cursor: 'pointer',
        position: 'relative',
        transition: 'opacity 0.2 ease, background 0.2s, color 0.2s',
    },
    calendar_dot: {
        position: 'absolute', 
        bottom: '4px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '5px', 
        height: '5px', 
        borderRadius: '50%'
    },

    /*==================================================
    =                       EVENT                      =
    ==================================================*/

    event_list_container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px' 
    },
    event_container: {
        background: '#ffffff',
        marginLeft: '20px',
        marginRight: '20px',
        padding: '30px 20px',
        borderRadius: '15px',
    },
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
    },

    /*==================================================
    =                       FORMS                      =
    ==================================================*/
    form_overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(42, 15, 15, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 999,
        transition: 'opacity 0.3s ease-in-out',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
    },
    form_container: {
        background: '#ffffff',
        borderRadius: '15px',
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
    },
    form_title: {
        margin: '0 0 15px 0',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#ff3131'
    },
    form_content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '10px'
    },
    form_button_container: {
        display: 'flex',
        gap: '10px',
        justifyContent: "flex-end",
        marginTop: '10px'
    },

    /*==================================================
    =                   TEAM SUMMARY                   =
    ==================================================*/

    teamSummary_header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        background: '#ff3131',
        padding: '5px 10px 0px 15px', //top, right, bottom, left
        borderRadius: '0 0 15px 15px',
        boxSizing: 'border-box',
        marginBottom: '20px'
    },
    teamSummary_logo: {
        width: '30px',
        height: '30px',
        objectFit: 'cover'
    },
    teamSummary_header_title: {
        margin: '0',
        color: 'white',
        padding: '10px 0 15px 0',
        fontSize: '25px',
        fontWeight: 'bold',
    },
    teamSummary_menu_button: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '25px',
        cursor: 'pointer',
    },
    teamSummary_player_list_container: {
        background: '#ffffff',
        borderRadius: '10px 10px 10px 10px',
        padding: '10px 10px 20px',
        display: 'flex',
        flexDirection: 'column'
    },
    teamSummary_player_continer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: '10px',
        borderBottom: '1px solid #888888'
    },
    teamSummary_player_expand_button: {
        background: 'transparent',
        border: 'none',
        color: '#000000',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '5px'
    },
    teamSummary_detail_container: {
        padding: '12px 0px 0px 20px',
        display: 'grid',
        gap: '12px',
        fontSize: '14px',
        width: '90%',
        overflow: 'hidden'
    },
    teamSummary_detail_row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    teamSummary_edit_detail_button: {
        background: 'transparent',
        border: 'none',
        color: '#000000',
        fontSize: '14px',
        cursor: 'pointer'
    },

    /*==================================================
    =                      USEFUL                      =
    ==================================================*/

    infoLabel: {
        fontSize: '14px'
    },

    inputField: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #8c8c8c',
        boxSizing: 'border-box',
        fontSize: '13px'
    },

    btnPrimary: {
        background: '#ff3131',
        color: 'white',
        border: 'none',
        padding: '10px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold'
    },

    btnSecondary: {
        background: '#8c8c8c',
        color: 'white',
        border: 'none',
        padding: '10px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold'
    }

}