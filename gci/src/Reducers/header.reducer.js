import * as types from "./../Constants/action.names";

export function getBalance(state = "", action) {
    switch (action.type) {
        case types.GET_BALANCE:
            return action.payload;
        default:
            return state;
    }
}
