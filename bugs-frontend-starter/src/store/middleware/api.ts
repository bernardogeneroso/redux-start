import { Middleware } from "@reduxjs/toolkit";
import axios from "axios";
import * as actions from "../apiActions";

const api: Middleware =
    ({ dispatch }) =>
    (next) =>
    async (action) => {
        if (action.type !== actions.apiRequest.type) return next(action);

        const { url, method, data, onStart, onSuccess, onError } =
            action.payload;

        if (onStart) dispatch({ type: onStart });

        next(action);

        try {
            const response = await axios({
                baseURL: "http://localhost:9001/api",
                url,
                method,
                data,
            });

            // General
            dispatch(actions.apiRequestSuccess(response.data));

            // Specific
            if (onSuccess)
                dispatch({
                    type: onSuccess,
                    payload: method === "delete" ? { id: data } : response.data,
                });
        } catch (error: any) {
            // General
            dispatch(actions.apiRequestFailed(error.message));

            // Specific
            if (onError)
                dispatch({
                    type: onError,
                    payload: error.message,
                });
        }
    };

export default api;
