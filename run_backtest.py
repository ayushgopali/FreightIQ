"""python run_backtest.py  -> writes results/backtest_summary.json and results/backtest_decisions.csv"""
from freightiq.backtest import run
import json

if __name__ == "__main__":
    s, _ = run()
    print(json.dumps({k: v for k, v in s.items() if not isinstance(v, dict)}, indent=2))
