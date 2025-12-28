/**
 * Performance Testing Utilities
 * Load testing, memory leak detection, and bundle optimization helpers
 */

// Performance metrics collection
export const performanceMetrics = {
  marks: new Map(),
  measures: new Map(),
  
  // Start timing
  mark(name) {
    this.marks.set(name, performance.now());
    if (typeof performance.mark === 'function') {
      performance.mark(`${name}-start`);
    }
  },
  
  // End timing and calculate duration
  measure(name, startMark) {
    const start = this.marks.get(startMark || name);
    if (!start) return null;
    
    const duration = performance.now() - start;
    this.measures.set(name, duration);
    
    if (typeof performance.measure === 'function') {
      try {
        performance.measure(name, `${startMark || name}-start`);
      } catch (e) {
        // Ignore if mark doesn't exist
      }
    }
    
    return duration;
  },
  
  // Get all metrics
  getMetrics() {
    const metrics = {};
    this.measures.forEach((value, key) => {
      metrics[key] = value;
    });
    return metrics;
  },
  
  // Clear all metrics
  clear() {
    this.marks.clear();
    this.measures.clear();
    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks();
    }
    if (typeof performance.clearMeasures === 'function') {
      performance.clearMeasures();
    }
  }
};

// Component render time tracker
export const createRenderTracker = (componentName) => {
  let renderCount = 0;
  let totalRenderTime = 0;
  
  return {
    onRenderStart() {
      performanceMetrics.mark(`${componentName}-render`);
    },
    
    onRenderEnd() {
      const duration = performanceMetrics.measure(
        `${componentName}-render-${renderCount}`,
        `${componentName}-render`
      );
      if (duration) {
        renderCount++;
        totalRenderTime += duration;
      }
    },
    
    getStats() {
      return {
        componentName,
        renderCount,
        totalRenderTime,
        averageRenderTime: renderCount > 0 ? totalRenderTime / renderCount : 0
      };
    },
    
    reset() {
      renderCount = 0;
      totalRenderTime = 0;
    }
  };
};

// Memory usage monitor
export const memoryMonitor = {
  snapshots: [],
  
  // Take memory snapshot
  takeSnapshot(label = 'snapshot') {
    if (performance.memory) {
      const snapshot = {
        label,
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
      this.snapshots.push(snapshot);
      return snapshot;
    }
    return null;
  },
  
  // Compare two snapshots
  compare(label1, label2) {
    const snap1 = this.snapshots.find(s => s.label === label1);
    const snap2 = this.snapshots.find(s => s.label === label2);
    
    if (!snap1 || !snap2) return null;
    
    return {
      heapDiff: snap2.usedJSHeapSize - snap1.usedJSHeapSize,
      timeDiff: snap2.timestamp - snap1.timestamp,
      percentChange: ((snap2.usedJSHeapSize - snap1.usedJSHeapSize) / snap1.usedJSHeapSize) * 100
    };
  },
  
  // Detect potential memory leaks
  detectLeaks(threshold = 10) {
    if (this.snapshots.length < 2) return [];
    
    const leaks = [];
    for (let i = 1; i < this.snapshots.length; i++) {
      const prev = this.snapshots[i - 1];
      const curr = this.snapshots[i];
      const growth = ((curr.usedJSHeapSize - prev.usedJSHeapSize) / prev.usedJSHeapSize) * 100;
      
      if (growth > threshold) {
        leaks.push({
          from: prev.label,
          to: curr.label,
          growth: growth.toFixed(2) + '%',
          heapIncrease: formatBytes(curr.usedJSHeapSize - prev.usedJSHeapSize)
        });
      }
    }
    return leaks;
  },
  
  // Get current memory usage
  getCurrentUsage() {
    if (performance.memory) {
      return {
        used: formatBytes(performance.memory.usedJSHeapSize),
        total: formatBytes(performance.memory.totalJSHeapSize),
        limit: formatBytes(performance.memory.jsHeapSizeLimit),
        usagePercent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
      };
    }
    return null;
  },
  
  // Clear snapshots
  clear() {
    this.snapshots = [];
  }
};

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Load testing utilities
export const loadTester = {
  // Simulate concurrent operations
  async runConcurrent(operation, count = 100) {
    const startTime = performance.now();
    const results = [];
    
    const promises = Array(count).fill(null).map(async (_, index) => {
      const opStart = performance.now();
      try {
        await operation(index);
        return { success: true, duration: performance.now() - opStart };
      } catch (error) {
        return { success: false, duration: performance.now() - opStart, error: error.message };
      }
    });
    
    const outcomes = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    const successful = outcomes.filter(o => o.success);
    const failed = outcomes.filter(o => !o.success);
    const durations = outcomes.map(o => o.duration);
    
    return {
      totalOperations: count,
      successful: successful.length,
      failed: failed.length,
      totalTime: totalTime.toFixed(2) + 'ms',
      averageTime: (durations.reduce((a, b) => a + b, 0) / count).toFixed(2) + 'ms',
      minTime: Math.min(...durations).toFixed(2) + 'ms',
      maxTime: Math.max(...durations).toFixed(2) + 'ms',
      operationsPerSecond: (count / (totalTime / 1000)).toFixed(2)
    };
  },
  
  // Simulate sequential operations with delay
  async runSequential(operation, count = 100, delay = 0) {
    const startTime = performance.now();
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const opStart = performance.now();
      try {
        await operation(i);
        results.push({ success: true, duration: performance.now() - opStart });
      } catch (error) {
        results.push({ success: false, duration: performance.now() - opStart, error: error.message });
      }
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const totalTime = performance.now() - startTime;
    const successful = results.filter(r => r.success);
    const durations = results.map(r => r.duration);
    
    return {
      totalOperations: count,
      successful: successful.length,
      failed: results.length - successful.length,
      totalTime: totalTime.toFixed(2) + 'ms',
      averageTime: (durations.reduce((a, b) => a + b, 0) / count).toFixed(2) + 'ms'
    };
  },
  
  // Stress test with increasing load
  async stressTest(operation, { startCount = 10, maxCount = 1000, step = 10, threshold = 1000 }) {
    const results = [];
    let currentCount = startCount;
    
    while (currentCount <= maxCount) {
      const result = await this.runConcurrent(operation, currentCount);
      results.push({ count: currentCount, ...result });
      
      // Stop if average time exceeds threshold
      if (parseFloat(result.averageTime) > threshold) {
        break;
      }
      
      currentCount += step;
    }
    
    return {
      results,
      maxSustainableLoad: results[results.length - 1]?.count || 0,
      recommendation: results.length > 0 
        ? `System can handle approximately ${results[results.length - 1].count} concurrent operations`
        : 'Unable to determine sustainable load'
    };
  }
};

// Bundle size analyzer helper
export const bundleAnalyzer = {
  // Estimate component size (rough approximation)
  estimateComponentSize(component) {
    const str = component.toString();
    return {
      characters: str.length,
      estimatedKB: (str.length / 1024).toFixed(2) + ' KB'
    };
  },
  
  // Check for large dependencies
  checkLargeDependencies(imports) {
    const largeDeps = [];
    const thresholdKB = 50;
    
    // This is a placeholder - actual implementation would need build tools
    imports.forEach(imp => {
      if (imp.size > thresholdKB * 1024) {
        largeDeps.push({
          name: imp.name,
          size: formatBytes(imp.size),
          suggestion: `Consider lazy loading or finding a smaller alternative for ${imp.name}`
        });
      }
    });
    
    return largeDeps;
  }
};

// FPS monitor for animations
export const fpsMonitor = {
  frames: [],
  isRunning: false,
  frameId: null,
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.frames = [];
    
    let lastTime = performance.now();
    
    const measure = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      const fps = 1000 / delta;
      
      this.frames.push(fps);
      if (this.frames.length > 100) {
        this.frames.shift();
      }
      
      lastTime = currentTime;
      
      if (this.isRunning) {
        this.frameId = requestAnimationFrame(measure);
      }
    };
    
    this.frameId = requestAnimationFrame(measure);
  },
  
  stop() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  },
  
  getStats() {
    if (this.frames.length === 0) return null;
    
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);
    
    return {
      averageFPS: avg.toFixed(2),
      minFPS: min.toFixed(2),
      maxFPS: max.toFixed(2),
      samples: this.frames.length,
      isSmooth: avg >= 55 // 55+ FPS is considered smooth
    };
  }
};

// Network performance tracker
export const networkTracker = {
  requests: [],
  
  // Track API request
  trackRequest(url, method, startTime, endTime, status, size) {
    this.requests.push({
      url,
      method,
      duration: endTime - startTime,
      status,
      size,
      timestamp: Date.now()
    });
  },
  
  // Get slow requests
  getSlowRequests(threshold = 1000) {
    return this.requests.filter(r => r.duration > threshold);
  },
  
  // Get request statistics
  getStats() {
    if (this.requests.length === 0) return null;
    
    const durations = this.requests.map(r => r.duration);
    const totalSize = this.requests.reduce((sum, r) => sum + (r.size || 0), 0);
    
    return {
      totalRequests: this.requests.length,
      averageDuration: (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) + 'ms',
      slowestRequest: Math.max(...durations).toFixed(2) + 'ms',
      fastestRequest: Math.min(...durations).toFixed(2) + 'ms',
      totalDataTransferred: formatBytes(totalSize),
      failedRequests: this.requests.filter(r => r.status >= 400).length
    };
  },
  
  clear() {
    this.requests = [];
  }
};

// Export all utilities
export default {
  performanceMetrics,
  createRenderTracker,
  memoryMonitor,
  loadTester,
  bundleAnalyzer,
  fpsMonitor,
  networkTracker
};
