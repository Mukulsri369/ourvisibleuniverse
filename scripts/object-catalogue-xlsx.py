"""Formats the object catalogue JSON from object-catalogue-rows.ts as an Excel workbook.

Usage: npx tsx scripts/object-catalogue-rows.ts | python scripts/object-catalogue-xlsx.py OUTPUT.xlsx
Needs Python 3 with openpyxl.
"""
import json
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

FONT = "Arial"
HEADER = PatternFill("solid", start_color="1F2A44")
DISTANCE_FORMAT = "#,##0.###"


def quoted(name):
    return "'" + name.replace("'", "''") + "'"


def write_table(ws, columns, rows):
    ws.append(columns)
    for cell in ws[1]:
        cell.font = Font(name=FONT, bold=True, color="FFFFFF")
        cell.fill = HEADER
        cell.alignment = Alignment(vertical="center", wrap_text=True)
    for row in rows:
        ws.append(row)
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.font = Font(name=FONT)
    for i, header in enumerate(columns, start=1):
        letter = get_column_letter(i)
        if "light-years" in header and "Diameter" not in header:
            for (cell,) in ws.iter_rows(min_row=2, min_col=i, max_col=i):
                cell.number_format = DISTANCE_FORMAT
        longest = max([len(header)] + [len(str(r[i - 1])) for r in rows[:500] if r[i - 1] is not None])
        ws.column_dimensions[letter].width = min(max(longest + 2, 10), 60)
    ws.row_dimensions[1].height = 32
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = ws.dimensions


def main():
    data = json.loads(sys.stdin.buffer.read())
    sheets = data["sheets"]
    wb = Workbook()
    readme = wb.active
    readme.title = "Read Me"

    for sheet in sheets:
        write_table(wb.create_sheet(sheet["name"]), sheet["columns"], sheet["rows"])

    readme["A1"] = "Our Visible Universe — Object Catalogue"
    readme["A1"].font = Font(name=FONT, bold=True, size=16)
    lines = [
        f"Every object plotted in the 3D universe at ourvisibleuniverse.com, as of {data['generated']}.",
        "Each category has its own sheet. Use the filter arrows in the header row to sort or narrow a list.",
        "'All Objects' lists everything in one table; filter its Category column to find a group.",
        "Distances are the adopted values used by the 3D model. Some positions and visuals are reconstructions; the in-app dossier says which.",
        "'Not identified' as a host galaxy means no individual host galaxy has been identified.",
        "Questions or corrections: support@ourvisibleuniverse.com",
    ]
    for i, text in enumerate(lines, start=3):
        readme.cell(row=i, column=1, value=text).font = Font(name=FONT)

    top = len(lines) + 4
    for col, header in enumerate(["Category", "Objects", "Open sheet"], start=1):
        cell = readme.cell(row=top, column=col, value=header)
        cell.font = Font(name=FONT, bold=True, color="FFFFFF")
        cell.fill = HEADER
    for i, sheet in enumerate(sheets[1:], start=top + 1):
        name = sheet["name"]
        readme.cell(row=i, column=1, value=name).font = Font(name=FONT)
        count = readme.cell(row=i, column=2, value=f"=COUNTA({quoted(name)}!A:A)-1")
        count.font = Font(name=FONT)
        count.number_format = "#,##0"
        link = readme.cell(row=i, column=3, value=f"Go to {name}")
        link.hyperlink = f"#{quoted(name)}!A1"
        link.font = Font(name=FONT, color="0563C1", underline="single")
    last = top + len(sheets) - 1
    total = readme.cell(row=last + 1, column=2, value=f"=SUM(B{top + 1}:B{last})")
    total.font = Font(name=FONT, bold=True)
    total.number_format = "#,##0"
    readme.cell(row=last + 1, column=1, value="Total").font = Font(name=FONT, bold=True)
    all_link = readme.cell(row=last + 1, column=3, value="Go to All Objects")
    all_link.hyperlink = f"#{quoted(sheets[0]['name'])}!A1"
    all_link.font = Font(name=FONT, color="0563C1", underline="single")
    readme.column_dimensions["A"].width = 34
    readme.column_dimensions["B"].width = 12
    readme.column_dimensions["C"].width = 34

    wb.properties.title = "Our Visible Universe — Object Catalogue"
    wb.properties.creator = "Our Visible Universe"
    wb.save(sys.argv[1])


if __name__ == "__main__":
    main()
