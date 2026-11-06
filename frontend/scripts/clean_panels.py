import re
from pathlib import Path

CONSOLE_DIR = Path(r"C:\Users\Anirudh\OneDrive\Desktop\FreightIQ\freightiq\frontend\src\components\console")

def clean_file(filename):
    file_path = CONSOLE_DIR / filename
    code = file_path.read_text(encoding="utf-8")

    # 1. Remove "use strict";
    code = re.sub(r'["\']use strict["\'];\s*', '', code)

    # 2. Remove __webpack_require__ lines
    code = re.sub(r'__webpack_require__\..*?;\s*', '', code)

    # 3. Remove _c = ... / _c2 = ...
    code = re.sub(r'^\s*_c\d*\s*=.*?;?\s*$', '', code, flags=re.MULTILINE)

    # 4. Remove react_jsx_dev_runtime Fragment tags
    code = re.sub(r'<react_jsx_dev_runtime__\w+\.Fragment>', '<>', code)
    code = re.sub(r'</react_jsx_dev_runtime__\w+\.Fragment>', '</>', code)

    # 5. Fix ForecastChart call in DecidePanel
    code = re.sub(
        r'\(0,\s*react_jsx_dev_runtime__\w+\.jsxDEV\)\(ForecastChart,\s*\{[\s\S]*?\},[^)]*?\)',
        '<ForecastChart history={fc?.history || []} forecast={fc?.forecast || []} />',
        code
    )

    # 6. Remove data-ve-dynamic span wrappers:
    # <span data-ve-dynamic="true" style={{\s*display: "contents"\s*}}>(\{.*?\}|\w+)</span> -> \1
    code = re.sub(
        r'<span\s+data-ve-dynamic="true"\s+style=\{\{\s*display:\s*"contents"\s*\}\}>(\{[\s\S]*?\})</span>',
        r'\1',
        code
    )
    code = re.sub(
        r'<span\s+data-ve-dynamic="true"\s+style=\{\{\s*display:\s*"contents"\s*\}\}>([^<]+)</span>',
        r'\1',
        code
    )

    # 7. Clean (0, func) calls
    code = re.sub(r'\(0,\s*([a-zA-Z0-9_]+)\)', r'\1', code)

    # 8. Clean null/void checks
    code = re.sub(r'\((dec|fc|res)\s*===\s*null\s*\|\|\s*\1\s*===\s*void\s*0\s*\?\s*void\s*0\s*:\s*\1\.(\w+)\)', r'\1?.\2', code)

    file_path.write_text(code.strip() + "\n", encoding="utf-8")
    print(f"Cleaned {filename}")

clean_file("BacktestPanel.jsx")
clean_file("TimeMachinePanel.jsx")
clean_file("DecidePanel.jsx")
