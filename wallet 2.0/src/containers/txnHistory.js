import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, IconButton  } from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import { bindActionCreators } from 'redux';
import { testSENTTxns, testETHTxns } from '../Actions/getHistoryAction'
import { label, buttonStyle, disabledButton } from '../Assets/commonStyles'
import History from "../Components/historyComponent";

class TxnHistory extends Component {


    testSentHistory = () => {
        let data = {
          account_addr: this.props.getAccount
        };
      this.props.testSENTTxns(data)
          .then(res => { console.log('here we are: ', res) })
          .catch(err => { console.log('error brah', err) });

    };

    testEthHistory = () => {
        let data = {
            page: 1,
            account_addr: this.props.getAccount
        };
        this.props.testETHTxns(data)
            .then(res => { console.log('here we are: ', res) })
            .catch(err => { console.log('error brah', err) });
    };

    render() {
    console.log(this.props.testETHHistory, "test hostory");
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
                        <div>
                            <IconButton aria-label="Refresh">
                                <RefreshIcon/>
                            </IconButton>
                        </div>
                        <div>
                            <Button variant="flat" component="span" style={buttonStyle}>
                                SENT
                            </Button>
                        </div>
                        <div>
                            <Button onClick={this.testEthHistory} variant="raised" component="span" style={buttonStyle}>
                                ETH
                            </Button>
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


const mapDispatchToProps = (dispatch) => {

    return bindActionCreators({ testSENTTxns, testETHTxns }, dispatch)
};

const mapStateToProps = ( { testSENTHistory, testETHHistory, getAccount } ) => {

    return { testSENTHistory, testETHHistory, getAccount }
};

export default connect(mapStateToProps, mapDispatchToProps)(TxnHistory);