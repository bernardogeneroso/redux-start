const logger = (param) => (store) => (next) => (action) => {
    console.group(action.type);
    console.log("Logging:", param);
    console.log("🔥 - Action: ", action);
    const result = next(action);
    console.log("🔥 - Next state: ", store.getState());
    console.groupEnd();
    return result;
};

export default logger;

// Currying
// N => 1
