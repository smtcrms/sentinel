import React, { Component } from "react";
import PropTypes from "prop-types";
import {
    TextField,
    Button,
    FormControlLabel,
    Checkbox
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { compose } from "recompose";
import { setWalletAddress, setCurrentComp } from "../Actions/home.action";

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 700
    },
    input: {
        color: "white"
    },
    inputProps: {
        color: "white",
        border: "2px solid #fff"
    },
    inputLabel: {
        color: "white"
    },
    submitButton: {
        margin: theme.spacing.unit,
        color: "white",
        border: "1px solid #2682c7"
    },
    disabledBtn: {
        margin: theme.spacing.unit,
        color: "#555 !important",
        border: "1px solid #2682c7 !important"
    }
});

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            walletAddr: null,
            isDisabled: true
        };
    }

    handleAddrChange = () => event => {
        this.setState({
            walletAddr: event.target.value
        });
        if (event.target.value.includes("cosmos"))
            this.setState({ isDisabled: false });
        else this.setState({ isDisabled: true });
    };

    setUnlockAddress = () => {
        this.props.setWalletAddress(this.state.walletAddr);
        this.props.setCurrentComp("dashboard");
    };

    render() {
        const { classes } = this.props;
        return (
            <div>
                <p className="formHead">Gaia Client Interface</p>
                <div>
                    <TextField
                        id="outlined-bare"
                        placeholder="Enter your wallet address to unlock"
                        className={`${classes.textField}`}
                        InputProps={{
                            className: `${classes.input} inputLabel`
                        }}
                        inputProps={{
                            className: `${classes.inputProps} inputProps`
                        }}
                        InputLabelProps={{
                            className: `${classes.inputLabel} inputLabel`
                        }}
                        value={this.state.walletAddr}
                        onChange={this.handleAddrChange()}
                        margin="normal"
                        variant="outlined"
                    />
                </div>
                <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    disabled={!this.state.walletAddr || this.state.isDisabled}
                    onClick={() => {
                        this.setUnlockAddress();
                    }}
                    className={
                        !this.state.walletAddr || this.state.isDisabled
                            ? classes.disabledBtn
                            : classes.submitButton
                    }
                >
                    Unlock
                </Button>
            </div>
        );
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {};
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators(
        {
            setWalletAddress,
            setCurrentComp
        },
        dispatch
    );
}

export default compose(
    withStyles(styles),
    connect(
        mapStateToProps,
        mapDispatchToActions
    )
)(Home);
