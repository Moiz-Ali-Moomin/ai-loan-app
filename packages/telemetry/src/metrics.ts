import { metrics } from '@opentelemetry/api';
import type { Counter, Histogram, ObservableGauge, MetricOptions } from '@opentelemetry/api';

// Module-level caches prevent repeated createCounter/createHistogram/createGauge
// calls for the same name, which avoids duplicate-registration warnings from
// exporters and eliminates unnecessary object allocation on hot paths.
const _counterCache = new Map<string, Counter>();
const _histogramCache = new Map<string, Histogram>();
const _gaugeCache = new Map<string, ObservableGauge>();

export function createCounter(
  meterName: string,
  name: string,
  options?: MetricOptions
): Counter {
  const key = `${meterName}:${name}`;
  let inst = _counterCache.get(key);
  if (!inst) {
    inst = metrics.getMeter(meterName).createCounter(name, options);
    _counterCache.set(key, inst);
  }
  return inst;
}

export function createHistogram(
  meterName: string,
  name: string,
  options?: MetricOptions
): Histogram {
  const key = `${meterName}:${name}`;
  let inst = _histogramCache.get(key);
  if (!inst) {
    inst = metrics.getMeter(meterName).createHistogram(name, options);
    _histogramCache.set(key, inst);
  }
  return inst;
}

export function createGauge(
  meterName: string,
  name: string,
  options?: MetricOptions
): ObservableGauge {
  const key = `${meterName}:${name}`;
  let inst = _gaugeCache.get(key);
  if (!inst) {
    inst = metrics.getMeter(meterName).createObservableGauge(name, options);
    _gaugeCache.set(key, inst);
  }
  return inst;
}

export function recordMetric(
  meterName: string,
  metricName: string,
  value: number,
  attributes?: Record<string, string | number | boolean>
): void {
  createCounter(meterName, metricName).add(value, attributes);
}
