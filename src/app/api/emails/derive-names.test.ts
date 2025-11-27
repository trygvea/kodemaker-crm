import {
  capitalizeNamePart,
  deriveNamesFromEmailLocalPart,
} from "./name-utils";
import { describe, expect, it } from "vitest";

describe("name derivation", () => {
  it("handles dotted local-part and plus tag", () => {
    expect(deriveNamesFromEmailLocalPart("john.michael.doe+tag")).toEqual({
      firstName: "John",
      lastName: "Doe",
    });
  });

  it("single token becomes first name only", () => {
    expect(deriveNamesFromEmailLocalPart("sole")).toEqual({
      firstName: "Sole",
      lastName: "",
    });
  });

  it("capitalizes hyphenated names", () => {
    expect(capitalizeNamePart("ANNA-LISA")).toBe("Anna-Lisa");
  });
});
