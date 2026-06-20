export type NullSeries = (number | null)[];

export function sma(close: number[], n: number): NullSeries {
  return close.map((_, i) => {
    if (i < n - 1) return null;
    let sum = 0;
    for (let j = i - n + 1; j <= i; j++) sum += close[j];
    return parseFloat((sum / n).toFixed(4));
  });
}

export function ema(close: number[], n: number): NullSeries {
  const k      = 2 / (n + 1);
  const result: NullSeries = new Array(close.length).fill(null);
  if (close.length < n) return result;
  let seed = 0;
  for (let i = 0; i < n; i++) seed += close[i];
  result[n - 1] = parseFloat((seed / n).toFixed(4));
  for (let i = n; i < close.length; i++) {
    result[i] = parseFloat((close[i] * k + (result[i - 1] as number) * (1 - k)).toFixed(4));
  }
  return result;
}

export function rsi(close: number[], n = 14): NullSeries {
  const result: NullSeries = new Array(close.length).fill(null);
  if (close.length < n + 1) return result;

  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= n; i++) {
    const diff = close[i] - close[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss += -diff;
  }
  avgGain /= n; avgLoss /= n;
  result[n] = parseFloat((100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss))).toFixed(2));

  for (let i = n + 1; i < close.length; i++) {
    const diff = close[i] - close[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (n - 1) + gain) / n;
    avgLoss = (avgLoss * (n - 1) + loss) / n;
    result[i] = parseFloat((100 - 100 / (1 + (avgLoss === 0 ? 100 : avgGain / avgLoss))).toFixed(2));
  }
  return result;
}

export function macd(
  close: number[],
  fast = 12, slow = 26, signal = 9,
): { line: NullSeries; signal: NullSeries; hist: NullSeries } {
  const emaFast = ema(close, fast);
  const emaSlow = ema(close, slow);
  const line:    NullSeries = close.map((_, i) =>
    emaFast[i] !== null && emaSlow[i] !== null
      ? parseFloat(((emaFast[i] as number) - (emaSlow[i] as number)).toFixed(4))
      : null,
  );

  // Signal = EMA(signal) of MACD line (non-null values only)
  const sig: NullSeries = new Array(close.length).fill(null);
  const firstIdx = line.findIndex((v) => v !== null);
  if (firstIdx < 0) return { line, signal: sig, hist: new Array(close.length).fill(null) };

  const nonNullLine = line.slice(firstIdx).filter((v): v is number => v !== null);
  if (nonNullLine.length < signal) return { line, signal: sig, hist: new Array(close.length).fill(null) };

  const sigVals = ema(nonNullLine, signal);
  let sigIdx = 0;
  for (let i = firstIdx; i < close.length; i++) {
    if (line[i] !== null) {
      sig[i] = sigVals[sigIdx] ?? null;
      sigIdx++;
    }
  }

  const hist: NullSeries = close.map((_, i) =>
    line[i] !== null && sig[i] !== null
      ? parseFloat(((line[i] as number) - (sig[i] as number)).toFixed(4))
      : null,
  );
  return { line, signal: sig, hist };
}

export function bollingerBands(
  close: number[], n = 20, mult = 2,
): { upper: NullSeries; mid: NullSeries; lower: NullSeries } {
  const mid   = sma(close, n);
  const upper: NullSeries = new Array(close.length).fill(null);
  const lower: NullSeries = new Array(close.length).fill(null);
  for (let i = n - 1; i < close.length; i++) {
    const slice = close.slice(i - n + 1, i + 1);
    const mean  = mid[i] as number;
    const variance = slice.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
    const sd = Math.sqrt(variance);
    upper[i] = parseFloat((mean + mult * sd).toFixed(4));
    lower[i] = parseFloat((mean - mult * sd).toFixed(4));
  }
  return { upper, mid, lower };
}
