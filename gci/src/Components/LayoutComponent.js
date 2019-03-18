import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Delegate from "./Delegate";
import DelegationsList from "./DelegationsList";

class LayoutComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let component = this.props.currentTab;
        switch (component) {
            case "delegationsList": {
                return <DelegationsList />;
            }
            default: {
                return <Delegate />;
            }
        }
    }
}

function mapStateToProps(state) {
    return {
        currentTab: state.currentTab
    };
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToActions
)(LayoutComponent);
