import React, { Component } from "react";
import "./App.css";
import Home from "./Components/Home";
import Dashboard from "./Components/Dashboard";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setCurrentComp, setGaiacliPath } from "./Actions/home.action";
import { getGaiaclipath } from "./Helpers/Gaiacli";

class App extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount = async () => {
        document.getElementById("home").style.display = "none";
        let path = await getGaiaclipath();
        console.log("Path..", path);
        this.props.setGaiacliPath(path);
        setTimeout(() => {
            this.props.setCurrentComp("home");
        }, 1000);
    };

    render() {
        let { currentComp } = this.props;
        switch (currentComp) {
            case "home": {
                return (
                    <div className="App">
                        <div className="App-header">
                            <Home />
                        </div>
                    </div>
                );
            }
            case "dashboard": {
                return <Dashboard />;
            }
            default: {
                return (
                    <div
                        style={{
                            backgroundColor: "#fff",
                            height: "94vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column"
                        }}
                    >
                        <img
                            src="./../src/Images/loading.gif"
                            style={{ width: 600, height: 600 }}
                        />
                    </div>
                );
            }
        }
    }
}

function mapStateToProps(state) {
    return {
        currentComp: state.getCurrentComp
    };
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators(
        {
            setCurrentComp,
            setGaiacliPath
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToActions
)(App);
