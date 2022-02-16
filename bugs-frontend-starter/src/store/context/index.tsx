import { Provider } from "react-redux";

import { store } from "../";

export const StoreContext: React.FC = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};
