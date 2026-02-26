import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { convertDicomBytesToJson } from "../../lib/dicomDump";

type DumpResult = {
  fileCount: number;
  data: unknown;
};

export function DicomDumpTool() {
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dumpResult, setDumpResult] = useState<DumpResult | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  const dumpAsString = useMemo(() => {
    if (!dumpResult) {
      return "";
    }

    return JSON.stringify(dumpResult.data, null, 2);
  }, [dumpResult]);

  const convertFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setIsConverting(true);
    setErrorMessage(null);

    try {
      const converted: unknown[] = [];

      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());

        try {
          const jsonData = await convertDicomBytesToJson(bytes);
          converted.push(jsonData);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown conversion error";
          throw new Error(`${file.name}: ${message}`);
        }
      }

      setDumpResult({
        fileCount: files.length,
        data: files.length === 1 ? converted[0] : converted,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown conversion error";
      setErrorMessage(`Failed to convert DICOM to DICOM-JSON. ${message}`);
      setDumpResult(null);
    } finally {
      setIsConverting(false);
    }
  };

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    void convertFiles(files);
    event.currentTarget.value = "";
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    void convertFiles(files);
  };

  const onCopy = async () => {
    if (!dumpAsString) {
      return;
    }

    try {
      await navigator.clipboard.writeText(dumpAsString);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }

    setTimeout(() => {
      setCopyState("idle");
    }, 1200);
  };

  const onSave = () => {
    if (!dumpAsString) {
      return;
    }

    const blob = new Blob([dumpAsString], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      dumpResult?.fileCount === 1 ? "dicom-dump.json" : "dicom-dump-array.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium">DICOM Dump</h2>
        <p className="text-sm text-slate-300">
          {isConverting ? "Converting…" : "Ready"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => filesInputRef.current?.click()}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white"
        >
          Upload file(s)
        </button>
        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          className="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200"
        >
          Upload folder
        </button>
      </div>

      <input
        ref={filesInputRef}
        type="file"
        multiple
        onChange={onFilesSelected}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        onChange={onFilesSelected}
        className="hidden"
      />

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-lg border border-dashed p-6 text-center text-sm transition ${
          isDragging
            ? "border-indigo-400 bg-indigo-500/10 text-indigo-200"
            : "border-slate-700 text-slate-300"
        }`}
      >
        Drag & drop DICOM file(s) or folder contents here
      </div>

      <p className="rounded border border-amber-700/40 bg-amber-950/30 p-3 text-sm text-amber-200">
        Disclaimer: Pixel Data (`7FE0,0010`) and other large tags are stripped
        in DICOM Dump output.
      </p>

      {errorMessage && (
        <p className="rounded bg-red-950/40 p-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      {dumpResult && (
        <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-300">
              Converted {dumpResult.fileCount}{" "}
              {dumpResult.fileCount === 1 ? "file" : "files"}. Output shape:{" "}
              {dumpResult.fileCount === 1
                ? "single DICOM-JSON object"
                : "JSON array"}
              .
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCopy}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200"
              >
                {copyState === "success"
                  ? "Copied"
                  : copyState === "error"
                    ? "Copy failed"
                    : "Copy"}
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded border border-slate-700">
            <Editor
              height="420px"
              language="json"
              defaultLanguage="json"
              value={dumpAsString}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
