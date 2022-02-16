import { configureStore, Action, ThunkAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { logger } from "redux-logger";

import reducer from "./rootReducer";
import toast from "./middleware/toast";
import api from "./middleware/api";

export const store = () =>
    configureStore({
        reducer,
        middleware: (getDefaultMiddleware) => [
            ...getDefaultMiddleware(),
            logger,
            toast,
            api,
        ],
    });

const storeGetState = store().getState;
const storeDispatch = store().dispatch;

export type RootState = ReturnType<typeof storeGetState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
export type AppDispatch = typeof storeDispatch;
export const useAppDispatch = () => useDispatch();
// export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
