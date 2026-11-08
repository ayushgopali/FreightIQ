"""FreightIQ dashboard.  Run:  streamlit run app.py"""
import json
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from freightiq.config import SHIPS, HORIZONS, RESULTS_DIR, ORIGINS
from freightiq.datagen import load_market
from freightiq.forecast import build_features, Forecaster
from freightiq.decision import evaluate
from freightiq.ports import load_ports, screen

st.set_page_config(page_title="FreightIQ", page_icon="🚢", layout="wide")
BLUE, GREEN, AMBER, RED = "#2E86DE", "#2ECC71", "#F5A623", "#E74C3C"
st.markdown("""<style>
.block-container{padding-top:1.4rem} .card{background:#111B2E;border:1px solid #1E2D4A;border-radius:12px;padding:16px 20px}
.big{font-size:2.1rem;font-weight:800;line-height:1.1} .muted{color:#8FA3C0;font-size:.85rem}
</style>""", unsafe_allow_html=True)


@st.cache_resource
def get_market():
    market = load_market()
    return market, build_features(market)


@st.cache_resource(show_spinner="Training forecast models (quantile gradient boosting)...")
def get_model(asof: str):
    return Forecaster().fit(feat, pd.Timestamp(asof))


market, feat = get_market()
ports = load_ports()
rates, cong = market["rates"], market["congestion"]
all_dates = list(rates.index)
latest = feat["date"].max()

# ---------------- sidebar ----------------
with st.sidebar:
    st.markdown("## 🚢 FreightIQ")
    st.caption("Forecast-driven chartering decisions for East Coast coal imports")
    port_name = st.selectbox("Discharge port", list(ports), index=0)
    origin = st.selectbox("Load origin", ORIGINS, index=1)
    cargo = st.number_input("Cargo (tonnes)", 20_000, 600_000, 150_000, step=10_000)
    window = st.slider("Laycan flexibility (weeks you can wait)", 0, HORIZONS, 6)
    st.markdown("**Risk & cost settings**")
    risk = st.slider("Risk aversion (weight on worst case)", 0.0, 1.0, 0.3, 0.05)
    wait_cost = st.number_input("Cost of waiting ($/t/week)", 0.0, 1.0, 0.05, 0.01,
                                help="Supply-risk / inventory cost of delaying the cargo")
    dem_mult = st.slider("Demurrage multiplier", 0.5, 2.0, 1.0, 0.1)
    margin = st.slider("Min. saving to justify waiting (%)", 0.0, 5.0, 1.0, 0.5)
    st.divider()
    replay = st.toggle("⏪ Time machine: replay a past date", value=False,
                       help="Model trains only on data known at that date; then compare with what actually happened.")
    if replay:
        opts = [d for d in all_dates[-170:-HORIZONS - 1]]
        today = st.select_slider("Decision date", options=opts, value=opts[-30], format_func=lambda d: str(d.date()))
    else:
        today = latest
    st.caption(f"Data: **{market['source']}** · as of {today.date()}")
    if market["source"] == "synthetic":
        st.warning("Synthetic market data (demo). Add real CSVs in data/real/ to switch.", icon="⚠️")

port = ports[port_name]
model = get_model(str(today.date()))
now_rows = feat[feat["date"] == today]
idx = {(r.origin, r.cls): i for i, r in enumerate(now_rows.itertuples())}
preds = model.predict(now_rows)
fc = {c: preds[idx[(origin, c)]] for c in SHIPS}
now = {c: float(rates.loc[today, (origin, c)]) for c in SHIPS}
cz = float(cong.loc[today])
res = evaluate(port, cargo, fc, now, cz, window, wait_cost, risk, margin, dem_mult)

st.title("Book now or wait?")
st.caption(f"{origin} → {port_name} · {cargo:,.0f} t of coal · decision date {today.date()}")
tabs = st.tabs(["🎯 Decision", "⚓ Port feasibility", "💵 Cost scenarios", "📊 Backtest evidence", "🧪 Data & method"])

# ---------------- decision ----------------
with tabs[0]:
    if not res["feasible"]:
        st.error("No ship class can serve this port with the given cargo. Check port limits.")
    else:
        b, ref = res["best"], res["book_now_same_ship"]
        c1, c2, c3, c4 = st.columns([1.5, 1, 1, 1])
        color = GREEN if res["action"] == "BOOK NOW" else AMBER
        c1.markdown(f"<div class='card'><div class='muted'>RECOMMENDATION</div><div class='big' style='color:{color}'>{res['action']}</div>"
                    f"<div class='muted'>{b['ship']} · {b['voyages']} voyage(s) · {b['load']:,.0f} t/ship</div></div>", unsafe_allow_html=True)
        c2.metric("Expected cost", f"${b['expected_pt']:.2f}/t", f"{-res['saving_pt']:+.2f} vs book now" if res["saving_pt"] else None, delta_color="inverse")
        c3.metric("Worst-case (P90)", f"${b['worst_pt']:.2f}/t", f"{res['worst_delta_pt']:+.2f} vs book now" if b["wait_weeks"] else None, delta_color="inverse")
        c4.metric("Expected saving (cargo)", f"${res['saving_total']:,.0f}")

        hist = rates[(origin, b["ship"])].loc[:today].iloc[-52:]
        fut_dates = [today + pd.Timedelta(weeks=h) for h in range(1, HORIZONS + 1)]
        q = fc[b["ship"]]
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=hist.index, y=hist.values, name="History", line=dict(color="#8FA3C0", width=2)))
        fig.add_trace(go.Scatter(x=fut_dates + fut_dates[::-1], y=list(q[:, 2]) + list(q[::-1, 0]), fill="toself",
                                 fillcolor="rgba(46,134,222,.25)", line=dict(width=0), name="80% forecast range"))
        fig.add_trace(go.Scatter(x=fut_dates, y=q[:, 1], name="Median forecast", line=dict(color=BLUE, dash="dash", width=3)))
        if replay:
            real = rates[(origin, b["ship"])].loc[today:].iloc[:HORIZONS + 1]
            fig.add_trace(go.Scatter(x=real.index, y=real.values, name="What actually happened", line=dict(color=GREEN, width=3)))
        if b["wait_weeks"] > 0:
            fig.add_trace(go.Scatter(x=[fut_dates[b["wait_weeks"] - 1]], y=[q[b["wait_weeks"] - 1, 1]], mode="markers",
                                     marker=dict(size=14, color=AMBER, symbol="star"), name="Recommended booking week"))
        fig.update_layout(template="plotly_dark", height=380, margin=dict(l=10, r=10, t=40, b=10),
                          title=f"{b['ship']} freight, {origin} ($/tonne): forecast range, not a single number",
                          yaxis_title="$/tonne", legend=dict(orientation="h", y=-0.2))
        st.plotly_chart(fig, width='stretch')

        st.markdown("#### Why this advice (drivers)")
        s = now_rows[(now_rows.origin == origin) & (now_rows.cls == b["ship"])].iloc[0]
        k = max(b["wait_weeks"], 4)
        exp_chg = (fc[b["ship"]][k - 1, 1] / now[b["ship"]] - 1) * 100
        cong_pct = float((cong <= cz).mean() * 100)
        d1, d2, d3, d4 = st.columns(4)
        d1.metric("Rate trend (4 wk)", f"{s.mom4 * 100:+.1f}%", help="Recent momentum in the freight rate")
        d2.metric("vs 52-wk average", f"{s.dev52 * 100:+.1f}%", help="Rates far above average tend to mean-revert")
        d3.metric(f"Median forecast ({k} wk)", f"{exp_chg:+.1f}%")
        d4.metric("Port congestion", f"{cong_pct:.0f}th pct", f"~{res['wait_days']:.1f} days wait at {port_name}", delta_color="off")
        memo = (f"FreightIQ decision memo\n{origin} -> {port_name}, {cargo:,.0f} t, as of {today.date()}\n"
                f"Recommendation: {res['action']} using {b['ship']}\nExpected cost ${b['expected_pt']:.2f}/t, worst case (P90) ${b['worst_pt']:.2f}/t\n"
                f"Expected saving vs booking now on same ship: ${res['saving_total']:,.0f}\n"
                f"Drivers: 4wk trend {s.mom4*100:+.1f}%, vs 52wk avg {s.dev52*100:+.1f}%, median forecast {exp_chg:+.1f}%, congestion {cong_pct:.0f}th pct\n"
                f"Data source: {market['source']}. Forecasts are probabilistic; not financial advice.\n")
        if replay:
            sc_ = screen(b["ship"], port, cargo)
            part_ = SHIPS[b["ship"]]["dwt"] / sc_["usable_load"]

            def realised(kk):
                dd = rates.index[all_dates.index(today) + kk]
                wd = port["base_wait_days"] * float(np.exp(0.5 * float(cong.loc[dd])))
                return float(rates.loc[dd, (origin, b["ship"])]) * part_ + wd * SHIPS[b["ship"]]["demurrage"] * dem_mult / sc_["usable_load"] + wait_cost * kk
            gain = realised(0) - realised(b["wait_weeks"])
            st.markdown("#### ⏪ In hindsight")
            h1, h2, h3 = st.columns(3)
            h1.metric("Actual cost if booked now", f"${realised(0):.2f}/t")
            h2.metric(f"Actual cost following advice", f"${realised(b['wait_weeks']):.2f}/t")
            h3.metric("Realised saving", f"${gain * cargo:,.0f}", f"{gain:+.2f} $/t")
            st.caption("One decision is an anecdote, not evidence. See the Backtest tab for the full record, including losses.")
        st.download_button("⬇️ Download decision memo", memo, file_name="freightiq_decision_memo.txt")

# ---------------- port feasibility ----------------
with tabs[1]:
    st.markdown(f"#### Ship screening at **{port_name}** (limits: LOA {port['max_loa']} m · beam {port['max_beam']} m · draft {port['max_draft']} m)")
    if not port.get("verified"):
        st.warning("Port limits are indicative placeholders. Verify against the port authority before relying on them.", icon="⚠️")
    rows = []
    for c, sp in SHIPS.items():
        sc = screen(c, port, cargo)
        rows.append({"Ship class": c, "DWT": f"{sp['dwt']:,}", "Status": "✅ Feasible" if sc["feasible"] and sc["utilisation"] > .999 else ("⚠️ Part-load" if sc["feasible"] else "❌ Not feasible"),
                     "Usable load (t)": f"{sc['usable_load']:,.0f}", "Voyages": sc["voyages"], "Why": sc["reason"]})
    st.dataframe(pd.DataFrame(rows), hide_index=True, width='stretch')
    st.markdown("#### All East Coast ports × ship classes")
    mat = {p: {c: ("✅" if (s := screen(c, pd_, cargo))["feasible"] and s["utilisation"] > .999 else "⚠️" if s["feasible"] else "❌") for c in SHIPS} for p, pd_ in ports.items()}
    st.dataframe(pd.DataFrame(mat).T, width='stretch')
    st.caption("✅ full cargo · ⚠️ part-loaded (draft-limited) · ❌ cannot call. New ports are added in data/ports.json, with no code changes.")

# ---------------- cost scenarios ----------------
with tabs[2]:
    if res["feasible"]:
        opt = pd.DataFrame(res["options"])
        ship_sel = st.selectbox("Ship class", sorted(opt.ship.unique()), index=sorted(opt.ship.unique()).index(res["best"]["ship"]))
        o = opt[opt.ship == ship_sel]
        f2 = go.Figure()
        f2.add_trace(go.Scatter(x=o.wait_weeks, y=o.expected_pt, name="Expected cost", mode="lines+markers", line=dict(color=BLUE, width=3)))
        f2.add_trace(go.Scatter(x=o.wait_weeks, y=o.worst_pt, name="Worst case (P90)", mode="lines+markers", line=dict(color=RED, dash="dot")))
        f2.update_layout(template="plotly_dark", height=360, xaxis_title="Weeks waited before booking", yaxis_title="$/tonne all-in",
                         margin=dict(l=10, r=10, t=30, b=10), legend=dict(orientation="h", y=-0.25))
        st.plotly_chart(f2, width='stretch')
        st.dataframe(o[["wait_weeks", "freight_pt", "demurrage_pt", "waiting_pt", "expected_pt", "worst_pt"]].rename(columns={
            "wait_weeks": "Wait (wk)", "freight_pt": "Freight $/t", "demurrage_pt": "Demurrage $/t", "waiting_pt": "Waiting cost $/t",
            "expected_pt": "Expected $/t", "worst_pt": "Worst-case $/t"}).round(2), hide_index=True, width='stretch')
        st.caption("Daily expected cost = freight + waiting/demurrage + congestion delay. Part-loaded ships pay freight on tonnes not lifted.")

# ---------------- backtest ----------------
with tabs[3]:
    p = RESULTS_DIR / "backtest_summary.json"
    if not p.exists():
        st.info("Run `python run_backtest.py` to generate backtest evidence.")
    else:
        s = json.loads(p.read_text())
        if s["data_source"] == "synthetic":
            st.warning("These results come from SYNTHETIC market data. They demonstrate the pipeline and the no-look-ahead protocol, not real-world performance.", icon="⚠️")
        st.caption(f"Walk-forward replay · {s['n_decisions']:,} decisions · {s['test_period'][0]} → {s['test_period'][1]} · only data known on each date is used")
        a, b_, c, d = st.columns(4)
        a.metric("Forecast error vs naive", f"{s['mae_improvement_pct']:.1f}% lower")
        b_.metric("80% range coverage", f"{s['coverage80_overall'] * 100:.1f}%", "target 80%", delta_color="off")
        c.metric("Avg cost saving vs book-now", f"${s['mean_saving_pt']:.3f}/t", f"{s['saving_pct']:.2f}%")
        d.metric("Port-limit violations", f"{s['port_violations_iq']}")
        e, f_, g = st.columns(3)
        e.metric("Decisions that beat baseline", f"{s['win_rate_pct']:.1f}%")
        f_.metric("Decisions worse than baseline", f"{s['loss_rate_pct']:.1f}%")
        g.metric("Decisions that chose to wait", f"{s['waited_pct']:.1f}%")
        hs = sorted(map(int, s["mae_model_vs_naive_by_h"]))
        fig = go.Figure()
        fig.add_bar(x=[f"{h}w" for h in hs], y=[s["mae_model_vs_naive_by_h"][str(h)][1] for h in hs], name="Naive (no change)", marker_color="#8FA3C0")
        fig.add_bar(x=[f"{h}w" for h in hs], y=[s["mae_model_vs_naive_by_h"][str(h)][0] for h in hs], name="FreightIQ median", marker_color=BLUE)
        fig.update_layout(template="plotly_dark", barmode="group", height=320, yaxis_title="MAE ($/t)", title="Forecast error by horizon",
                          margin=dict(l=10, r=10, t=40, b=10))
        st.plotly_chart(fig, width='stretch')
        sp = RESULTS_DIR / "sensitivity.csv"
        if sp.exists():
            st.markdown("**Sensitivity: how savings depend on the cost of waiting** (full sweep, not cherry-picked)")
            st.dataframe(pd.read_csv(sp).rename(columns={"wait_cost_pt_wk": "Wait cost $/t/wk", "margin_pct": "Min saving %", "saving_pct": "Saving %",
                                                         "saving_pt": "Saving $/t", "win": "Win %", "loss": "Loss %", "waited": "Waited %", "p5": "5th-pct $/t"}),
                         hide_index=True, width='stretch')

# ---------------- method ----------------
with tabs[4]:
    st.markdown("""
**Pipeline:** inputs → data layer → forecast → port screen → decision

- **Forecast:** per (origin, ship class), 8-week horizon. Quantile gradient boosting (10/50/90%) on momentum, mean-reversion, seasonality, congestion and coal-price features, with **conformal calibration** so the 80% band is honest. A per-horizon **gate falls back to a naive forecast** whenever the model does not beat it.
- **Port screen:** hard constraints (length, beam, draft with under-keel margin). Draft-limited ships are shown as part-loaded and pay freight on tonnes they cannot lift.
- **Decision:** simulate all-in cost (freight + demurrage from congestion + waiting cost) for *book now* vs *wait k weeks*, take the expected and P90 cost, and wait only if the risk-adjusted saving clears a minimum margin.
- **Known simplification:** each wait option is evaluated on its own forecast distribution (a static plan, not a re-planning policy).
- **Data:** synthetic stand-in in this build. Real data plugs in through `data/real/*.csv` with no code changes.
""")
