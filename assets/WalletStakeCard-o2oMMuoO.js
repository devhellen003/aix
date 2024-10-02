import {
    r as s,
    w as v,
    n as P,
    P as _,
    l as A,
    o as B,
    f as I,
    p as U,
    q as M,
    Q as W,
    j as e,
    O as f,
    s as C,
    m as y,
    I as O,
    E as T,
    R,
    F as D,
    C as X,
    T as Z
} from "./index-ew_iRevO.js";
import {
    C as w
} from "./CircleWithIcon-4Vl_lIvJ.js";
const G = t => s.createElement("svg", {
        width: 28,
        height: 18,
        viewBox: "0 0 28 18",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        ...t
    }, s.createElement("path", {
        d: "M13.6223 0.614494L8.20992 3.4962C7.92256 3.6492 7.92712 4.06259 8.21779 4.20921L11.7929 6.01254C11.849 6.04083 11.911 6.05557 11.9738 6.05557H18.5354C18.6012 6.05557 18.666 6.03939 18.7241 6.00846L27.5234 1.32342C27.8926 1.12688 27.7529 0.567383 27.3347 0.567383H13.811C13.7452 0.567383 13.6804 0.583561 13.6223 0.614494Z",
        fill: "url(#paint0_linear_487_19223)"
    }), s.createElement("path", {
        d: "M13.6223 16.8513L8.20992 13.9696C7.92256 13.8166 7.92712 13.4032 8.21779 13.2566L11.7929 11.4533C11.849 11.425 11.911 11.4102 11.9738 11.4102H18.5354C18.6012 11.4102 18.666 11.4264 18.7241 11.4574L27.5234 16.1424C27.8926 16.3389 27.7529 16.8984 27.3347 16.8984H13.811C13.7452 16.8984 13.6804 16.8823 13.6223 16.8513Z",
        fill: "url(#paint1_linear_487_19223)"
    }), s.createElement("path", {
        d: "M8.23041 17.5H0.67617C0.316902 17.5 0.138421 17.0643 0.394423 16.8123L7.97347 9.34983C8.13237 9.19337 8.13337 8.93741 7.97568 8.77973L0.381485 1.18553C0.128507 0.932553 0.307676 0.5 0.665441 0.5H8.69891C8.80541 0.5 8.90756 0.542309 8.98287 0.617619L14.3027 5.9375C14.3781 6.01281 14.4802 6.05512 14.5867 6.05512H20.2432C20.465 6.05512 20.6448 6.23491 20.6448 6.45669V11.0748C20.6448 11.2966 20.465 11.4764 20.2432 11.4764H14.5867C14.4802 11.4764 14.3781 11.5187 14.3027 11.594L8.51436 17.3824C8.43905 17.4577 8.33691 17.5 8.23041 17.5Z",
        fill: "#17191B"
    }), s.createElement("defs", null, s.createElement("linearGradient", {
        id: "paint0_linear_487_19223",
        x1: 17.867,
        y1: .567383,
        x2: 13.3634,
        y2: 6.45522,
        gradientUnits: "userSpaceOnUse"
    }, s.createElement("stop", {
        stopColor: "#17191B"
    }), s.createElement("stop", {
        offset: 1,
        stopColor: "#17191B",
        stopOpacity: 0
    })), s.createElement("linearGradient", {
        id: "paint1_linear_487_19223",
        x1: 17.867,
        y1: 16.8984,
        x2: 12.7271,
        y2: 11.8644,
        gradientUnits: "userSpaceOnUse"
    }, s.createElement("stop", {
        stopColor: "#17191B"
    }), s.createElement("stop", {
        offset: 1,
        stopColor: "#17191B",
        stopOpacity: 0
    })))),
    K = t => v(t).div(60).div(60).div(24).toString(),
    Q = ({
        stake: t
    }) => {
        const {
            fetchWalletStakes: i,
            fetchStakes: o,
            stakes: d
        } = P(), m = _(t.unstakeTimestamp), n = A(), {
            walletProvider: x
        } = B(), {
            chainId: g,
            isConnected: j,
            address: E
        } = I(), [{
            chainConfig: p
        }] = U(), {
            trackTx: N,
            trackError: k
        } = M(), [q, u] = s.useState(!1), S = j && g !== p.id, l = d.find(r => r.sec.toString() === t.period), h = W(() => {
            u(!1)
        });
        s.useEffect(() => (window.document.addEventListener("click", h), () => window.document.removeEventListener("click", h)), []);
        async function H() {
            if (S || !x) return;
            const r = new R(new D(x), E),
                L = new X(p.contracts.AIXRevenueSharing, Z, r);
            let a;
            try {
                n({
                    modalKey: "loader",
                    title: "Confirm your transaction in the wallet"
                }), a = await L.emergencyWithdraw(t.stakeId), n({
                    modalKey: "loader",
                    title: "Unstaking",
                    txHash: a.hash
                }), N(a), await a.wait(), n(null), o(), i()
            } catch (c) {
                throw k(c, a), n(null), console.error("unstake failed", c), c
            }
        }

        function b() {
            u(!1), H()
        }
        return e.jsxs("div", {
            className: "flex items-center my-5",
            children: [e.jsxs("div", {
                className: "flex flex-col",
                children: [e.jsxs("span", {
                    className: "text-4xl mb-1",
                    children: [l ? l.apy : t.apy, "% APY"]
                }), e.jsxs("span", {
                    className: "text-2xl mb-3",
                    children: [l ? l.apr : v(t.apr).div(100).toString(), "% APR"]
                }), e.jsxs("div", {
                    className: "flex items-center",
                    children: [e.jsxs("span", {
                        children: [K(t.period), " days Lockup"]
                    }), e.jsx("span", {
                        className: "ml-4 px-1.5 py-1.5 pb-1 bg-gray-700 opacity-50 rounded-xl",
                        children: m === "0" ? "Claim available" : m
                    })]
                })]
            }), e.jsxs("div", {
                className: "flex ml-auto",
                children: [e.jsxs(f, {
                    className: "flex items-center p-4 rounded-2xl",
                    children: [e.jsx(w, {
                        icon: e.jsx(G, {})
                    }), e.jsxs("div", {
                        className: "flex flex-col ml-4",
                        children: [e.jsxs("span", {
                            className: "text-xl",
                            children: [C(y(t.stakedAmount, {
                                decimals: 18
                            })), " AIX"]
                        }), e.jsx("span", {
                            className: "opacity-40",
                            children: "Staked"
                        })]
                    })]
                }), e.jsxs(f, {
                    className: "flex items-center p-4 ml-3 rounded-2xl",
                    children: [e.jsx(w, {
                        icon: e.jsx(O, {
                            className: "text-black text-2xl",
                            icon: "logos:ethereum"
                        })
                    }), e.jsxs("div", {
                        className: "flex flex-col ml-4",
                        children: [e.jsxs("span", {
                            className: "text-xl",
                            children: [C(y(t.availableReward, {
                                decimals: 18
                            }), 4), " ETH"]
                        }), e.jsx("span", {
                            className: "opacity-40",
                            children: "Unclaimed ETH"
                        })]
                    })]
                }), e.jsx(T, {
                    label: "Unstake",
                    className: "self-center ml-6",
                    onClick: b
                })]
            })]
        })
    };
export {
    Q as W
};
//# sourceMappingURL=WalletStakeCard-o2oMMuoO.js.map