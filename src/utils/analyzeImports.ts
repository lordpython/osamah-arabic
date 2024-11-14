import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';

interface UnusedFile {
  filePath: string;
  reason: string;
}

function getAllFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(filePath));
    } else if (stat.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
      files.push(filePath);
    }
  });

  return files;
}

function isSpecialFile(filePath: string): boolean {
  const specialFiles = ['index.ts', 'index.tsx', 'types.ts', 'constants.ts', 'config.ts'];
  return specialFiles.includes(path.basename(filePath));
}

export function analyzeUnusedFiles(rootDir: string = 'src'): UnusedFile[] {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  const unusedFiles: UnusedFile[] = [];
  const appDir = path.join(rootDir, 'app');
  const allFiles = getAllFiles(rootDir);
  const appStructureFiles = getAllFiles(appDir);

  // Add all source files to the project
  project.addSourceFilesAtPaths(`${rootDir}/**/*.{ts,tsx}`);

  const sourceFiles = project.getSourceFiles();
  const importedFiles = new Set<string>();

  // Collect all imported files
  sourceFiles.forEach((sourceFile) => {
    sourceFile.getImportDeclarations().forEach((importDecl) => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier.startsWith('.')) {
        const resolvedPath = path.resolve(path.dirname(sourceFile.getFilePath()), moduleSpecifier);
        importedFiles.add(resolvedPath);
      }
    });
  });

  // Check each file
  allFiles.forEach((file) => {
    const absolutePath = path.resolve(file);
    const relativePath = path.relative(process.cwd(), file);

    // Skip files in the app directory structure
    if (appStructureFiles.includes(file)) {
      return;
    }

    // Check if file is imported anywhere
    if (!importedFiles.has(absolutePath) && !isSpecialFile(file)) {
      unusedFiles.push({
        filePath: relativePath,
        reason: 'Not imported in any file',
      });
    }
  });

  return unusedFiles;
}
