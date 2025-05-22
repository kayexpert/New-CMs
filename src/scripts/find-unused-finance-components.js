/**
 * Script to identify potentially unused finance components
 * 
 * This script scans the codebase for finance-related components and identifies
 * components that are not imported or used in any other files.
 * 
 * Usage:
 * node src/scripts/find-unused-finance-components.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FINANCE_DIRS = [
  'src/components/finance',
  'src/hooks',
  'src/lib',
  'src/app/api/finance',
];

const EXCLUDED_FILES = [
  'index.ts',
  'README.md',
  'OPTIMIZATION_README.md',
  'consolidated-skeletons.tsx',
];

// Helper functions
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (!EXCLUDED_FILES.includes(file)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function getComponentName(filePath) {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = fileName.split('.')[0];
  
  // Convert kebab-case to PascalCase for component names
  return fileNameWithoutExt
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function findImports(componentName) {
  try {
    // Use grep to find imports of the component
    const grepCommand = `grep -r "import.*${componentName}" --include="*.tsx" --include="*.ts" src`;
    const result = execSync(grepCommand, { encoding: 'utf8' });
    
    // Filter out self-imports
    const imports = result.split('\n').filter(line => {
      return line && !line.includes(`/${componentName.toLowerCase()}.`);
    });
    
    return imports;
  } catch (error) {
    // grep returns non-zero exit code if no matches found
    return [];
  }
}

function findUsages(componentName) {
  try {
    // Use grep to find usages of the component (JSX tags)
    const grepCommand = `grep -r "<${componentName}" --include="*.tsx" src`;
    const result = execSync(grepCommand, { encoding: 'utf8' });
    
    // Filter out self-usages
    const usages = result.split('\n').filter(line => {
      return line && !line.includes(`/${componentName.toLowerCase()}.`);
    });
    
    return usages;
  } catch (error) {
    // grep returns non-zero exit code if no matches found
    return [];
  }
}

// Main function
function findUnusedComponents() {
  console.log('Scanning for potentially unused finance components...\n');
  
  // Get all finance-related files
  let allFiles = [];
  FINANCE_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(getAllFiles(dir));
    }
  });
  
  // Filter to only include TypeScript/React files
  const tsxFiles = allFiles.filter(file => 
    file.endsWith('.tsx') || file.endsWith('.ts')
  );
  
  // Check each file for imports and usages
  const unusedComponents = [];
  
  tsxFiles.forEach(file => {
    const componentName = getComponentName(file);
    const imports = findImports(componentName);
    const usages = findUsages(componentName);
    
    if (imports.length === 0 && usages.length === 0) {
      unusedComponents.push({
        file,
        componentName,
      });
    }
  });
  
  // Print results
  if (unusedComponents.length === 0) {
    console.log('No potentially unused components found.');
  } else {
    console.log(`Found ${unusedComponents.length} potentially unused components:\n`);
    
    unusedComponents.forEach(({ file, componentName }) => {
      console.log(`- ${componentName} (${file})`);
    });
    
    console.log('\nNote: These components might still be used dynamically or through other means.');
    console.log('Please verify manually before removing any components.');
  }
}

// Run the script
findUnusedComponents();
