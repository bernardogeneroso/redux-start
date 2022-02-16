import { useEffect } from "react";
import { useSelector } from "react-redux";
import { SyncLoader } from "react-spinners";

import { useAppDispatch } from "./store";
import { addBug, bugsSelector, loadBugs } from "./store/entities/bugs";

function App() {
    const dispatch = useAppDispatch();
    const { list, loading } = useSelector(bugsSelector);

    useEffect(() => {
        dispatch(loadBugs());
    }, [dispatch]);

    function handleAddBug() {
        dispatch(addBug({ description: "New bug" }));
    }

    return (
        <div>
            <h1>Hello World</h1>

            {loading ? (
                <>
                    <SyncLoader color="#0001" />
                    <br />
                    <br />
                    <br />
                </>
            ) : (
                list.map((bug) => (
                    <div key={bug.id}>
                        {bug?.description || "No description"}
                    </div>
                ))
            )}

            <button onClick={handleAddBug}>Add bug</button>
        </div>
    );
}

export default App;
