import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import Editor from "@monaco-editor/react";
import { validateDicomJson, type ValidationResult } from "../../lib/validator";

type OnEditorMount = NonNullable<ComponentProps<typeof Editor>["onMount"]>;
type MonacoEditor = Parameters<OnEditorMount>[0];
type MonacoApi = Parameters<OnEditorMount>[1];

export function DicomJsonValidatorTool() {
  const [content, setContent] = useState(`{
  "00080021": { "vr": "DA", "Value": ["20230610"] },
  "00200013": { "vr": "IS", "Value": ["5"] }
}`);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<MonacoApi | null>(null);
  const validationRequestRef = useRef(0);

  const errorCount = useMemo(() => result?.errors.length ?? 0, [result]);

  useEffect(() => {
    const requestId = ++validationRequestRef.current;

    const timer = setTimeout(async () => {
      const next = await validateDicomJson(content);

      if (validationRequestRef.current !== requestId) {
        return;
      }

      setResult(next);
      setIsValidating(false);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [content]);

  const onEditorMount: OnEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const onEditorChange = (value: string | undefined) => {
    setContent(value ?? "");
    setIsValidating(true);
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      return;
    }

    if (!result || result.valid) {
      monacoRef.current.editor.setModelMarkers(
        model,
        "dicom-json-validator",
        [],
      );
      return;
    }

    const markers = result.errors.flatMap((error) => {
      if (!error.line && !error.column) {
        return [];
      }

      const line = Math.max(1, error.line ?? 1);
      const column = Math.max(1, error.column ?? 1);

      return [
        {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column + 1,
          message: error.message,
          severity: monacoRef.current?.MarkerSeverity.Error,
        },
      ];
    });

    monacoRef.current.editor.setModelMarkers(
      model,
      "dicom-json-validator",
      markers,
    );

    if (markers.length > 0) {
      editorRef.current.revealPositionInCenter({
        lineNumber: markers[0].startLineNumber,
        column: markers[0].startColumn,
      });
    }
  }, [result]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium">DICOM-JSON Validator</h2>
        <p className="text-sm text-slate-300">
          {isValidating ? "Validating…" : "Auto validation enabled"}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-700">
        <Editor
          height="420px"
          defaultLanguage="json"
          value={content}
          onChange={onEditorChange}
          onMount={onEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {result && (
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
          <p className="text-sm font-medium">
            {result.valid
              ? "Valid DICOM JSON ✅"
              : `Invalid DICOM JSON ❌ (${errorCount} ${errorCount === 1 ? "error" : "errors"})`}
          </p>

          {!result.valid && (
            <ul className="mt-3 space-y-2 text-sm text-red-300">
              {result.errors.map((error, index) => (
                <li
                  key={`${error.message}-${index}`}
                  className="rounded bg-red-950/40 p-2"
                >
                  <span className="font-medium">Error {index + 1}:</span>{" "}
                  {error.message}
                  {(error.line || error.column) && (
                    <span className="ml-2 text-red-200">
                      (line {error.line ?? "-"}, col {error.column ?? "-"})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
