import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { headerStyles } from "../Assets/header.styles";

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div style={headerStyles.mainDivStyle}>
                <span style={headerStyles.headingStyle}>
                    Powered by Sentinel
                </span>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentTab: state.setCurrentTab,
        isTm: state.setTendermint,
        isTest: state.setTestNet
    };
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToActions
)(Footer);
