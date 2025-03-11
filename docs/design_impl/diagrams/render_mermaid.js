#!/usr/bin/env node

/**
 * Mermaid Diagram Renderer
 * 
 * This script converts Mermaid (.mmd) files to SVG files in the render directory.
 * It requires the mermaid-cli (mmdc) package to be installed.
 * 
 * Usage:
 *   ./render_mermaid.js [file.mmd]  - Render a specific .mmd file
 *   ./render_mermaid.js             - Render all .mmd files in the current directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const RENDER_DIR = path.join(__dirname, 'render');
const DEFAULT_THEME = 'neutral';

// Ensure render directory exists
if (!fs.existsSync(RENDER_DIR)) {
  fs.mkdirSync(RENDER_DIR, { recursive: true });
  console.log(`Created render directory: ${RENDER_DIR}`);
}

/**
 * Check if mermaid-cli is installed, if not, provide installation instructions
 */
function checkMermaidCliInstalled() {
  try {
    execSync('mmdc --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log('Mermaid CLI (mmdc) is not installed or not in PATH.');
    console.log('Try installing it globally:');
    console.log('  npm install -g @mermaid-js/mermaid-cli');
    console.log('');
    console.log('Alternatively, we can use npx to run it without installing:');
    return false;
  }
}

/**
 * Render a single Mermaid file to SVG
 */
function renderMermaidFile(filePath) {
  const fileName = path.basename(filePath, '.mmd');
  const outputPath = path.join(RENDER_DIR, `${fileName}.svg`);
  
  console.log(`Rendering ${filePath} → ${outputPath}`);
  
  try {
    const mmcInstalled = checkMermaidCliInstalled();
    
    if (mmcInstalled) {
      execSync(`mmdc -i "${filePath}" -o "${outputPath}" -t ${DEFAULT_THEME}`, { 
        stdio: 'inherit' 
      });
    } else {
      // Use npx as a fallback
      execSync(`npx @mermaid-js/mermaid-cli -i "${filePath}" -o "${outputPath}" -t ${DEFAULT_THEME}`, { 
        stdio: 'inherit' 
      });
    }
    
    console.log(`✅ Successfully rendered: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to render ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Find all .mmd files in the current directory
 */
function findMermaidFiles() {
  const files = fs.readdirSync(__dirname);
  return files.filter(file => file.endsWith('.mmd'));
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  // If a specific file is provided, render just that file
  if (args.length > 0) {
    const filePath = args[0];
    if (!filePath.endsWith('.mmd')) {
      console.error('Error: File must have a .mmd extension');
      process.exit(1);
    }
    
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    
    renderMermaidFile(filePath);
    return;
  }
  
  // Otherwise, render all .mmd files in the current directory
  const mermaidFiles = findMermaidFiles();
  
  if (mermaidFiles.length === 0) {
    console.log('No .mmd files found in the current directory.');
    return;
  }
  
  console.log(`Found ${mermaidFiles.length} Mermaid files to render.`);
  
  let successCount = 0;
  
  for (const file of mermaidFiles) {
    const success = renderMermaidFile(file);
    if (success) successCount++;
  }
  
  console.log(`\nRendering complete: ${successCount}/${mermaidFiles.length} files rendered successfully.`);
}

// Run the main function
main(); 