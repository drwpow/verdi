import {
  text,
  select,
  confirm,
  isCancel,
  groupMultiselect,
} from "@clack/prompts";

export async function changeCmd() {
  const breaking = await groupMultiselect({
    message: "What changes does this introduce?",
    options: {
      "pkg-a": [
        { label: "Breaking", value: "pkg-a.break" },
        { label: "Non-breaking", value: "pkg-a.non" },
      ],
      "pkg-b": [
        { label: "Breaking", value: "pkg-b.break" },
        { label: "Non-breaking", value: "pkg-b.non" },
      ],
      "pkg-c": [
        { label: "Breaking", value: "pkg-c.break" },
        { label: "Non-breaking", value: "pkg-c.non" },
      ],
    },
  });

  const breaking2 = await select({
    message: "What changes does this introduce?",
    options: [{ value: "Breaking" }, { value: "Non-breaking" }],
  });
}
