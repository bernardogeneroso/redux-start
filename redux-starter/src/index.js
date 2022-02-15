import configureStore from "./store/configureStore";
import { loadBugs, resolveBug, assignBugToUser } from "./store/bugs";

var store = configureStore();

// UI Layer
store.dispatch(loadBugs());

setTimeout(() => {
    store.dispatch(resolveBug(1));
}, 2000);

setTimeout(() => {
    store.dispatch(assignBugToUser(1, 1));
}, 2000);
