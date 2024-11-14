import { analyzeUnusedFiles } from '@/utils/analyzeImports';

export default function UnusedFilesPage() {
  const unusedFiles = analyzeUnusedFiles();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Unused Files Analysis</h1>

      {unusedFiles.length === 0 ? (
        <p className="text-green-600">No unused files found!</p>
      ) : (
        <div className="space-y-4">
          {unusedFiles.map((file, index) => (
            <div key={index} className="p-4 bg-red-50 rounded-lg">
              <p className="font-medium text-red-700">{file.filePath}</p>
              <p className="text-sm text-red-600">{file.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
