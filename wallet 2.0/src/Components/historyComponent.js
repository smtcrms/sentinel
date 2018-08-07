import React  from 'react';
import { historyLabel, historyValue } from '../Assets/commonStyles'
export default  History = ({ date, to, gas, amount, status, tx }) => {
    return (
        <div>
            <div>
                <div>
                <label style={styles.outStyle}>OUT: <span style={historyValue}>
                    {new Date(parseInt(date) * 1000).toGMTString()}</span>
                </label>
                </div>
                <div>
                    <label style={historyLabel} >To: <span style={styles.recepientStyle}>{to}</span></label>
                    <label style={historyLabel}>Gas Price: <span style={historyValue}>{gas} GWEI</span></label>
                </div>
                <div>
                    <label style={historyLabel}>Amount: <span style={historyValue}>{amount}</span></label>
                    <label style={historyLabel}>Status: <span style={historyValue}>{status}</span></label>
                    <label style={historyLabel}>Tx: <span style={historyValue}>{tx}</span></label>

                </div>
            </div>
        </div>
    )
};

const styles = {
    outStyle: {
        color: 'red',
        fontFamily: 'Montserrat, Medium',
        fontSize: 15,
        paddingRight: 10
    },
    recepientStyle: {
        color: '#318EDE',
        fontFamily: 'Montserrat, Regular',
        fontWeight: 'normal',
        fontSize: 13
    }
}
