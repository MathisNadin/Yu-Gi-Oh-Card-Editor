/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const glob = require('glob');

const packageName = require(path.join(__dirname, '../package.json')).name;
const outputPath = path.join(__dirname, '../config', `${packageName}.ts`);

/**
 * Lit récursivement le fichier de types et ses éventuels exports, en intégrant leur contenu.
 * @param {string} filePath - Le chemin vers un fichier .d.ts
 * @returns {string} - Le contenu concaténé du fichier et de ses dépendances
 */
function readApiTypes(filePath) {
  if (!fs.existsSync(filePath)) {
    return '';
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  let result = '';

  ts.forEachChild(sourceFile, (node) => {
    // Ignorer les lignes `export * from '...'` car on intègre le contenu directement
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const moduleSpecifier = node.moduleSpecifier.text;
      const referencedPath = path.resolve(
        path.dirname(filePath),
        moduleSpecifier.endsWith('.d.ts') ? moduleSpecifier : moduleSpecifier + '.d.ts'
      );

      if (fs.existsSync(referencedPath)) {
        result += '\n' + readApiTypes(referencedPath);
      }
    } else {
      // Ajouter uniquement les autres lignes du fichier
      result += node.getFullText(sourceFile) + '\n';
    }
  });

  return result;
}

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
      // Gérer les exportations de type `export * from '...'`
      else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        const moduleSpecifier = node.moduleSpecifier.text;
        const modulePath = path.resolve(path.dirname(filePath), moduleSpecifier + '.ts');

        if (fs.existsSync(modulePath)) {
          const moduleContent = fs.readFileSync(modulePath, 'utf8');
          const moduleSourceFile = ts.createSourceFile(modulePath, moduleContent, ts.ScriptTarget.Latest, true);

          ts.forEachChild(moduleSourceFile, (exportedNode) => {
            if (ts.isInterfaceDeclaration(exportedNode) || ts.isTypeAliasDeclaration(exportedNode)) {
              const identifier = exportedNode.name.escapedText;
              declaredIdentifiers.add(identifier);
              content += exportedNode.getFullText(moduleSourceFile) + '\n';
            }
          });
        }
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

  let finalContent = importsContent + '\n' + content;

  // Ajout du contenu du fichier source/@types/api.d.ts (et de ses dépendances)
  const apiTypesPath = path.join(__dirname, '../source/@types/api.d.ts');
  if (fs.existsSync(apiTypesPath)) {
    const typesContent = readApiTypes(apiTypesPath);
    finalContent += '\n' + typesContent;
  } else {
    console.warn(`Fichier ${apiTypesPath} non trouvé.`);
  }

  fs.writeFileSync(outputPath, finalContent);
  console.log(`Configuration de l'API reconstruite à partir de ${files.length} fichiers : ${outputPath}`);
}

// Utilisation de chokidar pour surveiller les fichiers api.ts et .d.ts dans source/@types
chokidar
  .watch(['source/**/api.ts', 'source/@types/**/*.d.ts'], {
    ignored: /(^|[\/\\])\../, // ignorer les fichiers dot
    persistent: true,
  })
  .on('change', (filePath) => {
    console.log(`Le fichier ${filePath} a été modifié. Reconstruction de la configuration de l'API...`);
    buildApiInterfaces().catch((e) =>
      console.error("Erreur lors de la reconstruction de la configuration de l'API:", e)
    );
  });

console.log('Surveillance des fichiers api.ts et des fichiers .d.ts dans source/@types en cours...');
buildApiInterfaces().catch((e) => console.error("Erreur lors de la reconstruction de la configuration de l'API:", e));
