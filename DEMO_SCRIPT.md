# 5-minute demo script + judge Q&A

## Flow
1. **Hook (20 s).** "A $2/t freight swing on one 170,000 t Capesize voyage is $340,000. Importers decide by phone and spreadsheet. FreightIQ answers: book now or wait?"
2. **Decision tab (60 s).** Paradip, South Africa, 150,000 t, 6-week window. Point at the *range* ("not one number"), the recommendation, expected vs worst-case cost, and the drivers.
3. **Port feasibility (45 s).** Switch to Visakhapatnam: Capesize becomes ⚠️ part-loaded. Switch to Haldia: Capesize ❌. "The cheapest ship per tonne is often the one that cannot dock."
4. **Time machine (90 s).** Toggle replay → **2023-08-27**, Paradip, Australia. The model sees only data up to that date; it says WAIT ~6 weeks; the green line shows what happened. Then replay **2023-07-02** (Visakhapatnam, Australia): this one *loses*. Say so. "One decision is an anecdote; here is the full record."
5. **Backtest tab (60 s).** 738 decisions, forecast error ~11% below naive, 80% band covers 78.8%, zero port-limit violations, wins 6.2% vs losses 3.9%, sensitivity table shown in full. Be upfront about what the data is.
6. **Close (30 s).** Roadmap: licensed feeds, more cargoes, contract advice, subscription pilots.

## Likely judge questions (honest answers)
- **"Is this real data?"** Say exactly what it is. If you have swapped in real CSVs, quote the real numbers. If not: "The demo uses a synthetic market with realistic structure to prove the pipeline and the no-look-ahead protocol; the loader takes real CSVs with no code change." Never present synthetic results as real findings.
- **"Why are savings small?"** "Timing alone is a modest edge, and we show the sensitivity to waiting cost. The larger value is avoiding infeasible or part-loaded bookings and quantifying worst-case risk."
- **"Why not just LSTM/Transformer?"** Small weekly data, need calibrated quantiles, and a gate that falls back to naive when the model does not beat it.
- **"How is the range trustworthy?"** Conformal calibration; measured coverage 78.8% vs 80% target.
- **"Port limits accurate?"** Configurable, dated, manual override; each flagged verified/unverified.
- **"What is the limitation?"** Static wait-plan (not re-planning policy), proxy data, simplified demurrage model, single congestion index.
