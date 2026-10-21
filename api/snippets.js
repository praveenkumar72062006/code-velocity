// Vercel Serverless Function: Infinite Dynamic Code Snippet Engine
// Generates, fetches, and serves unique code snippets for all 9 programming languages

const PROCEDURAL_TEMPLATES = {
  java: [
    (seed) => ({
      title: `LRU Cache Capacity Optimizer (v${seed})`,
      filename: `CacheEngine_${seed}.java`,
      difficulty: 'Advanced (LeetCode)',
      description: 'Dynamic LRU eviction policy with concurrent hash-map and linked nodes.',
      code: `public class CacheEngine<K, V> {
  private final int capacity = ${Math.floor(100 + (seed % 900))};
  private final Map<K, Node<K, V>> map = new ConcurrentHashMap<>();
  private final DoubleLinkedList<K, V> list = new DoubleLinkedList<>();

  public synchronized V get(K key) {
    Node<K, V> node = map.get(key);
    if (node == null) return null;
    list.moveToHead(node);
    return node.value;
  }

  public synchronized void put(K key, V value) {
    Node<K, V> node = map.get(key);
    if (node != null) {
      node.value = value;
      list.moveToHead(node);
    } else {
      if (map.size() >= capacity) {
        Node<K, V> tail = list.removeTail();
        if (tail != null) map.remove(tail.key);
      }
      Node<K, V> newNode = new Node<>(key, value);
      map.put(key, newNode);
      list.addHead(newNode);
    }
  }
}`
    }),
    (seed) => ({
      title: `Binary Search Tree Range Query #${seed}`,
      filename: `BSTSum_${seed}.java`,
      difficulty: 'Intermediate',
      description: 'Recursive in-order range summation over balanced binary search tree.',
      code: `public int rangeSumBST(TreeNode root, int low, int high) {
  if (root == null) return 0;
  int sum = 0;
  if (root.val >= low && root.val <= high) {
    sum += root.val;
  }
  if (root.val > low) {
    sum += rangeSumBST(root.left, low, high);
  }
  if (root.val < high) {
    sum += rangeSumBST(root.right, low, high);
  }
  return sum;
}`
    }),
    (seed) => ({
      title: `CompletableFuture Telemetry Pipeline #${seed}`,
      filename: `TelemetryTask_${seed}.java`,
      difficulty: 'Intermediate',
      description: 'Async task pipeline fetching and aggregating racer metrics.',
      code: `public CompletableFuture<TelemetryReport> computeMetrics(String racerId) {
  return CompletableFuture.supplyAsync(() -> telemetryClient.fetchRaw(racerId))
    .thenApplyAsync(raw -> raw.calculateWpm(60))
    .thenCombine(asyncStatsService.getAccuracy(racerId), (wpm, acc) -> {
      return new TelemetryReport(racerId, wpm, acc, System.currentTimeMillis());
    })
    .exceptionally(ex -> TelemetryReport.empty(racerId));
}`
    }),
    (seed) => ({
      title: `Sliding Window Max Velocity #${seed}`,
      filename: `WindowMax_${seed}.java`,
      difficulty: 'Advanced (LeetCode)',
      description: 'Monotonic deque maintaining maximum speed values over sliding window.',
      code: `public int[] maxSlidingWindow(int[] speeds, int k) {
  if (speeds == null || speeds.length == 0) return new int[0];
  int n = speeds.length;
  int[] result = new int[n - k + 1];
  Deque<Integer> deque = new ArrayDeque<>();
  for (int i = 0; i < n; i++) {
    while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
      deque.pollFirst();
    }
    while (!deque.isEmpty() && speeds[deque.peekLast()] < speeds[i]) {
      deque.pollLast();
    }
    deque.offerLast(i);
    if (i >= k - 1) {
      result[i - k + 1] = speeds[deque.peekFirst()];
    }
  }
  return result;
}`
    })
  ],

  python: [
    (seed) => ({
      title: `Dijkstra Fast Route Finder #${seed}`,
      filename: `shortest_path_${seed}.py`,
      difficulty: 'Advanced (LeetCode)',
      description: 'Priority queue implementation of Dijkstra single-source shortest path.',
      code: `import heapq

def dijkstra(n: int, edges: list[tuple[int, int, int]], start: int) -> dict[int, int]:
    graph = {i: [] for i in range(n)}
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    dist = {i: float('inf') for i in range(n)}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`
    }),
    (seed) => ({
      title: `Asyncio Task Batch Processor #${seed}`,
      filename: `async_stream_${seed}.py`,
      difficulty: 'Intermediate',
      description: 'Concurrent asynchronous coroutine pool limiting active worker tasks.',
      code: `import asyncio

async def worker(queue: asyncio.Queue, results: list):
    while True:
        job = await queue.get()
        try:
            processed = await process_telemetry_batch(job)
            results.append(processed)
        finally:
            queue.task_done()

async def main_pipeline(jobs: list):
    queue = asyncio.Queue(maxsize=${Math.floor(20 + (seed % 80))})
    results = []
    tasks = [asyncio.create_task(worker(queue, results)) for _ in range(4)]
    for item in jobs:
        await queue.put(item)
    await queue.join()
    for task in tasks:
        task.cancel()
    return results`
    }),
    (seed) => ({
      title: `Memoized Matrix Path Counter #${seed}`,
      filename: `unique_paths_${seed}.py`,
      difficulty: 'Beginner',
      description: 'Dynamic programming matrix counting total unique navigation paths.',
      code: `def unique_paths(m: int, n: int) -> int:
    dp = [1] * n
    for i in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j - 1]
    return dp[-1]

print(f"Matrix paths: {unique_paths(${Math.floor(3 + (seed % 6))}, ${Math.floor(5 + (seed % 5))})}")`
    }),
    (seed) => ({
      title: `Custom Functools Cache Decorator #${seed}`,
      filename: `memoize_${seed}.py`,
      difficulty: 'Intermediate',
      description: 'High-performance memoization wrapper preserving function signatures.',
      code: `from functools import wraps
import time

def timed_lru(maxsize=128):
    def decorator(func):
        cache = {}
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            if key in cache:
                return cache[key]
            result = func(*args, **kwargs)
            if len(cache) >= maxsize:
                cache.pop(next(iter(cache)))
            cache[key] = result
            return result
        return wrapper
    return decorator`
    })
  ],

  javascript: [
    (seed) => ({
      title: `Promise Concurrency Limiter Pool #${seed}`,
      filename: `pLimit_${seed}.js`,
      difficulty: 'Intermediate',
      description: 'Execute async promise functions with strict concurrency constraint.',
      code: `function createPool(concurrency = ${Math.floor(3 + (seed % 5))}) {
  const queue = [];
  let active = 0;

  const next = () => {
    if (active >= concurrency || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        active--;
        next();
      });
  };

  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
}`
    }),
    (seed) => ({
      title: `Deep Clone with WeakMap Cycles #${seed}`,
      filename: `deepClone_${seed}.js`,
      difficulty: 'Advanced (LeetCode)',
      description: 'Zero-loss recursive clone handling circular structures and Symbols.',
      code: `function deepClone(value, map = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (map.has(value)) return map.get(value);

  const clone = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  map.set(value, clone);

  for (const key of Reflect.ownKeys(value)) {
    clone[key] = deepClone(value[key], map);
  }
  return clone;
}`
    }),
    (seed) => ({
      title: `Observable Event Emitter #${seed}`,
      filename: `eventEmitter_${seed}.js`,
      difficulty: 'Beginner',
      description: 'Type-safe event dispatcher with once-listeners and unsubscribe callbacks.',
      code: `class TypedEventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event).add(listener);
    return () => this.off(event, listener);
  }

  emit(event, ...args) {
    const listeners = this.events.get(event);
    if (!listeners) return false;
    listeners.forEach(fn => fn(...args));
    return true;
  }

  off(event, listener) {
    const listeners = this.events.get(event);
    if (listeners) listeners.delete(listener);
  }
}`
    })
  ],

  typescript: [
    (seed) => ({
      title: `Discriminated Union Finite State #${seed}`,
      filename: `stateMachine_${seed}.ts`,
      difficulty: 'Intermediate',
      description: 'Exhaustive TypeScript state transition machine for race engines.',
      code: `export type RaceState =
  | { status: 'IDLE'; timestamp: number }
  | { status: 'COUNTDOWN'; secondsLeft: number }
  | { status: 'RACING'; targetText: string; wpm: number }
  | { status: 'FINISHED'; podium: number; finalWpm: number };

export function transition(state: RaceState, action: string): RaceState {
  switch (state.status) {
    case 'IDLE':
      return { status: 'COUNTDOWN', secondsLeft: 3 };
    case 'COUNTDOWN':
      return state.secondsLeft <= 1 
        ? { status: 'RACING', targetText: 'INIT_CODE', wpm: 0 }
        : { status: 'COUNTDOWN', secondsLeft: state.secondsLeft - 1 };
    case 'RACING':
      return { status: 'FINISHED', podium: 1, finalWpm: state.wpm };
    case 'FINISHED':
      return { status: 'IDLE', timestamp: Date.now() };
  }
}`
    }),
    (seed) => ({
      title: `Generic Type-Safe Key-Value Store #${seed}`,
      filename: `typedStore_${seed}.ts`,
      difficulty: 'Beginner',
      description: 'Mapped type entity registry validating schema signatures.',
      code: `interface Schema {
  racerId: string;
  wpm: number;
  accuracy: number;
  isNitro: boolean;
}

export class TelemetryStore<T extends Schema> {
  private records = new Map<string, T>();

  public save(record: T): void {
    if (record.wpm < 0 || record.accuracy > 100) {
      throw new Error("Invalid telemetry telemetry constraint");
    }
    this.records.set(record.racerId, record);
  }

  public get(id: string): T | undefined {
    return this.records.get(id);
  }
}`
    })
  ],

  cpp: [
    (seed) => ({
      title: `Thread-Safe Bounded Queue #${seed}`,
      filename: `SafeQueue_${seed}.hpp`,
      difficulty: 'Advanced (LeetCode)',
      description: 'C++17 condition-variable guarded multithreaded queue.',
      code: `template <typename T>
class SafeQueue {
private:
    std::queue<T> queue_;
    mutable std::mutex mtx_;
    std::condition_variable cond_;
    const size_t max_size_ = ${Math.floor(20 + (seed % 80))};
public:
    void push(T val) {
        std::unique_lock<std::mutex> lock(mtx_);
        cond_.wait(lock, [this] { return queue_.size() < max_size_; });
        queue_.push(std::move(val));
        cond_.notify_one();
    }
    T pop() {
        std::unique_lock<std::mutex> lock(mtx_);
        cond_.wait(lock, [this] { return !queue_.empty(); });
        T val = std::move(queue_.front());
        queue_.pop();
        cond_.notify_one();
        return val;
    }
};`
    }),
    (seed) => ({
      title: `Segment Tree Point Update Sum #${seed}`,
      filename: `SegmentTree_${seed}.cpp`,
      difficulty: 'Intermediate',
      description: 'Logarithmic point update and range sum evaluation.',
      code: `void update(int v, int tl, int tr, int pos, int new_val) {
    if (tl == tr) {
        tree[v] = new_val;
    } else {
        int tm = (tl + tr) / 2;
        if (pos <= tm) {
            update(v * 2, tl, tm, pos, new_val);
        } else {
            update(v * 2 + 1, tm + 1, tr, pos, new_val);
        }
        tree[v] = tree[v * 2] + tree[v * 2 + 1];
    }
}`
    })
  ],

  rust: [
    (seed) => ({
      title: `MPMC Crossbeam Worker Pool #${seed}`,
      filename: `worker_${seed}.rs`,
      difficulty: 'Intermediate',
      description: 'Bounded lockless message passing worker pool.',
      code: `use crossbeam_channel::{bounded, Receiver, Sender};
use std::thread;

pub struct EnginePool<T: Send + 'static> {
    sender: Sender<T>,
}

impl<T: Send + 'static> EnginePool<T> {
    pub fn new(workers: usize) -> Self {
        let (sender, receiver) = bounded::<T>(${Math.floor(100 + (seed % 400))});
        for _ in 0..workers {
            let rx = receiver.clone();
            thread::spawn(move || {
                while let Ok(task) = rx.recv() {
                    process_task(task);
                }
            });
        }
        Self { sender }
    }
}`
    }),
    (seed) => ({
      title: `Zero-Copy Packet Decoder #${seed}`,
      filename: `decoder_${seed}.rs`,
      difficulty: 'Advanced (LeetCode)',
      description: 'Zero-allocation byte slice parser with lifetime references.',
      code: `pub struct PacketView<'a> {
    pub header: &'a [u8],
    pub payload: &'a [u8],
    pub checksum: u32,
}

impl<'a> PacketView<'a> {
    pub fn parse(raw: &'a [u8]) -> Option<Self> {
        if raw.len() < 8 { return None; }
        let (header, rest) = raw.split_at(4);
        let (payload, csum_bytes) = rest.split_at(rest.len() - 4);
        let checksum = u32::from_be_bytes(csum_bytes.try_into().ok()?);
        Some(Self { header, payload, checksum })
    }
}`
    })
  ],

  go: [
    (seed) => ({
      title: `Context Guarded Worker Pool #${seed}`,
      filename: `pool_${seed}.go`,
      difficulty: 'Intermediate',
      description: 'Concurrent worker pool with graceful context cancellation.',
      code: `func SpawnWorkers(ctx context.Context, workers int, tasks <-chan int) {
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for {
                select {
                case <-ctx.Done():
                    return
                case task, ok := <-tasks:
                    if !ok { return }
                    executeTask(id, task)
                }
            }
        }(i)
    }
    wg.Wait()
}`
    }),
    (seed) => ({
      title: `Concurrent Mutex Map Store #${seed}`,
      filename: `safestore_${seed}.go`,
      difficulty: 'Beginner',
      description: 'Read-write mutex wrapped key value cache.',
      code: `type Cache[K comparable, V any] struct {
    mu    sync.RWMutex
    items map[K]V
}

func (c *Cache[K, V]) Set(key K, val V) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.items[key] = val
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    val, ok := c.items[key]
    return val, ok
}`
    })
  ],

  sql: [
    (seed) => ({
      title: `Sliding Window Moving Average #${seed}`,
      filename: `moving_avg_${seed}.sql`,
      difficulty: 'Intermediate',
      description: '7-day sliding window function with partition by user.',
      code: `SELECT 
    user_id,
    race_date,
    wpm,
    ROUND(AVG(wpm) OVER (
        PARTITION BY user_id 
        ORDER BY race_date 
        ROWS BETWEEN ${Math.floor(3 + (seed % 5))} PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_speed,
    DENSE_RANK() OVER (ORDER BY wpm DESC) AS leaderboard_position
FROM telemetry_logs
WHERE race_date >= CURRENT_DATE - INTERVAL '60 days';`
    }),
    (seed) => ({
      title: `Recursive Hierarchical CTE #${seed}`,
      filename: `hierarchy_${seed}.sql`,
      difficulty: 'Advanced (LeetCode)',
      description: 'Traverse departmental parent-child tree hierarchy.',
      code: `WITH RECURSIVE DepartmentTree AS (
    SELECT dept_id, parent_id, dept_name, 1 AS depth
    FROM departments
    WHERE parent_id IS NULL
    UNION ALL
    SELECT d.dept_id, d.parent_id, d.dept_name, dt.depth + 1
    FROM departments d
    INNER JOIN DepartmentTree dt ON d.parent_id = dt.dept_id
)
SELECT depth, dept_name, COUNT(*) OVER (PARTITION BY depth) as level_count
FROM DepartmentTree
ORDER BY depth, dept_name;`
    })
  ],

  html_css: [
    (seed) => ({
      title: `Translucent Cyberpunk Blur Card #${seed}`,
      filename: `glass_card_${seed}.css`,
      difficulty: 'Beginner',
      description: 'Translucent glowing glassmorphism styling with backdrop-filter.',
      code: `.glass-container {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.${Math.floor(20 + (seed % 30))});
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.glass-container:hover {
  transform: translateY(-4px);
  border-color: rgba(56, 189, 248, 0.6);
}`
    }),
    (seed) => ({
      title: `Cyber Neon Pulse Animation #${seed}`,
      filename: `neon_pulse_${seed}.css`,
      difficulty: 'Intermediate',
      description: 'Keyframe pulse animation with layered text shadows.',
      code: `@keyframes neonGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(6, 182, 212, 0.8), 0 0 50px rgba(59, 130, 246, 0.5);
  }
}
.cyber-active {
  animation: neonGlow 2.5s infinite ease-in-out;
  border-radius: 0.75rem;
}`
    })
  ]
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { language = 'javascript', mode = 'random', count = '5', seed } = req.query;
  const langKey = language.toLowerCase();
  const templates = PROCEDURAL_TEMPLATES[langKey] || PROCEDURAL_TEMPLATES.javascript;
  const numericCount = Math.min(10, Math.max(1, parseInt(count, 10) || 5));

  if (mode === 'batch') {
    // Generate a fresh unique batch of snippets
    const batch = [];
    const baseSeed = parseInt(seed, 10) || Date.now();
    for (let i = 0; i < numericCount; i++) {
      const templateFn = templates[i % templates.length];
      const snippetSeed = Math.floor(Math.random() * 90000) + 10000;
      const data = templateFn(snippetSeed);
      batch.push({
        id: `${langKey}-dyn-${snippetSeed}`,
        language: langKey,
        ...data,
      });
    }
    return res.status(200).json({
      language: langKey,
      count: batch.length,
      snippets: batch,
    });
  }

  // Single dynamic unique snippet
  const templateFn = templates[Math.floor(Math.random() * templates.length)];
  const randomSeed = Math.floor(Math.random() * 90000) + 10000;
  const snippetData = templateFn(randomSeed);

  return res.status(200).json({
    snippet: {
      id: `${langKey}-dyn-${randomSeed}`,
      language: langKey,
      ...snippetData,
    },
  });
}
