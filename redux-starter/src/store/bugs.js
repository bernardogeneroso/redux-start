import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import moment from "moment";

import { apiRequest } from "./api";

const slice = createSlice({
    name: "bugs",
    initialState: {
        list: [],
        loading: false,
        lastFetch: null,
    },
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
            bugs.list[index].resolved = true;
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

// Action creators
const {
    bugAdded,
    bugRemoved,
    bugResolved,
    bugAssignedToUser,
    bugsReceived,
    bugsRequested,
    bugsRequestFailed,
} = slice.actions;

const url = "/bugs";

export const loadBugs = () => (dispatch, getState) => {
    const { lastFetch } = getState().entities.bugs;

    const diffInMinutes = moment().diff(moment(lastFetch), "minutes");

    if (diffInMinutes < 10) return;

    return dispatch(
        apiRequest({
            url,
            onStart: bugsRequested.type,
            onSuccess: bugsReceived.type,
            onError: bugsRequestFailed.type,
        })
    );
};

export const addBug = (bug) =>
    apiRequest({
        url,
        method: "post",
        data: bug,
        onSuccess: bugAdded.type,
    });

export const removeBug = (id) =>
    apiRequest({
        url: `${url}/${id}`,
        method: "delete",
        data: { id },
        onSuccess: bugRemoved.type,
    });

export const resolveBug = (id) =>
    apiRequest({
        url: `${url}/${id}`,
        method: "patch",
        data: { resolved: true },
        onSuccess: bugResolved.type,
    });

export const assignBugToUser = (id, userId) =>
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
    (state) => state.entities.bugs,
    (state) => state.entities.projects,
    (bugs, projects) => bugs.list.filter((bug) => !bug.resolved)
);

export const getBugsByUser = (userId) =>
    createSelector(
        (state) => state.entities.bugs,
        (bugs) => bugs.list.filter((bug) => bug.userId === userId)
    );
