import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { delegateStyle } from "./../Assets/delegate.styles";
import { TextField, Button } from "@material-ui/core";
import { Slider } from "@material-ui/lab";
import CustomSelect from "./customSelect";
import { getKeysList, getValidatorsList } from "./../Actions/delegate.action";

class Delegate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validator: null,
            amount: null,
            fee: 2500,
            keyName: null,
            keysList: [],
            validatorsList: [],
            password: ""
        };
    }

    componentWillMount = () => {
        this.props.getKeysList(this.props.gaiacliPath).then(res => {
            try {
                let list = JSON.parse(res.payload);
                let keysList = list.map(obj => {
                    return { value: obj.name, label: obj.name };
                });
                this.setState({ keysList: keysList });
            } catch (err) {
                this.setState({ keysList: [] });
            }
        });
        this.props.getValidatorsList().then(res => {
            try {
                let list = res.payload;
                let validatorsList = list.map(obj => {
                    return {
                        value: obj.operator_address,
                        label: `${obj.description.moniker} - ${
                            obj.operator_address
                        }`
                    };
                });
                this.setState({ validatorsList });
            } catch (err) {
                this.setState({ validatorsList: [] });
            }
        });
    };

    onChangeFee = (e, value) => {
        this.setState({ fee: value });
    };

    onChangePassword = e => {
        this.setState({ password: e.target.value });
    };

    onChangeAmount = e => {
        if (e.target.value) {
            if (parseFloat(e.target.value) >= 0) {
                this.setState({ amount: e.target.value });
            } else {
                this.setState({ amount: 0 });
            }
        } else {
            this.setState({ amount: null });
        }
    };

    onClickDelegate = () => {
        
    };

    shouldDisable = () => {
        if (
            !this.state.password ||
            !this.state.keyName ||
            !this.state.validator ||
            !this.state.amount
        ) {
            return true;
        } else return false;
    };

    render() {
        let isDisabled = this.shouldDisable();
        return (
            <div style={delegateStyle.wholeDiv}>
                <p style={{ fontSize: 18 }}>Create Delegate</p>
                <CustomSelect
                    onChange={e => {
                        this.setState({ validator: e });
                    }}
                    placeholder={"Select Validator"}
                    suggestions={this.state.validatorsList}
                    value={this.state.validator}
                />
                <TextField
                    label="Amount (in atoms)"
                    id="amount"
                    type="number"
                    value={this.state.amount}
                    margin="normal"
                    style={delegateStyle.amountFieldDiv}
                    onChange={this.onChangeAmount}
                />
                <CustomSelect
                    onChange={e => {
                        this.setState({ keyName: e });
                    }}
                    placeholder={"Select Key Name"}
                    suggestions={this.state.keysList}
                    value={this.state.keyName}
                />
                <TextField
                    label="Password"
                    id="password"
                    type="password"
                    value={this.state.password}
                    margin="normal"
                    style={delegateStyle.amountFieldDiv}
                    onChange={this.onChangePassword}
                />
                <div style={delegateStyle.feeFieldDiv}>
                    <div style={delegateStyle.feeTextFieldDiv}>
                        <div style={delegateStyle.row}>
                            <div>
                                <span style={delegateStyle.feeHeading}>
                                    {"Fee"}
                                </span>
                            </div>
                            <div style={delegateStyle.valueMargin}>
                                <span style={delegateStyle.feeChangeText}>
                                    {this.state.fee} uatoms
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Slider
                            defaultValue={this.state.fee}
                            component="div"
                            min={1000}
                            max={5000}
                            value={this.state.fee}
                            step={1}
                            onChange={this.onChangeFee}
                        />
                    </div>
                </div>
                <Button
                    variant="outlined"
                    color="primary"
                    disabled={isDisabled}
                    onClick={() => {
                        this.onClickDelegate();
                    }}
                    style={delegateStyle.buttonStyle}
                >
                    {"Delegate"}
                </Button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        gaiacliPath: state.gaiacliPath
    };
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators(
        {
            getKeysList,
            getValidatorsList
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToActions
)(Delegate);
