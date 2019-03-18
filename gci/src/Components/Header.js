import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { headerStyles } from "../Assets/header.styles";
import { Grid, Row, Col } from "react-flexbox-grid";
import CopyToClipboard from "react-copy-to-clipboard";
import CopyIcon from "@material-ui/icons/FileCopyOutlined";
import { Tooltip, Snackbar } from "@material-ui/core";
import { MySnackbarContentWrapper } from "./../Helpers/MySnackbarContent";
import { getBalance } from "../Actions/header.action";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openSnack: false,
            snackMessage: "",
            variant: "success"
        };
    }

    componentDidMount = () => {
        this.props.getBalance(this.props.gaiacliPath, this.props.address);
    };

    handleClose = (event, reason) => {
        this.setState({ openSnack: false });
    };

    render() {
        let { atomBalance, address } = this.props;
        let balance;
        try {
            balance = JSON.parse(atomBalance);
        } catch (err) {
            balance = {};
        }
        let balValue =
            typeof balance === "object" && balance !== null
                ? "value" in balance
                    ? balance.value
                    : {}
                : {};
        let coins =
            typeof balValue === "object" && balValue !== null
                ? "coins" in balValue
                    ? balValue.coins
                    : []
                : [];
        let token =
            coins && coins.length !== 0
                ? coins.find(o => o.denom === "uatom")
                : {};
        return (
            <div style={headerStyles.mainDivStyle}>
                <div>
                    <span style={headerStyles.headingStyle}> Address : </span>
                    <span style={headerStyles.valueStyle}>
                        {this.props.address}
                    </span>
                    <Tooltip title={"Copy Address"}>
                        <CopyToClipboard
                            text={this.props.address}
                            onCopy={() =>
                                this.setState({
                                    snackMessage: "Copied Successfully",
                                    openSnack: true
                                })
                            }
                        >
                            <CopyIcon style={headerStyles.clipBoard} />
                        </CopyToClipboard>
                    </Tooltip>
                </div>
                <div>
                    <span style={headerStyles.headingStyle}> Balance : </span>
                    <span style={headerStyles.valueStyle}>
                        {token && "denom" in token ? (
                            `${(parseInt(token.amount) / 10 ** 6).toFixed(
                                8
                            )} ATOMs`
                        ) : (
                            <img
                                src={"../src/Images/load.svg"}
                                alt="loading..."
                                style={{ width: 25 }}
                            />
                        )}
                    </span>
                </div>
                <Snackbar
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                    }}
                    open={this.state.openSnack}
                    autoHideDuration={4000}
                    onClose={this.handleClose}
                >
                    <MySnackbarContentWrapper
                        onClose={this.handleClose}
                        variant={this.state.variant}
                        message={this.state.snackMessage}
                    />
                </Snackbar>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        atomBalance: state.getBalance,
        address: state.getWalletAddress,
        gaiacliPath: state.gaiacliPath
    };
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators(
        {
            getBalance
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToActions
)(Header);
