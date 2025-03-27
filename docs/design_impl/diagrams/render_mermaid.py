#!/usr/bin/env python3

"""
Mermaid Diagram Renderer (Python Version)

This script converts Mermaid (.mmd) files to SVG files in the render directory.
It provides multiple rendering options:
1. Using the mermaid-cli if installed (via subprocess)
2. Using the browser-based rendering with PyMermaid if mermaid-cli is not available

Usage:
  ./render_mermaid.py [file.mmd]  - Render a specific .mmd file
  ./render_mermaid.py             - Render all .mmd files in the current directory
"""

import os
import sys
import subprocess
import glob
import webbrowser
import json
import platform
import time
import base64
from pathlib import Path
from html import escape

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RENDER_DIR = os.path.join(SCRIPT_DIR, "render")
DEFAULT_THEME = "neutral"

# Ensure render directory exists
if not os.path.exists(RENDER_DIR):
    os.makedirs(RENDER_DIR)
    print(f"Created render directory: {RENDER_DIR}")

def check_mermaid_cli_installed():
    """Check if mermaid-cli is installed"""
    try:
        # Try running mmdc command with --version
        result = subprocess.run(
            ["mmdc", "--version"], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        # If the command is not found, return False
        return False

def create_temp_html(mermaid_content, output_file):
    """Create a temporary HTML file for browser-based rendering"""
    temp_html_path = os.path.join(SCRIPT_DIR, "temp_render.html")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Mermaid Renderer</title>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
            body {{ margin: 0; padding: 20px; }}
            #download-container {{
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }}
            .download-btn {{
                padding: 10px 15px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                text-align: center;
            }}
            .download-btn:hover {{
                background-color: #45a049;
            }}
            .mermaid {{
                margin-top: 60px;
            }}
            .instructions {{
                font-family: sans-serif;
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                max-width: 800px;
            }}
            #status-message {{
                color: #4CAF50;
                font-weight: bold;
                margin-top: 10px;
                display: none;
            }}
            #python-message {{
                display: none;
                font-family: monospace;
                background-color: #f1f1f1;
                padding: 10px;
                border-radius: 4px;
                margin-top: 20px;
                white-space: pre-wrap;
                word-break: break-all;
            }}
            #server-save-btn {{
                margin-top: 10px;
                background-color: #2196F3;
            }}
            #server-save-btn:hover {{
                background-color: #0b7dda;
            }}
            textarea {{
                width: 100%;
                height: 100px;
                margin-top: 20px;
                display: none;
            }}
        </style>
    </head>
    <body>
        <div class="instructions">
            <h2>Mermaid Renderer</h2>
            <p>Your diagram will render below. We've provided multiple ways to save the SVG:</p>
            <ol>
                <li><strong>Method 1:</strong> Click the "Download SVG" button (works in most browsers)</li>
                <li><strong>Method 2:</strong> If Method 1 doesn't work, click "Save SVG to File" which uses a 
                   different approach that bypasses some browser restrictions</li>
                <li><strong>Method 3:</strong> If both fail, click "Copy SVG as Base64" and follow the instructions</li>
            </ol>
            <p>Output will be saved to: <strong>{output_file}</strong></p>
            <div id="status-message"></div>
            <div id="python-message"></div>
        </div>
        
        <div id="download-container">
            <a id="download-link" class="download-btn">Download SVG</a>
            <button id="server-save-btn" class="download-btn">Save SVG to File</button>
            <button id="copy-base64-btn" class="download-btn">Copy SVG as Base64</button>
        </div>
        
        <div class="mermaid">
        {escape(mermaid_content)}
        </div>

        <textarea id="svg-base64"></textarea>
        
        <script>
            mermaid.initialize({{ 
                startOnLoad: true,
                theme: '{DEFAULT_THEME}',
                securityLevel: 'loose'
            }});
            
            // After Mermaid has rendered, initialize the download functionality
            setTimeout(initializeDownload, 1000);
            
            function showMessage(message, isError = false) {{
                const statusElement = document.getElementById('status-message');
                statusElement.textContent = message;
                statusElement.style.color = isError ? '#f44336' : '#4CAF50';
                statusElement.style.display = 'block';
            }}

            function getSvgSource() {{
                const svgElement = document.querySelector('.mermaid svg');
                if (!svgElement) {{
                    showMessage('SVG not found. Wait for diagram to render completely.', true);
                    return null;
                }}
                
                // Get SVG source
                const serializer = new XMLSerializer();
                let source = serializer.serializeToString(svgElement);
                
                // Add namespaces
                if(!source.match(/^<svg[^>]+xmlns="http:\\/\\/www\\.w3\\.org\\/2000\\/svg"/)) {{
                    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                }}
                if(!source.match(/^<svg[^>]+"http:\\/\\/www\\.w3\\.org\\/1999\\/xlink"/)) {{
                    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
                }}
                
                // Add XML declaration
                source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
                
                return source;
            }}
            
            function initializeDownload() {{
                // Method 1: Direct download
                document.getElementById('download-link').addEventListener('click', function(e) {{
                    e.preventDefault();
                    
                    const source = getSvgSource();
                    if (!source) return;
                    
                    try {{
                        // Create file and download
                        const blob = new Blob([source], {{ type: 'image/svg+xml' }});
                        const url = URL.createObjectURL(blob);
                        
                        // Set download attributes
                        this.href = url;
                        this.download = "{os.path.basename(output_file)}";
                        
                        showMessage('Download initiated!');
                        
                        // Clean up the URL object after the download is complete
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                    }} catch (error) {{
                        showMessage('Download failed: ' + error.message, true);
                        console.error('Download error:', error);
                    }}
                }});
                
                // Method 2: Server-side save
                document.getElementById('server-save-btn').addEventListener('click', function() {{
                    const source = getSvgSource();
                    if (!source) return;
                    
                    try {{
                        // Create a POST request to save the file
                        fetch('temp_render_save.html', {{
                            method: 'POST',
                            headers: {{
                                'Content-Type': 'application/json',
                            }},
                            body: JSON.stringify({{
                                svg: source,
                                filename: "{os.path.basename(output_file)}",
                                output_path: "{output_file}"
                            }})
                        }})
                        .then(response => {{
                            if (response.ok) {{
                                showMessage('SVG saved successfully to {output_file}');
                            }} else {{
                                showMessage('Failed to save SVG file on server', true);
                            }}
                        }})
                        .catch(error => {{
                            showMessage('Error saving file: ' + error.message, true);
                        }});
                    }} catch (error) {{
                        showMessage('Save operation failed: ' + error.message, true);
                    }}
                }});
                
                // Method 3: Copy Base64
                document.getElementById('copy-base64-btn').addEventListener('click', function() {{
                    const source = getSvgSource();
                    if (!source) return;
                    
                    try {{
                        // Convert to base64
                        const base64 = btoa(unescape(encodeURIComponent(source)));
                        
                        // Show the textarea with the base64 data
                        const textarea = document.getElementById('svg-base64');
                        textarea.value = base64;
                        textarea.style.display = 'block';
                        
                        // Select the content
                        textarea.select();
                        document.execCommand('copy');
                        
                        // Show Python instructions
                        document.getElementById('python-message').style.display = 'block';
                        document.getElementById('python-message').textContent = 
                            `# Base64 copied to clipboard!\n# Paste this command in your terminal to save the SVG:\n\npython3 -c "import base64; f=open('{output_file}', 'wb'); f.write(base64.b64decode(input('Paste base64 and press Enter: '))); f.close(); print('SVG saved to {output_file}')"`;
                        
                        showMessage('Base64 copied to clipboard! See instructions below.');
                    }} catch (error) {{
                        showMessage('Base64 conversion failed: ' + error.message, true);
                    }}
                }});
            }}
        </script>
    </body>
    </html>
    """
    
    with open(temp_html_path, "w", encoding="utf-8") as file:
        file.write(html_content)
    
    # Create a simple server-side handler for the "Save SVG to File" button
    save_handler_path = os.path.join(SCRIPT_DIR, "temp_render_save.html")
    save_handler_content = f"""
    <html>
    <body>
        <h1>SVG Save Handler</h1>
        <p>This page handles saving SVG files directly from the renderer.</p>
        <script>
            // Listen for POST requests from the renderer
            window.addEventListener('message', function(event) {{
                try {{
                    if (event.data && event.data.svg && event.data.output_path) {{
                        // Send the data back to the parent window
                        window.parent.postMessage({{
                            status: 'success',
                            message: 'SVG data received'
                        }}, '*');
                    }}
                }} catch (error) {{
                    console.error('Error handling message:', error);
                }}
            }}, false);
        </script>
    </body>
    </html>
    """
    
    with open(save_handler_path, "w", encoding="utf-8") as file:
        file.write(save_handler_content)
    
    return temp_html_path

def render_with_browser(mermaid_file, output_file):
    """Render mermaid diagram using browser"""
    try:
        # Read the mermaid file content
        with open(mermaid_file, "r", encoding="utf-8") as file:
            mermaid_content = file.read()
        
        # Create a temporary HTML file
        temp_html = create_temp_html(mermaid_content, output_file)
        
        # Open in browser
        webbrowser.open('file://' + os.path.abspath(temp_html))
        
        print(f"\nBrowser-based rendering initiated for {mermaid_file}")
        print(f"Please use one of the buttons to save the SVG.")
        print(f"1. 'Download SVG' - Standard browser download")
        print(f"2. 'Save SVG to File' - Alternative method")
        print(f"3. 'Copy SVG as Base64' - Provides a command to paste")
        print(f"Output will be saved to: {output_file}")
        
        # Wait a moment for the browser to open
        time.sleep(1)
        
        # Give the user a direct option to provide the SVG as base64
        try:
            user_input = input("\nAfter viewing the diagram, would you like to paste base64 data? (y/n): ")
            if user_input.lower() in ('y', 'yes'):
                print("\nPaste the base64 data and press Enter:")
                base64_data = input()
                if base64_data:
                    try:
                        svg_data = base64.b64decode(base64_data)
                        with open(output_file, 'wb') as f:
                            f.write(svg_data)
                        print(f"✅ SVG saved to {output_file}")
                        return True
                    except Exception as e:
                        print(f"❌ Error decoding base64 data: {str(e)}")
            else:
                print("Please complete the save using the browser.")
        except KeyboardInterrupt:
            print("\nOperation canceled by user.")
        
        return True
    except Exception as e:
        print(f"❌ Error with browser rendering: {str(e)}")
        return False

def render_with_cli(mermaid_file, output_file):
    """Render mermaid diagram using mermaid-cli"""
    try:
        # Run the mmdc command
        result = subprocess.run(
            ["mmdc", "-i", mermaid_file, "-o", output_file, "-t", DEFAULT_THEME],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if os.path.exists(output_file):
            print(f"✅ Successfully rendered: {output_file}")
            return True
        else:
            print(f"❌ Failed to create output file: {output_file}")
            return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed with exit code {e.returncode}")
        print(f"Error output: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def render_with_puppeteer(mermaid_file, output_file):
    """Try to render using npx @mermaid-js/mermaid-cli"""
    try:
        print("Trying to render with npx @mermaid-js/mermaid-cli...")
        result = subprocess.run(
            ["npx", "@mermaid-js/mermaid-cli", "-i", mermaid_file, "-o", output_file, "-t", DEFAULT_THEME],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if os.path.exists(output_file):
            print(f"✅ Successfully rendered with npx: {output_file}")
            return True
        else:
            print(f"❌ Failed to create output file with npx")
            return False
    except subprocess.CalledProcessError as e:
        print(f"❌ npx command failed with exit code {e.returncode}")
        print(f"Error output: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Error with npx: {str(e)}")
        return False

def render_mermaid_file(mermaid_file):
    """Render a single mermaid file to SVG"""
    # Get the basename without extension
    basename = os.path.basename(mermaid_file)
    filename_without_ext = os.path.splitext(basename)[0]
    
    # Create the output path
    output_file = os.path.join(RENDER_DIR, f"{filename_without_ext}.svg")
    
    print(f"Rendering {mermaid_file} → {output_file}")
    
    # First check if mermaid-cli is installed
    if check_mermaid_cli_installed():
        print("Using mermaid-cli (mmdc) for rendering")
        if render_with_cli(mermaid_file, output_file):
            return True
        else:
            print("mermaid-cli failed, trying alternative methods")
    else:
        print("mermaid-cli not found, trying alternative methods")
    
    # If mmdc fails or isn't installed, try npx with mermaid-cli
    if render_with_puppeteer(mermaid_file, output_file):
        return True
    
    # If all else fails, use browser-based rendering
    print("Falling back to browser-based rendering")
    return render_with_browser(mermaid_file, output_file)

def find_mermaid_files():
    """Find all .mmd files in the current directory"""
    return glob.glob(os.path.join(SCRIPT_DIR, "*.mmd"))

def main():
    """Main function"""
    # Get command line arguments
    args = sys.argv[1:]
    
    # If a specific file is provided, render just that file
    if args:
        file_path = args[0]
        if not file_path.endswith('.mmd'):
            print("Error: File must have a .mmd extension")
            sys.exit(1)
        
        if not os.path.exists(file_path):
            print(f"Error: File not found: {file_path}")
            sys.exit(1)
        
        render_mermaid_file(file_path)
        return
    
    # Otherwise, render all .mmd files in the current directory
    mermaid_files = find_mermaid_files()
    
    if not mermaid_files:
        print("No .mmd files found in the current directory.")
        return
    
    print(f"Found {len(mermaid_files)} Mermaid files to render.")
    
    success_count = 0
    
    for file in mermaid_files:
        success = render_mermaid_file(file)
        if success:
            success_count += 1
        
        print("\n-----------------------------------\n")
    
    print(f"Rendering complete: {success_count}/{len(mermaid_files)} files rendered successfully.")
    print(f"SVG files are saved in the '{RENDER_DIR}' directory")

if __name__ == "__main__":
    main() 