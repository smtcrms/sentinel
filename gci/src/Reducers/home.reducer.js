import * as types from "./../Constants/action.names";

export function getCurrentComp(state = "loading", action) {
    switch (action.type) {
        case types.CURRENT_COMP:
            return action.payload;
        default:
            return state;
    }
}

export function getWalletAddress(state = null, action) {
    switch (action.type) {
        case types.WALLET_ADDRESS:
            return action.payload;
        default:
            return state;
    }
}

export function getGaiacliPath(state = "", action) {
    switch (action.type) {
        case types.GAIA_PATH:
            return action.payload;
        default:
            return state;
    }
}
