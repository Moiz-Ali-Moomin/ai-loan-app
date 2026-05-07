import { metrics } from '@opentelemetry/api';
import type { Counter, Histogram, ObservableGauge, MetricOptions } from '@opentelemetry/api';

export function createCounter(
  meterName: string,
  name: string,
  options?: MetricOptions
): Counter {
  return metrics.getMeter(meterName).createCounter(name, options);
}

export function createHistogram(
  meterName: string,
  name: string,
  options?: MetricOptions
): Histogram {
  return metrics.getMeter(meterName).createHistogram(name, options);
}

export function createGauge(
  meterName: string,
  name: string,
  options?: MetricOptions
): ObservableGauge {
  return metrics.getMeter(meterName).createObservableGauge(name, options);
}

export function recordMetric(
  meterName: string,
  metricName: string,
  value: number,
  attributes?: Record<string, string | number | boolean>
): void {
  const meter = metrics.getMeter(meterName);
  const counter = meter.createCounter(metricName);
  counter.add(value, attributes);
}
