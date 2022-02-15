import { createAction } from "@reduxjs/toolkit";

export const apiRequest = createAction("apiRequest");
export const apiRequestSuccess = createAction("apiRequestSuccess");
export const apiRequestFailed = createAction("apiRequestFailed");
