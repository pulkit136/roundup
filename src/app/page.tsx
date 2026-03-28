"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Settings, Loader2, Zap, Shield, ArrowDownLeft, ExternalLink } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { VAULT_ADDRESS, VAULT_ABI } from "@/lib/contract";

type DepositEntry = {
  spendAmount: string;
  savedAmount: string;
  timestamp: string;
  txHash: string;
};

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const [roundupEnabled, setRoundupEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [latestRoundup, setLatestRoundup] = useState<null | number>(null);
  const [pendingDeposit, setPendingDeposit] = useState<string | null>(null);
  const [coachInsight, setCoachInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [pulseBalance, setPulseBalance] = useState(false);
  const [activityFeed, setActivityFeed] = useState<DepositEntry[]>([]);

  const lastSpend = useRef<string>("0");
  const lastRoundup = useRef<string>("0");
  const lastEthAmount = useRef<string>("0");

  useEffect(() => {
    if (!address) return;
    const saved = localStorage.getItem(`roundup_history_${address}`);
    if (saved) setActivityFeed(JSON.parse(saved));
  }, [address]);

  const { data: vaultInfo, refetch: refetchVault } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "getVaultInfo",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const principal = vaultInfo ? parseFloat(formatEther(vaultInfo[0])) : 0;
  const yieldEarned = vaultInfo ? parseFloat(formatEther(vaultInfo[1])) : 0;
  const roundupCount = vaultInfo ? Number(vaultInfo[3]) : 0;
  const totalSaved = principal + yieldEarned;

  const { writeContract: deposit, data: depositTxHash } = useWriteContract();
  const { isLoading: isDepositing, isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTxHash });

  const { writeContract: withdraw, data: withdrawTxHash } = useWriteContract();
  const { isLoading: isWithdrawing, isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash });

  async function fetchCoachInsight(count: number, saved: number, latest: number) {
    setIsLoadingInsight(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundupCount: count, totalSaved: saved, latestRoundup: latest }),
      });
      const data = await res.json();
      setCoachInsight(data.insight);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingInsight(false);
    }
  }

  useEffect(() => {
    if (depositSuccess && depositTxHash && pendingDeposit && address) {
      refetchVault();
      const latest = parseFloat(pendingDeposit);
      setLatestRoundup(latest);
      setPulseBalance(true);
      fetchCoachInsight(roundupCount + 1, totalSaved, latest);
      setTimeout(() => setLatestRoundup(null), 3000);
      setTimeout(() => setPulseBalance(false), 1000);

      const newEntry: DepositEntry = {
        spendAmount: lastSpend.current,
        savedAmount: lastRoundup.current,
        timestamp: new Date().toLocaleString(),
        txHash: depositTxHash,
      };

      setActivityFeed((prev) => {
        const updated = [newEntry, ...prev];
        localStorage.setItem(`roundup_history_${address}`, JSON.stringify(updated));
        return updated;
      });

      setPendingDeposit(null);
    }

    if (withdrawSuccess && address) {
      refetchVault();
      localStorage.removeItem(`roundup_history_${address}`);
      setActivityFeed([]);
    }
  }, [depositSuccess, withdrawSuccess]);

  function simulateTransaction() {
    setIsSimulating(true);
    const spend = parseFloat((Math.random() * 20 + 2).toFixed(2));
    const roundup = parseFloat((Math.ceil(spend) - spend).toFixed(2));
    const roundupEth = roundup * 0.0001;

    lastSpend.current = spend.toFixed(2);
    lastRoundup.current = roundup.toFixed(2);
    lastEthAmount.current = roundupEth.toFixed(6);

    setTimeout(() => {
      setIsSimulating(false);
      setPendingDeposit(roundup.toFixed(2));
      deposit({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "deposit",
        value: parseEther(roundupEth.toFixed(6)),
      });
    }, 1200);
  }

  function handleWithdraw() {
    withdraw({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: "withdraw" });
  }

  return (
    <main className="min-h-screen bg-[#080c10] text-white">
      <div
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #1a2a1a 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #00ff88 0%, transparent 70%)" }}
      />

      <div className="relative max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-400 flex items-center justify-center">
              <span className="text-[#080c10] font-black text-xs">R</span>
            </div>
            <span className="font-bold tracking-tight text-lg">roundup</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-emerald-400 border-emerald-400/20 bg-emerald-400/5 text-xs font-normal">
              Flow Testnet
            </Badge>
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-600 hover:text-slate-400">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Wallet gate */}
        {!isConnected && (
          <div className="mt-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">🪙</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Spare change,<br />on autopilot.</h2>
              <p className="text-slate-500 text-sm">Every purchase rounds up. The difference goes into a yield vault. You don't have to think about it.</p>
            </div>
            <div className="flex justify-center">
              <ConnectButton label="Get Started →" />
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Non-custodial</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Gas sponsored</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 4.20% APY</span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="space-y-3">

            {/* Balance card */}
            <div
              className={`relative rounded-2xl overflow-hidden border transition-all duration-500 ${pulseBalance ? "border-emerald-400/60" : "border-white/5"}`}
              style={{ background: "linear-gradient(135deg, #0d1f12 0%, #080c10 60%)" }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-10"
                style={{ background: "radial-gradient(circle, #00ff88 0%, transparent 70%)" }}
              />
              <div className="relative p-6">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Total Saved</p>
                <p className={`text-4xl font-bold tracking-tight transition-all duration-300 ${pulseBalance ? "text-emerald-400" : "text-white"}`}>
                  {totalSaved.toFixed(6)}
                  <span className="text-lg text-slate-400 ml-2 font-normal">FLOW</span>
                </p>

                {yieldEarned > 0.000001 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">+{yieldEarned.toFixed(6)} FLOW yield earned</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Switch checked={roundupEnabled} onCheckedChange={setRoundupEnabled} />
                    <div>
                      <p className="text-xs font-medium">{roundupEnabled ? "Autopilot on" : "Autopilot off"}</p>
                      <p className="text-slate-600 text-xs">roundups {roundupEnabled ? "active" : "paused"}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || totalSaved === 0}
                    size="sm"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs"
                  >
                    {isWithdrawing
                      ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      : <ArrowDownLeft className="w-3 h-3 mr-1" />
                    }
                    {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-slate-600 text-xs uppercase tracking-widest mb-2">APY</p>
                <p className="text-2xl font-bold text-emerald-400">4.20%</p>
                <p className="text-slate-600 text-xs mt-1">Flow Vault</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-slate-600 text-xs uppercase tracking-widest mb-2">Roundups</p>
                <p className="text-2xl font-bold">{roundupCount}</p>
                <p className="text-slate-600 text-xs mt-1">on-chain deposits</p>
              </div>
            </div>

            {/* Simulator */}
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-4">
              <p className="text-slate-600 text-xs mb-3">✦ simulate a purchase</p>
              <button
                onClick={simulateTransaction}
                disabled={isSimulating || isDepositing || !roundupEnabled}
                className="w-full py-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#080c10] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSimulating || isDepositing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : "Make a Purchase"
                }
              </button>
              {latestRoundup !== null && (
                <p className="text-center text-emerald-400 text-xs mt-3">
                  ✓ ${latestRoundup.toFixed(2)} rounded up and saved on-chain
                </p>
              )}
              {isDepositing && (
                <p className="text-center text-slate-600 text-xs mt-2">
                  Confirming on Flow testnet...
                </p>
              )}
            </div>

            {/* AI Coach */}
            {(coachInsight || isLoadingInsight) && (
              <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs uppercase tracking-widest mb-1.5">Roundup Coach</p>
                    {isLoadingInsight
                      ? <p className="text-slate-500 text-sm animate-pulse">Thinking...</p>
                      : <p className="text-slate-300 text-sm leading-relaxed">{coachInsight}</p>
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-slate-500 text-xs uppercase tracking-widest">Activity</p>
              </div>
              {activityFeed.length === 0 ? (
                <p className="text-center text-slate-600 text-sm py-6 px-4">
                  No activity yet — simulate a purchase to get started!
                </p>
              ) : (
                <div className="p-2 space-y-1">
                  {activityFeed.map((tx, i) => (
                    <a
                      key={i}
                      href={`https://evm-testnet.flowscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-sm shrink-0">
                          ✦
                        </div>
                        <div>
                          <p className="text-sm font-medium">Purchase Roundup</p>
                          <p className="text-slate-600 text-xs">{tx.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="text-sm text-slate-400">-${tx.spendAmount}</p>
                          <p className="text-xs text-emerald-400">+${tx.savedAmount} saved</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}