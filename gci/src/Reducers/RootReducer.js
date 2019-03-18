import { combineReducers } from "redux";
import {
    getCurrentComp,
    getWalletAddress,
    getGaiacliPath
} from "./home.reducer";
import { getBalance } from "./header.reducer";
import { setCurrentTab } from "./sidebar.reducer";
import { getDelegationsList } from "./delegationsList.reducer";

const rootReducer = combineReducers({
    getCurrentComp,
    getWalletAddress,
    getBalance,
    currentTab: setCurrentTab,
    getDelegationsList,
    gaiacliPath: getGaiacliPath
});

export default rootReducer;
