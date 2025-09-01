import { describe, expect, it } from "vitest";

describe("change", () => {
  [
    "Breaking (patch)",
    {
      given: {
        packages: [
          {
            name: "pkg-a",
            version: "1.0.0",
            peerDependencies: { "pkg-b": "1.x" },
          },
          {
            name: "pkg-b",
            version: "1.0.0",
          },
        ],
        input: ["change", { breaking: ["pkg-a"], type: "patch" }],
      },
      want: {
        packages: [
          {
            name: "pkg-a",
            version: "1.0.0",
            peerDependencies: { "pkg-b": "^1.0.1" },
          },
          {
            name: "pkg-b",
            version: "1.0.1",
          },
        ],
      },
    },
  ];
  [
    "Breaking (minor)",
    {
      given: {
        packages: [
          {
            name: "pkg-a",
            version: "1.0.0",
            peerDependencies: { "pkg-b": "1.x" },
          },
          {
            name: "pkg-b",
            version: "1.0.0",
          },
        ],
        input: ["change", { breaking: ["pkg-a"], type: "minor" }],
      },
      want: {
        packages: [
          {
            name: "pkg-a",
            version: "1.0.0",
            peerDependencies: { "pkg-b": "^1.1.0" },
          },
          {
            name: "pkg-b",
            version: "1.1.0",
          },
        ],
      },
    },
  ];
});
