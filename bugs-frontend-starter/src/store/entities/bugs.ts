import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import moment from "moment";

import { apiRequest } from "../apiActions";
import { AppDispatch, RootState } from "..";

interface Bug {
    id?: number;
    userId?: number;
    description: string;
    isResolved?: boolean;
}

interface BugsState {
    list: Bug[];
    loading: boolean;
    lastFetch: number | null;
}

const initialState: BugsState = {
    list: [],
    loading: false,
    lastFetch: null,
};

const slice = createSlice({
    name: "bugs",
    initialState,
    reducers: {
        bugsRequested: (bugs, action) => {
            bugs.loading = true;
        },

        bugsRequestFailed: (bugs, action) => {
            bugs.loading = false;
        },

        bugsReceived: (bugs, action) => {
            bugs.list = action.payload;
            bugs.loading = false;
            bugs.lastFetch = Date.now();
        },

        bugAssignedToUser: (bugs, action) => {
            const { id, userId } = action.payload;
            const index = bugs.list.findIndex((bug) => bug.id === id);
            bugs.list[index].userId = userId;
        },

        // command - event
        // addBug - bugAdded
        bugAdded: (bugs, action) => {
            bugs.list.push(action.payload);
        },

        // resolveBug (command) - bugResolved (event)
        bugResolved: (bugs, action) => {
            const index = bugs.list.findIndex(
                (bug) => bug.id === action.payload.id
            );
            bugs.list[index].isResolved = true;
        },

        bugRemoved: (bugs, action) => {
            bugs.list.splice(
                bugs.list.findIndex((bug) => bug.id === action.payload.id),
                1
            );
        },
    },
});

export default slice.reducer;
export const bugsSelector = (state: RootState) => state.entities.bugs;

// Action creators
export const {
    bugAdded,
    bugRemoved,
    bugResolved,
    bugAssignedToUser,
    bugsReceived,
    bugsRequested,
    bugsRequestFailed,
} = slice.actions;

const url = "/bugs";

export const loadBugs = () => (dispatch: AppDispatch, getState: RootState) => {
    // @ts-ignore
    const { lastFetch } = getState().entities.bugs;

    const diffInMinutes = moment().diff(moment(lastFetch), "minutes");

    if (diffInMinutes < 10) return;

    return dispatch(
        apiRequest({
            url,
            onStart: bugsRequested.toString(),
            onSuccess: bugsReceived.toString(),
            onError: bugsRequestFailed.toString(),
        })
    );
};

export const addBug = (bug: Bug) =>
    apiRequest({
        url,
        method: "post",
        data: bug,
        onSuccess: bugAdded.type,
    });

export const removeBug = (id: number) =>
    apiRequest({
        url: `${url}/${id}`,
        method: "delete",
        data: { id },
        onSuccess: bugRemoved.type,
    });

export const resolveBug = (id: number) =>
    apiRequest({
        url: `${url}/${id}`,
        method: "patch",
        data: { resolved: true },
        onSuccess: bugResolved.type,
    });

export const assignBugToUser = (id: number, userId: number) =>
    apiRequest({
        url: `${url}/${id}`,
        method: "patch",
        data: { userId },
        onSuccess: bugAssignedToUser.type,
    });

// Selectors
// Memoization
// bugs => get unresolved bugs from the cache
export const getUnresolvedBugs = createSelector(
    (state: RootState) => state.entities.bugs,
    (bugs) => bugs.list.filter((bug) => !bug.isResolved)
);

export const getBugsByUser = (userId: number) =>
    createSelector(
        (state: RootState) => state.entities.bugs,
        (bugs) => bugs.list.filter((bug) => bug.userId === userId)
    );
