const sidebarStyles = {
    activeDivStyle: {
        padding: '20px 0px', //'16px 10px 7px 20px',
        textAlign: 'center', //changed center to left
        cursor: 'pointer',
        fontWeight: 'bold',
        fontFamily: 'Montserrat'
    },

    currentDivStyle: {
        padding: '20px 0px',//'12px 20px 4px 20px',
        textAlign: 'center',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontFamily: 'Montserrat',
        backgroundColor: 'rgba(48, 50, 70, 0.16)'
    },

    activeLabelStyle: {
        fontWeight: 'bold',// 'bold',
        fontSize: 18,
        color: '#0c2940',
        cursor: 'pointer',
    },
    normalLabelStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0c2940', // changed from '#3D425C',
        cursor: 'pointer',
    },
    m_0: { margin: 0 },
    outlineNone: {
        outline: 'none'
    },
    heightFull: {
        height: '100%'
    },
    giveSpace:{
        marginBottom:12
    },
    backArrowStyle:{
        // marginTop:25,
    },   
}

module.exports = {
    sidebarStyles
}