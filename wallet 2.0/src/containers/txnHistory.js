import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, IconButton  } from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import { bindActionCreators } from 'redux';
import { testSENTTxns, testETHTxns } from '../Actions/getHistoryAction'
import { label, buttonStyle, disabledButton } from '../Assets/commonStyles'
import History from "../Components/historyComponent";
import CustomButton from '../Components/customButton'
import {setTestNet} from "../Reducers/header.reducer";

class TxnHistory extends Component {

    constructor(props){
        super(props);

        this.state = {
            isActive: false,
        }
    }

    testSentHistory = () => {

        this.setState({ isActive: false });
        let data = {
            account_addr: this.props.getAccount,
            isTest: this.props.setTestNet
        };
      this.props.testSENTTxns(data)
          .then(res => { console.log('here we are: ', res) })
          .catch(err => { console.log('error brah', err) });

    };

    testEthHistory = () => {
        this.setState({ isActive: true });

        let data = {
            page: 1,
            account_addr: this.props.getAccount,
            isTest: this.props.setTestNet
        };
        this.props.testETHTxns(data)
            .then(res => { console.log('here we are: ', res) })
            .catch(err => { console.log('error brah', err) });
    };

    render() {
    console.log(this.props.setTestNet, "test hostory");
        let txns;
        if (this.props.testETHHistory) {
            txns = this.props.testETHHistory.data.result.map(data => {
                console.log(data, "the data");
                return (
                    <div style={{ marginTop: 20, marginBottom: 20 }} >
                        <History date={new Date().toISOString()} to={data.to} gas={data.gas} amount={data.value} status={'success'} tx={data.hash} />
                    </div>
                )
        })
        }
        return (
            <div style={{ margin: 10 }} >
                <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                    <div>
                        <label style={label} >ETH Transactions</label>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={ styles.margin } >
                            <IconButton aria-label="Refresh">
                                <RefreshIcon/>
                            </IconButton>
                        </div>
                        <div style={ styles.margin }>
                            <CustomButton color={'#FFFFFF'}  label={'SENT'} active={!this.state.isActive} onClick={this.testSentHistory} />
                        </div>
                        <div style={ styles.margin }>
                            <CustomButton color={'#F2F2F2'} label={'ETH'} active={this.state.isActive} onClick={this.testEthHistory}/>
                        </div>
                    </div>
                </div>
                <div style={{ overflowY: 'auto', height: 400 }} >
                    {
                        this.props.testETHHistory ?
                            txns : 'No Transactions yet'
                    }
                </div>
            </div>
        )
    }
}


const styles = {
    margin: {
        marginLeft: 10,
        marginRight: 10,
    }
};

const mapDispatchToProps = (dispatch) => {

    return bindActionCreators({ testSENTTxns, testETHTxns }, dispatch)
};

const mapStateToProps = ( { testSENTHistory, testETHHistory, getAccount, setTestNet } ) => {

    return { testSENTHistory, testETHHistory, getAccount, setTestNet }
};

export default connect(mapStateToProps, mapDispatchToProps)(TxnHistory);