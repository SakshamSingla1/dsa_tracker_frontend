import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";

export const LANGUAGES = {
  JAVA: {
    label: "Java",
    extension: java(),
    hint: "Public class must be named Main",
    template: (title) =>
      `public class Main {\n    public static void main(String[] args) {\n        // TODO: solve "${title}"\n\n    }\n}\n`,
  },
  CPP: {
    label: "C++",
    extension: cpp(),
    hint: null,
    template: (title) =>
      `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // TODO: solve "${title}"\n\n    return 0;\n}\n`,
  },
  PYTHON: {
    label: "Python",
    extension: python(),
    hint: null,
    template: (title) => `# TODO: solve "${title}"\n\n`,
  },
  JAVASCRIPT: {
    label: "JavaScript",
    extension: javascript(),
    hint: null,
    template: (title) => `// TODO: solve "${title}"\n\n`,
  },
};

export const LANGUAGE_ORDER = ["JAVA", "CPP", "PYTHON", "JAVASCRIPT"];
