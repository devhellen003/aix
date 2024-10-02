import {
    e as z,
    f as K,
    o as Q,
    p as Y,
    l as J,
    q as Z,
    n as ee,
    r as a,
    t as te,
    v as ne,
    w as d,
    x as X,
    k as ae,
    C as h,
    y as se,
    z as ie,
    j as e,
    O as b,
    D as re,
    d as oe,
    I as M,
    E as S,
    L as le,
    U as ue,
    m as v,
    F as pe,
    G as R
} from "./index-ew_iRevO.js";
import {
    W as ye
} from "./WalletStakeCard-o2oMMuoO.js";
import "./CircleWithIcon-4Vl_lIvJ.js";
const V = [{
        inputs: [{
            internalType: "address",
            name: "_aix",
            type: "address"
        }, {
            internalType: "address",
            name: "_agx",
            type: "address"
        }, {
            internalType: "bytes32",
            name: "_merkleRoot",
            type: "bytes32"
        }, {
            internalType: "address",
            name: "_questsVerifier",
            type: "address"
        }, {
            internalType: "bool",
            name: "_swapAIXToETHEnabled",
            type: "bool"
        }],
        stateMutability: "nonpayable",
        type: "constructor"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "user",
            type: "address"
        }, {
            indexed: !1,
            internalType: "bytes32",
            name: "merkleRoot",
            type: "bytes32"
        }],
        name: "MerkleRootUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "user",
            type: "address"
        }, {
            indexed: !1,
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }],
        name: "Migrated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "bool",
            name: "active",
            type: "bool"
        }],
        name: "MigrationActiveUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "previousOwner",
            type: "address"
        }, {
            indexed: !0,
            internalType: "address",
            name: "newOwner",
            type: "address"
        }],
        name: "OwnershipTransferred",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !0,
            internalType: "address",
            name: "user",
            type: "address"
        }, {
            indexed: !1,
            internalType: "address",
            name: "questsVerifier",
            type: "address"
        }],
        name: "QuestsVerifierUpdated",
        type: "event"
    }, {
        anonymous: !1,
        inputs: [{
            indexed: !1,
            internalType: "bool",
            name: "enabled",
            type: "bool"
        }],
        name: "SwapAIXToETHEnabledUpdated",
        type: "event"
    }, {
        inputs: [],
        name: "WETH",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "active",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "agx",
        outputs: [{
            internalType: "contract IERC20",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "aix",
        outputs: [{
            internalType: "contract IERC20",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        name: "claimedAmount",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "user",
            type: "address"
        }],
        name: "getEthSignedMessageHash",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "user",
            type: "address"
        }],
        name: "getSignableMessage",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "pure",
        type: "function"
    }, {
        inputs: [],
        name: "merkleRoot",
        outputs: [{
            internalType: "bytes32",
            name: "",
            type: "bytes32"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }, {
            internalType: "uint256",
            name: "maxClaimableAmount",
            type: "uint256"
        }, {
            internalType: "bytes32[]",
            name: "proof",
            type: "bytes32[]"
        }, {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
        }, {
            internalType: "uint256",
            name: "minAmountETHOut",
            type: "uint256"
        }],
        name: "migrate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "owner",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "questsVerifier",
        outputs: [{
            internalType: "address",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bool",
            name: "_active",
            type: "bool"
        }],
        name: "setActive",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bytes32",
            name: "_merkleRoot",
            type: "bytes32"
        }],
        name: "setMerkleRoot",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "_questsVerifier",
            type: "address"
        }],
        name: "setQuestsVerifier",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "bool",
            name: "_enabled",
            type: "bool"
        }],
        name: "setSwapAIXToETHEnabled",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "swapAIXToETHEnabled",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }, {
            internalType: "uint256",
            name: "minAmountETHOut",
            type: "uint256"
        }],
        name: "swapAIXtoETH",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "newOwner",
            type: "address"
        }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "uniswapV2Router",
        outputs: [{
            internalType: "contract IDexRouter",
            name: "",
            type: "address"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "user",
            type: "address"
        }, {
            internalType: "uint256",
            name: "maxClaimableAmount",
            type: "uint256"
        }, {
            internalType: "bytes32[]",
            name: "proof",
            type: "bytes32[]"
        }],
        name: "verifyMerkleProof",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [{
            internalType: "address",
            name: "user",
            type: "address"
        }, {
            internalType: "bytes",
            name: "signature",
            type: "bytes"
        }],
        name: "verifySignature",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }, {
        inputs: [],
        name: "withdrawAGX",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "withdrawAIX",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        inputs: [],
        name: "withdrawETH",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }, {
        stateMutability: "payable",
        type: "receive"
    }],
    H = z("components:Migration"),
    be = () => {
        const {
            address: s
        } = K(), {
            walletProvider: A
        } = Q(), [{
            chainConfig: i,
            appRpcProvider: f
        }] = Y(), p = J(), {
            trackTx: _,
            trackError: O
        } = Z(), {
            walletStakes: j
        } = ee(), [t, x] = a.useState(null), [q, I] = a.useState(!0), [u, E] = a.useState(!1), [y, m] = a.useState("0"), [g, L] = a.useState("0"), [N, B] = a.useState("0"), [P, U] = te(i.contracts.AIX, s, i.contracts.AIXMigration), W = ne(i.contracts.AIX, i.contracts.AIXMigration, "Approving"), k = d(P).lt(X(y));
        a.useEffect(() => {
            if (!s) {
                x(null);
                return
            }
            I(!0), ae.get(`https://raw.githubusercontent.com/vsmelov/AIX-migration-proofs/refs/heads/main/proofs/${s.toLowerCase()}.json`).then(n => {
                x(n.data), E(!1)
            }).catch(() => {
                E(!0), x(null)
            }).finally(() => I(!1))
        }, [s]);
        const T = a.useMemo(() => new h(i.contracts.AIXMigration, V, f), [i, f]);
        a.useEffect(() => {
            C()
        }, [s, T, u]);

        function C() {
            if (!s || !T || u) return;
            const n = new h(i.contracts.AIX, se, f);
            Promise.all([n.balanceOf(s), T.claimedAmount(s)]).then(([r, o]) => {
                L(r.toString()), B(o.toString())
            })
        }
        const w = a.useMemo(() => {
            if (!t || d(g).eq(0)) return "0";
            const {
                claimableAmount: n
            } = t, r = d(n).minus(N);
            return ie.min(r, g).toString()
        }, [t, N, g]);
        async function D() {
            if (!t || !A) return;
            const n = X(y);
            k && (await W(n), await U());
            const {
                claimableAmount: r,
                proof: o
            } = t;
            let l;
            try {
                const G = await new pe(A).getSigner(),
                    $ = new h(i.contracts.AIXMigration, V, G);
                p({
                    modalKey: "loader",
                    title: "Confirm your transaction in the wallet"
                }), l = await $.migrate(n, r, o, "0x", "0"), p({
                    modalKey: "loader",
                    title: `Migrate ${y} AIX...`,
                    txHash: l.txHash
                }), _(l), H("tx", l), await l.wait(), p(null), m("0"), C(), H(`${n} AIX successfully migrated.`)
            } catch (c) {
                throw O(c, l), p(null), console.error("Migrate action failed:", c), c
            }
        }

        function F(n) {
            const r = R(n.target.value),
                o = v(w, {
                    cut: !1
                });
            if (d(r).gt(o)) {
                m(o);
                return
            }
            m(R(n.target.value))
        }
        return e.jsxs("div", {
            className: "container mx-auto flex-grow gap-4 flex flex-col",
            children: [e.jsxs(b, {
                className: "flex items-center justify-between bg-[length:auto_100%] bg-no-repeat bg-right-bottom !py-12 pr-28 pl-10",
                style: {
                    backgroundImage: "url(/images/migration/migrate-bg.png)"
                },
                children: [e.jsxs("h2", {
                    className: "text-3xl",
                    children: ["Migrating tokens into", e.jsx("br", {}), "a new AGX token"]
                }), e.jsx("img", {
                    className: "w-64",
                    src: "/images/migration/migrate-logos.png"
                })]
            }), !u && !(t != null && t.manualVerificationRequired) && e.jsxs(b, {
                className: "flex items-center justify-between mb-4",
                children: [e.jsx("h3", {
                    className: "text-2xl",
                    children: "Share this event on Twitter and support the project"
                }), e.jsx(re, {
                    to: "https://twitter.com/intent/retweet?tweet_id=1838591198539452810",
                    target: "_blank",
                    className: "flex-shrink-0",
                    children: e.jsx(oe, {
                        className: "flex-shrink-0",
                        size: "xl",
                        children: "Share"
                    })
                })]
            }), e.jsx(b, {
                children: s ? q ? e.jsx(le, {
                    label: "Loading proofs"
                }) : u ? e.jsxs("div", {
                    className: "flex flex-col items-center",
                    children: [e.jsx(M, {
                        icon: "fa6-solid:triangle-exclamation",
                        className: "text-3xl mb-4"
                    }), e.jsx("p", {
                        className: "text-xl text-center",
                        children: "Your wallet not in the migrate list"
                    })]
                }) : t != null && t.manualVerificationRequired ? e.jsxs("div", {
                    className: "flex flex-col items-center",
                    children: [e.jsx(M, {
                        icon: "fa6-solid:triangle-exclamation",
                        className: "text-3xl mb-4"
                    }), e.jsx("p", {
                        className: "text-xl text-center",
                        children: t.manualVerificationExplain
                    })]
                }) : e.jsxs(e.Fragment, {
                    children: [e.jsx(ue, {
                        name: "migrateValue",
                        value: y,
                        onChange: F,
                        labelEnd: e.jsxs("span", {
                            className: "cursor-pointer",
                            onClick: () => m(v(w, {
                                cut: !1
                            })),
                            children: ["Max: ", v(w)]
                        })
                    }), e.jsx(S, {
                        label: k ? "Approve and migrate" : "Migrate",
                        className: "w-full",
                        onClick: D
                    })]
                }) : e.jsxs("div", {
                    className: "flex flex-col items-center",
                    children: [e.jsx(M, {
                        icon: "fa6-solid:triangle-exclamation",
                        className: "text-3xl mb-4"
                    }), e.jsx("p", {
                        className: "text-xl text-center mb-4",
                        children: "Connect your wallet to interact"
                    }), e.jsx(S, {
                        label: "Connect wallet"
                    })]
                })
            }), !u && !(t != null && t.manualVerificationRequired) && e.jsx(e.Fragment, {
                children: j.length !== 0 && e.jsx(b, {
                    children: j.map(n => e.jsx(ye, {
                        stake: n
                    }, n.stakeId))
                })
            })]
        })
    };
export {
    be as Migration
};
//# sourceMappingURL=migration-Be-njFAo.js.map