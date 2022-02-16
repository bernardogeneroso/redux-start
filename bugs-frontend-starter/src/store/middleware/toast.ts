import { Middleware } from "@reduxjs/toolkit";

const toast: Middleware = (store) => (next) => (action) => {
    if (action.type === "error")
        console.log("Toastify:", action.payload.message);
    else return next(action);
};

export default toast;
