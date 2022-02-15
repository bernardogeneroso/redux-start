import { combineReducers } from "redux";

import bugsReducer from "./bugs";
import projetsReducer from "./projets";
import usersReducer from "./users";

export default combineReducers({
    bugs: bugsReducer,
    projets: projetsReducer,
    users: usersReducer,
});
