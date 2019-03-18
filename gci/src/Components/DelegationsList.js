import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getDelegationsList } from "../Actions/delegationsList.action";
import { delegationStyle } from "./../Assets/delegationsList.styles";
import EnhancedTable from "./customTable";

class DelegationsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            delegationsList: []
        };
    }

    componentWillMount = () => {
        this.getDelegations();
    };

    getDelegations = () => {
        this.props
            .getDelegationsList(this.props.gaiacliPath, this.props.address)
            .then(res => {
                try {
                    let list = JSON.parse(res.payload);
                    this.setState({ delegationsList: list });
                } catch (err) {
                    this.setState({ delegationsList: [] });
                }
            });
    };

    render() {
        let { delegationsList } = this.state;
        return (
            <div>
                {delegationsList.length !== 0 ? (
                    <EnhancedTable data={delegationsList} />
                ) : (
                    <div style={delegationStyle.noDelegationsStyle}>
                        {"No previous delegations"}
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        address: state.getWalletAddress,
        gaiacliPath: state.gaiacliPath
    };
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators(
        {
            getDelegationsList
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToActions
)(DelegationsList);
