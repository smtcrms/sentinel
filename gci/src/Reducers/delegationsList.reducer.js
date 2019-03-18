import * as types from "./../Constants/action.names";

export function getDelegationsList(state = "", action) {
    switch (action.type) {
        case types.GET_DEL_LIST:
            return action.payload;
        default:
            return state;
    }
}
