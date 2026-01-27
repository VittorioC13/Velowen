#!/usr/bin/env python3
"""
Convert Markdown files to PDF with proper formatting
"""

import os
import sys
from pathlib import Path

try:
    from markdown import markdown
    from xhtml2pdf import pisa
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown", "xhtml2pdf"])
    from markdown import markdown
    from xhtml2pdf import pisa

def convert_md_to_pdf(md_file, pdf_file):
    """Convert markdown file to PDF"""

    # Read markdown file
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Convert markdown to HTML
    html_content = markdown(md_content, extensions=['tables', 'fenced_code', 'codehilite'])

    # Add CSS styling for better formatting
    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: letter;
                margin: 0.75in;
            }}
            body {{
                font-family: Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.4;
                color: #333;
            }}
            h1 {{
                color: #2563eb;
                font-size: 24pt;
                margin-top: 20pt;
                margin-bottom: 10pt;
            }}
            h2 {{
                color: #1e40af;
                font-size: 18pt;
                margin-top: 16pt;
                margin-bottom: 8pt;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 4pt;
            }}
            h3 {{
                color: #1e3a8a;
                font-size: 14pt;
                margin-top: 12pt;
                margin-bottom: 6pt;
            }}
            code {{
                background-color: #f3f4f6;
                padding: 2pt 4pt;
                border-radius: 3pt;
                font-family: 'Courier New', monospace;
                font-size: 9pt;
            }}
            pre {{
                background-color: #1f2937;
                color: #f9fafb;
                padding: 10pt;
                border-radius: 5pt;
                overflow-x: auto;
                margin: 10pt 0;
            }}
            ul, ol {{
                margin-top: 6pt;
                margin-bottom: 6pt;
                padding-left: 20pt;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 10pt 0;
            }}
            th, td {{
                border: 1px solid #d1d5db;
                padding: 6pt;
                text-align: left;
            }}
            th {{
                background-color: #3b82f6;
                color: white;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    # Convert HTML to PDF
    with open(pdf_file, 'w+b') as pdf:
        pisa_status = pisa.CreatePDF(styled_html, dest=pdf)

    return not pisa_status.err

def main():
    """Main conversion function"""

    base_dir = Path(__file__).parent

    files_to_convert = [
        ('ANIME_WORLD_ROADMAP.md', 'ANIME_WORLD_ROADMAP.pdf'),
        ('QUICK_ACTION_PLAN.md', 'QUICK_ACTION_PLAN.pdf'),
        ('KEY_REPOS_AND_PAPERS.md', 'KEY_REPOS_AND_PAPERS.pdf')
    ]

    print("Converting Markdown files to PDF...\n")

    success_count = 0
    for md_file, pdf_file in files_to_convert:
        md_path = base_dir / md_file
        pdf_path = base_dir / pdf_file

        if not md_path.exists():
            print(f"Error: {md_file} not found")
            continue

        print(f"Converting {md_file} to {pdf_file}...")
        try:
            if convert_md_to_pdf(md_path, pdf_path):
                print(f"Success: Created {pdf_file}")
                success_count += 1
            else:
                print(f"Error converting {md_file}")
        except Exception as e:
            print(f"Error converting {md_file}: {e}")

    print(f"\nConversion complete! {success_count}/{len(files_to_convert)} files converted.")

if __name__ == "__main__":
    main()
