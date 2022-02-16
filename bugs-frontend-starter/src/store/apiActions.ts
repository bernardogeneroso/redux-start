import { createAction } from "@reduxjs/toolkit";

interface ApiRequest {
    url: string;
    method?: "get" | "post" | "put" | "patch" | "delete";
    data?: any;
    onStart?: string;
    onSuccess?: string;
    onError?: string;
}

export const apiRequest = createAction<ApiRequest>("apiRequest");
export const apiRequestSuccess = createAction<string>("apiRequestSuccess");
export const apiRequestFailed = createAction<string>("apiRequestFailed");
