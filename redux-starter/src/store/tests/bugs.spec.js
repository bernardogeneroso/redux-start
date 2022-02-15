import { addBug } from "../bugs";
import { apiRequest } from "../api";

describe("bugsSlice", () => {
    describe("action creators", () => {
        it("addBug", () => {
            const bug = { description: "a" };
            const result = addBug(bug);
            const expected = {
                type: apiRequest.type,
                payload: {
                    url: "/bugs",
                    method: "post",
                    data: bug,
                    onSuccess: "bugs/bugAdded",
                },
            };

            expect(result).toEqual(expected);
        });
    });
});
