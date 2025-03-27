# Mermaid Diagram Rendering Tools

This directory contains Mermaid diagram (`.mmd`) files for the Kaiju Academy application, along with tools to render them to SVG files.

## Available Diagrams

1. `database_schema.mmd` - Entity relationship diagram showing database tables and their relationships
2. `backend_architecture.mmd` - System architecture diagram showing the AWS services and components
3. `api_domains.mmd` - API domain organization showing the different API endpoints
4. `data_flow.mmd` - Sequence diagram showing the data flow during typical operations
5. `component_relationships.mmd` - Class diagram showing the core data models and their relationships
6. `security_implementation.mmd` - Flowchart showing the security implementation

## Rendering Tools

Two rendering scripts are provided for your convenience:

### 1. Node.js Renderer (`render_mermaid.js`)

This script uses the mermaid-cli (`mmdc`) to render diagrams to SVG files.

#### Prerequisites

You need Node.js installed. The script will try to use the globally installed `mmdc` or use `npx` to run it without installation.

#### Usage

```bash
# Make the script executable
chmod +x render_mermaid.js

# Render all .mmd files in the current directory
./render_mermaid.js

# Render a specific file
./render_mermaid.js api_domains.mmd
```

If you want to install mermaid-cli globally (optional):

```bash
npm install -g @mermaid-js/mermaid-cli
```

### 2. Python Renderer (`render_mermaid.py`)

This script offers two rendering methods:
- Using mermaid-cli if installed
- Browser-based rendering as a fallback (opens a browser and lets you save the SVG file)

#### Prerequisites

You need Python 3.6+ installed. No additional Python packages are required.

#### Usage

```bash
# Make the script executable
chmod +x render_mermaid.py

# Render all .mmd files in the current directory
./render_mermaid.py

# Render a specific file
./render_mermaid.py api_domains.mmd
```

## Output

All rendered SVG files will be saved to the `render/` directory. If the directory doesn't exist, it will be created automatically.

## Modifying Diagrams

To modify a diagram:

1. Edit the corresponding `.mmd` file with your changes
2. Run one of the rendering scripts to update the SVG file
3. Use the updated SVG in your documentation

## Additional Resources

- [Mermaid Documentation](https://mermaid-js.github.io/mermaid/)
- [Mermaid Live Editor](https://mermaid.live/) - For testing your diagrams 