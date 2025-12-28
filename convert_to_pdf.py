"""
Convert markdown documentation to PDF via HTML
"""
import markdown
import os
from pathlib import Path

# Read the markdown file
md_file = Path(__file__).parent / "VELOWEN_PROJECT_DOCUMENTATION.md"
with open(md_file, 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert markdown to HTML
html_content = markdown.markdown(md_content, extensions=['toc', 'fenced_code', 'tables'])

# Create styled HTML document
html_document = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Velowen.art - Complete Project Documentation</title>
    <style>
        @page {{
            margin: 2cm;
            size: A4;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }}
        h1 {{
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 30px;
            page-break-after: avoid;
        }}
        h2 {{
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-top: 25px;
            page-break-after: avoid;
        }}
        h3 {{
            color: #3b82f6;
            margin-top: 20px;
            page-break-after: avoid;
        }}
        h4 {{
            color: #60a5fa;
            margin-top: 15px;
        }}
        code {{
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}
        pre {{
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            page-break-inside: avoid;
        }}
        pre code {{
            background: transparent;
            padding: 0;
            color: inherit;
        }}
        blockquote {{
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
            margin-left: 0;
            color: #6b7280;
            font-style: italic;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
            page-break-inside: avoid;
        }}
        th, td {{
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
        }}
        th {{
            background: #f3f4f6;
            font-weight: bold;
        }}
        ul, ol {{
            margin: 10px 0;
            padding-left: 30px;
        }}
        li {{
            margin: 5px 0;
        }}
        a {{
            color: #2563eb;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        hr {{
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 30px 0;
        }}
        .toc {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            page-break-after: always;
        }}
        .toc ul {{
            list-style-type: none;
            padding-left: 0;
        }}
        .toc li {{
            margin: 8px 0;
        }}
        .toc a {{
            color: #1e40af;
            font-weight: 500;
        }}
        @media print {{
            body {{
                padding: 0;
            }}
            h1, h2, h3 {{
                page-break-after: avoid;
            }}
            pre, blockquote {{
                page-break-inside: avoid;
            }}
        }}
    </style>
</head>
<body>
{html_content}
</body>
</html>
"""

# Write HTML file
html_file = md_file.parent / "VELOWEN_PROJECT_DOCUMENTATION.html"
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_document)

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print(f"Created HTML file: {html_file}")
print("\nTo convert to PDF:")
print("   1. Open the HTML file in your browser")
print("   2. Press Ctrl+P (or Cmd+P on Mac)")
print("   3. Select 'Save as PDF' as the destination")
print("   4. Click Save")
print(f"\n   Or use: python -m weasyprint {html_file} VELOWEN_PROJECT_DOCUMENTATION.pdf")

