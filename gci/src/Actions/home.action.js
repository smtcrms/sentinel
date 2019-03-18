import * as types from "./../Constants/action.names";

export function setCurrentComp(value) {
    return {
        type: types.CURRENT_COMP,
        payload: value
    };
}

export function setWalletAddress(value) {
    return {
        type: types.WALLET_ADDRESS,
        payload: value
    };
}

export function setGaiacliPath(path) {
    return {
        type: types.GAIA_PATH,
        payload: path
    };
}
