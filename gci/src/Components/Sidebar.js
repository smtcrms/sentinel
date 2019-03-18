import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withStyles } from "@material-ui/core/styles";
import { compose } from "recompose";
import PropTypes from "prop-types";
import { sidebarStyles } from "../Assets/sidebar.styles";
import { setCurrentTab } from "../Actions/sidebar.action";
import { Paper } from "@material-ui/core";
import { menuItems } from "./../Constants/constants";

const electron = window.require("electron");
const remote = electron.remote;

const Customstyles = theme => ({
    paper: {
        height: "100%",
        backgroundColor: "#f8f8f8"
    }
});

class Sidebar extends Component {
    constructor(props) {
        super(props);
    }

    setMenu = item => {
        this.props.setCurrentTab(item.value);
    };

    render() {
        let { currentTab, classes } = this.props;
        return (
            <div style={sidebarStyles.heightFull}>
                <Paper classes={{ root: classes.paper }}>
                    <div
                        tabIndex={0}
                        role="button"
                        style={sidebarStyles.outlineNone}
                    >
                        {menuItems.map(item => {
                            return (
                                <div>
                                    <div
                                        style={
                                            item.value === currentTab
                                                ? sidebarStyles.currentDivStyle
                                                : sidebarStyles.activeDivStyle
                                        }
                                        onClick={() => {
                                            this.setMenu(item);
                                        }}
                                    >
                                        <label
                                            style={
                                                item.value === currentTab
                                                    ? sidebarStyles.activeLabelStyle
                                                    : sidebarStyles.normalLabelStyle
                                            }
                                        >
                                            {item.name}
                                        </label>
                                    </div>
                                    <hr style={sidebarStyles.m_0} />
                                </div>
                            );
                        })}
                    </div>
                </Paper>
            </div>
        );
    }
}

Sidebar.propTypes = {
    classes: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        currentTab: state.currentTab
    };
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators(
        {
            setCurrentTab
        },
        dispatch
    );
}

export default compose(
    withStyles(Customstyles),
    connect(
        mapStateToProps,
        mapDispatchToActions
    )
)(Sidebar);
