import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    loadBugs,
    addBug,
    removeBug,
    resolveBug,
    assignBugToUser,
    getUnresolvedBugs,
    getBugsByUser,
} from "../bugs";
import configureStore from "../configureStore";

// AAA
// -> Arrange
// -> Act
// -> Assert

describe("bugsSlice", () => {
    let fakeAxios;
    let store;

    beforeEach(() => {
        fakeAxios = new MockAdapter(axios);
        store = configureStore();
    });

    const bugsSlice = () => store.getState().entities.bugs;

    const createState = () => ({
        entities: {
            bugs: {
                list: [],
            },
        },
    });

    describe("loading bugs", () => {
        describe("if the bugs exist in the cache", () => {
            it("they should not be fetched from the server again", async () => {
                fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

                await store.dispatch(loadBugs());
                await store.dispatch(loadBugs());

                expect(fakeAxios.history.get.length).toBe(1);
            });
        });
        describe("if the bugs don't exist in the cache", () => {
            it("they should be fetched from the server and put in the store", async () => {
                fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

                await store.dispatch(loadBugs());

                expect(bugsSlice().list).toHaveLength(1);
            });

            describe("loading indicator", () => {
                it("should be true while fetching the bugs", () => {
                    fakeAxios.onGet("/bugs").reply(() => {
                        expect(bugsSlice().loading).toBe(true);

                        return [200, [{ id: 1 }]];
                    });

                    store.dispatch(loadBugs());
                });

                it("should be false after the bugs are fetched", async () => {
                    fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }]);

                    await store.dispatch(loadBugs());

                    expect(bugsSlice().loading).toBe(false);
                });

                it("should be false if the server returns an error", async () => {
                    fakeAxios.onGet("/bugs").reply(500);

                    await store.dispatch(loadBugs());

                    expect(bugsSlice().loading).toBe(false);
                });
            });
        });
    });

    describe("actions creators", () => {
        describe("add bug", () => {
            it("should add the bug to the store if it's saved to the server", async () => {
                // Arrange
                const bug = { description: "Bug 1" };
                const savedBug = { ...bug, id: 1 };
                fakeAxios.onPost("/bugs").reply(200, savedBug);

                // Act
                await store.dispatch(addBug(bug));

                // Assert
                expect(bugsSlice().list).toContainEqual(savedBug);
            });

            it("should not add the bug to the store if it's not saved to the server", async () => {
                const bug = { description: "Bug 1" };
                fakeAxios.onPost("/bugs").reply(500);

                await store.dispatch(addBug(bug));

                expect(bugsSlice().list).toHaveLength(0);
            });
        });

        describe("remove bug", () => {
            it("should remove the bug of the store if it's deleted on the server", async () => {
                const bug = { description: "Bug 1" };
                const savedBug = { ...bug, id: 1 };
                fakeAxios.onPost("/bugs").reply(200, savedBug);
                fakeAxios.onDelete("/bugs/1").reply(204);

                await store.dispatch(addBug(bug));
                await store.dispatch(removeBug(1));

                expect(bugsSlice().list).toHaveLength(0);
            });

            it("should not remove the bug of the store if it's not deleted on the server", async () => {
                const bug = { description: "Bug 1" };
                const savedBug = { ...bug, id: 1 };
                fakeAxios.onPost("/bugs").reply(200, savedBug);
                fakeAxios.onDelete("/bugs/1").reply(500);

                await store.dispatch(addBug(bug));
                await store.dispatch(removeBug(1));

                expect(bugsSlice().list).toHaveLength(1);
            });
        });

        describe("resolve bug", () => {
            it("should mark the bug as resolved if it's saved to the server", async () => {
                fakeAxios.onPost("/bugs").reply(200, { id: 1 });
                fakeAxios
                    .onPatch("/bugs/1")
                    .reply(204, { id: 1, resolved: true });

                await store.dispatch(addBug({ description: "Bug 1" }));
                await store.dispatch(resolveBug(1));
                8;
                expect(bugsSlice().list[0].resolved).toBe(true);
            });

            it("should not mark the bug as resolved if it's not saved to the server", async () => {
                fakeAxios.onPost("/bugs").reply(200, { id: 1 });
                fakeAxios.onPatch("/bugs/1").reply(500);

                await store.dispatch(addBug({ description: "Bug 1" }));
                await store.dispatch(resolveBug(1));

                expect(bugsSlice().list[0].resolved).not.toBe(true);
            });
        });

        describe("assigned to user", () => {
            it("should assing a bug to a user if it's saved to the server", async () => {
                fakeAxios.onPost("/bugs").reply(200, { id: 1 });
                fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, userId: 1 });

                await store.dispatch(addBug({ description: "Bug 1" }));
                await store.dispatch(assignBugToUser(1, 1));

                expect(bugsSlice().list[0].userId).toBe(1);
            });

            it("should not assing a bug to a user if it's not saved to the server", async () => {
                fakeAxios.onPost("/bugs").reply(200, { id: 1 });
                fakeAxios.onPatch("/bugs/1").reply(500, { id: 1, userId: 1 });

                await store.dispatch(addBug({ description: "Bug 1" }));
                await store.dispatch(assignBugToUser(1, 1));

                expect(bugsSlice().list[0].userId).not.toBe(1);
                expect(bugsSlice().list[0].userId).toBe(undefined);
            });
        });
    });

    describe("selectors", () => {
        it("getUnresolvedBugs", () => {
            const state = createState();
            state.entities.bugs.list = [
                { id: 1, resolved: true },
                { id: 2 },
                { id: 3 },
                { id: 4, resolved: true },
            ];

            const result = getUnresolvedBugs(state);

            expect(result).toHaveLength(2);
        });

        it("getBugsByUser", () => {
            const state = createState();
            state.entities.bugs.list = [
                { id: 1, userId: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4, userId: 1 },
            ];

            const result = getBugsByUser(1)(state);

            expect(result).toHaveLength(2);
        });
    });
});
