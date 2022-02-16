import React from "react";
import ReactDOM from "react-dom";

import { StoreContext } from "./store/context";
import App from "./App";

ReactDOM.render(
    <StoreContext>
        <App />
    </StoreContext>,
    document.getElementById("root")
);
