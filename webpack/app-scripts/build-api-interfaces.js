/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const glob = require('glob');

const packageName = require(path.join(__dirname, '../package.json')).name;
const outputPath = path.join(__dirname, '../config', `${packageName}.ts`);

async function buildApiInterfaces() {
  const files = glob.sync('source/**/api.ts');
  let importsMap = new Map(); // Utilisez une Map pour grouper les imports par source
  let declaredIdentifiers = new Set();
  let content = '';

  files.forEach((filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);

    ts.forEachChild(sourceFile, (node) => {
      // Collecter et grouper les imports
      if (ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings) {
        const moduleSpecifier = node.moduleSpecifier.text;
        node.importClause.namedBindings.forEachChild((namedBinding) => {
          if (ts.isImportSpecifier(namedBinding)) {
            const identifier = namedBinding.name.escapedText;
            if (!importsMap.has(moduleSpecifier)) {
              importsMap.set(moduleSpecifier, new Set());
            }
            importsMap.get(moduleSpecifier).add(identifier);
          }
        });
      }
      // Collecter les identificateurs déclarés
      else if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isModuleDeclaration(node)) {
        const identifier = node.name.escapedText;
        declaredIdentifiers.add(identifier);
        content += node.getFullText(sourceFile) + '\n';
      }
    });
  });

  // Construire les imports consolidés
  let importsContent = '';
  importsMap.forEach((identifiers, source) => {
    // Filtrer pour ne pas inclure les identificateurs déjà déclarés
    const filteredIdentifiers = Array.from(identifiers).filter((identifier) => !declaredIdentifiers.has(identifier));
    if (filteredIdentifiers.length > 0) {
      importsContent += `import { ${filteredIdentifiers.join(', ')} } from '${source}';\n`;
    }
  });

  const finalContent = importsContent + '\n' + content;
  fs.writeFileSync(outputPath, finalContent);
  console.log(`Configuration de l'API reconstruite à partir de ${files.length} fichiers : ${outputPath}`);
}

// Utilisation de chokidar pour surveiller les fichiers api.ts
chokidar
  .watch('source/**/api.ts', {
    ignored: /(^|[\/\\])\../, // ignorer les fichiers dot
    persistent: true,
  })
  .on('change', () => {
    console.log("Un fichier api.ts a été modifié. Reconstruction de la configuration de l'API...");
    buildApiInterfaces().catch((e) =>
      console.error("Erreur lors de la reconstruction de la configuration de l'API:", e)
    );
  });

console.log('Surveillance des fichiers api.ts en cours...');
buildApiInterfaces().catch((e) => console.error("Erreur lors de la reconstruction de la configuration de l'API:", e));
