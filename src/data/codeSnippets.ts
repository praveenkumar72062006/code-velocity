export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'cpp' 
  | 'java' 
  | 'rust' 
  | 'go' 
  | 'sql' 
  | 'html_css';

export interface CodeSnippet {
  id: string;
  language: SupportedLanguage;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced (LeetCode)';
  filename: string;
  description: string;
  code: string;
}

export const LANGUAGE_META: Record<SupportedLanguage, { name: string; icon: string; color: string; ext: string }> = {
  javascript: { name: 'JavaScript', icon: '⚡', color: '#f7df1e', ext: '.js' },
  typescript: { name: 'TypeScript', icon: '🔷', color: '#3178c6', ext: '.ts' },
  python: { name: 'Python', icon: '🐍', color: '#3776ab', ext: '.py' },
  cpp: { name: 'C++', icon: '⚙️', color: '#00599c', ext: '.cpp' },
  java: { name: 'Java', icon: '☕', color: '#f89820', ext: '.java' },
  rust: { name: 'Rust', icon: '🦀', color: '#dea584', ext: '.rs' },
  go: { name: 'Go', icon: '🐹', color: '#00add8', ext: '.go' },
  sql: { name: 'SQL', icon: '🗄️', color: '#e38c00', ext: '.sql' },
  html_css: { name: 'HTML & CSS', icon: '🎨', color: '#e34f26', ext: '.html' },
};

export const CODE_SNIPPETS: CodeSnippet[] = [
  // ==================== JAVA ====================
  {
    id: 'java-1',
    language: 'java',
    title: 'Thread-Safe Singleton (Double Check)',
    difficulty: 'Intermediate',
    filename: 'GameEngine.java',
    description: 'Idiomatic thread-safe singleton pattern with double-checked locking.',
    code: `public static GameEngine getInstance() {
  if (instance == null) {
    synchronized (GameEngine.class) {
      if (instance == null) {
        instance = new GameEngine();
      }
    }
  }
  return instance;
}`,
  },
  {
    id: 'java-2',
    language: 'java',
    title: 'Spring REST Controller Endpoint',
    difficulty: 'Beginner',
    filename: 'RacerController.java',
    description: 'Spring Boot REST API endpoint returning typed telemetry data.',
    code: `@GetMapping("/api/racers/{id}")
public ResponseEntity<RacerDTO> getRacer(@PathVariable String id) {
  Racer racer = racerService.findById(id);
  if (racer == null) {
    return ResponseEntity.notFound().build();
  }
  return ResponseEntity.ok(new RacerDTO(racer));
}`,
  },
  {
    id: 'java-3',
    language: 'java',
    title: 'Streams Filter, Map & Collect',
    difficulty: 'Intermediate',
    filename: 'LeaderboardService.java',
    description: 'Modern Java 17 Streams pipeline filtering top typists by WPM.',
    code: `public List<String> getTopDriverNames(List<Driver> drivers) {
  return drivers.stream()
    .filter(d -> d.getWpm() >= 100)
    .filter(d -> d.getAccuracy() >= 0.98)
    .sorted(Comparator.comparingInt(Driver::getWpm).reversed())
    .map(Driver::getUsername)
    .collect(Collectors.toList());
}`,
  },
  {
    id: 'java-4',
    language: 'java',
    title: 'CompletableFuture Async Pipeline',
    difficulty: 'Advanced (LeetCode)',
    filename: 'AsyncPipeline.java',
    description: 'Asynchronous non-blocking task pipeline with error handling.',
    code: `public CompletableFuture<UserProfile> fetchUserProfile(String userId) {
  return CompletableFuture.supplyAsync(() -> userService.loadUser(userId))
    .thenCompose(user -> telemetryService.loadStats(user.getId())
      .thenApply(stats -> new UserProfile(user, stats)))
    .exceptionally(ex -> new UserProfile(UserProfile.ANONYMOUS));
}`,
  },
  {
    id: 'java-5',
    language: 'java',
    title: 'LRU Cache with LinkedHashMap',
    difficulty: 'Intermediate',
    filename: 'LRUCache.java',
    description: 'Generic fixed-size LRU Cache extending LinkedHashMap.',
    code: `public class LRUCache<K, V> extends LinkedHashMap<K, V> {
  private final int maxCapacity;

  public LRUCache(int maxCapacity) {
    super(maxCapacity, 0.75f, true);
    this.maxCapacity = maxCapacity;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() > maxCapacity;
  }
}`,
  },
  {
    id: 'java-6',
    language: 'java',
    title: 'Binary Search Tree In-Order Traversal',
    difficulty: 'Beginner',
    filename: 'BSTTraversal.java',
    description: 'Recursive in-order traversal of a binary search tree.',
    code: `public void inOrder(TreeNode root, List<Integer> result) {
  if (root == null) {
    return;
  }
  inOrder(root.left, result);
  result.add(root.val);
  inOrder(root.right, result);
}`,
  },
  {
    id: 'java-7',
    language: 'java',
    title: 'Java 17 Record Pattern Match',
    difficulty: 'Intermediate',
    filename: 'TelemetryRecord.java',
    description: 'Modern Java record definition with compact constructor validation.',
    code: `public record TelemetryPacket(String racerId, int wpm, double accuracy) {
  public TelemetryPacket {
    if (wpm < 0 || accuracy < 0.0 || accuracy > 100.0) {
      throw new IllegalArgumentException("Invalid telemetry reading");
    }
  }
}`,
  },

  // ==================== PYTHON ====================
  {
    id: 'python-1',
    language: 'python',
    title: 'FastAPI Telemetry Route with Pydantic',
    difficulty: 'Beginner',
    filename: 'routes.py',
    description: 'Async FastAPI route with pydantic payload and status codes.',
    code: `@app.post("/api/telemetry", response_model=TelemetryResponse)
async def record_telemetry(payload: TelemetrySchema, db: Session = Depends(get_db)):
    if payload.wpm > 250:
        raise HTTPException(status_code=400, detail="Velocity anomaly detected")
    record = await db.save_telemetry(payload)
    return TelemetryResponse(status="recorded", id=record.id)`,
  },
  {
    id: 'python-2',
    language: 'python',
    title: 'LRU Cache & Memoization Decorator',
    difficulty: 'Intermediate',
    filename: 'cache.py',
    description: 'High-speed memoization decorator using function closures.',
    code: `def memoize(fn):
    cache = {}
    @wraps(fn)
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    return wrapper`,
  },
  {
    id: 'python-3',
    language: 'python',
    title: 'Binary Search with Type Hints',
    difficulty: 'Beginner',
    filename: 'binary_search.py',
    description: 'Classic O(log n) binary search algorithm.',
    code: `def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  },
  {
    id: 'python-4',
    language: 'python',
    title: 'Asyncio Concurrent Task Gathering',
    difficulty: 'Intermediate',
    filename: 'async_worker.py',
    description: 'Running batch asynchronous coroutines with asyncio.gather.',
    code: `async def fetch_all_racers(racer_ids: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_racer(session, rid) for rid in racer_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in results if not isinstance(r, Exception)]`,
  },
  {
    id: 'python-5',
    language: 'python',
    title: 'Custom Context Manager with Yield',
    difficulty: 'Intermediate',
    filename: 'timer.py',
    description: 'Context manager measuring precise execution time using time.perf_counter.',
    code: `@contextmanager
def execution_timer(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"[{label}] Execution finished in {elapsed:.4f}s")`,
  },
  {
    id: 'python-6',
    language: 'python',
    title: 'Dijkstra Shortest Path with Heap',
    difficulty: 'Advanced (LeetCode)',
    filename: 'dijkstra.py',
    description: 'Priority queue implementation of shortest path in weighted graph.',
    code: `def dijkstra(graph: dict, start: str) -> dict:
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    while pq:
        curr_dist, curr_node = heapq.heappop(pq)
        if curr_dist > distances[curr_node]:
            continue
        for neighbor, weight in graph[curr_node].items():
            dist = curr_dist + weight
            if dist < distances[neighbor]:
                distances[neighbor] = dist
                heapq.heappush(pq, (dist, neighbor))
    return distances`,
  },
  {
    id: 'python-7',
    language: 'python',
    title: 'QuickSort Partition Algorithm',
    difficulty: 'Intermediate',
    filename: 'quicksort.py',
    description: 'In-place divide-and-conquer quicksort with Hoare partition.',
    code: `def quicksort(arr: list[int], low: int, high: int):
    if low < high:
        pivot_idx = partition(arr, low, high)
        quicksort(arr, low, pivot_idx - 1)
        quicksort(arr, pivot_idx + 1, high)

def partition(arr: list[int], low: int, high: int) -> int:
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
  },

  // ==================== JAVASCRIPT ====================
  {
    id: 'js-1',
    language: 'javascript',
    title: 'Debounce Function with Cancel & Immediate',
    difficulty: 'Intermediate',
    filename: 'debounce.js',
    description: 'Essential utility for high-frequency input handlers and resize events.',
    code: `function debounce(fn, delay, immediate = false) {
  let timer = null;
  return function (...args) {
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delay);
    if (callNow) fn.apply(this, args);
  };
}`,
  },
  {
    id: 'js-2',
    language: 'javascript',
    title: 'Deep Object Clone with Circular Reference',
    difficulty: 'Advanced (LeetCode)',
    filename: 'deepClone.js',
    description: 'Recursive object cloner supporting Maps, Sets, and cyclic graphs.',
    code: `function deepClone(obj, hash = new WeakMap()) {
  if (Object(obj) !== obj) return obj;
  if (hash.has(obj)) return hash.get(obj);
  const result = Array.isArray(obj) ? [] : {};
  hash.set(obj, result);
  for (const key of Object.keys(obj)) {
    result[key] = deepClone(obj[key], hash);
  }
  return result;
}`,
  },
  {
    id: 'js-3',
    language: 'javascript',
    title: 'Promise Concurrency Pool Limiter',
    difficulty: 'Advanced (LeetCode)',
    filename: 'promisePool.js',
    description: 'Limit parallel network requests to prevent server exhaustion.',
    code: `async function promisePool(tasks, limit) {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}`,
  },
  {
    id: 'js-4',
    language: 'javascript',
    title: 'Event Emitter (Pub/Sub Pattern)',
    difficulty: 'Intermediate',
    filename: 'eventEmitter.js',
    description: 'Zero-dependency Event Emitter pattern with on, off, and emit.',
    code: `class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(listener);
    return () => this.off(event, listener);
  }

  emit(event, ...args) {
    const listeners = this.events.get(event) || [];
    listeners.forEach(fn => fn(...args));
  }
}`,
  },
  {
    id: 'js-5',
    language: 'javascript',
    title: 'Array Flatten Polyfill (Recursive)',
    difficulty: 'Beginner',
    filename: 'flat.js',
    description: 'Deep flattening multidimensional arrays recursively.',
    code: `function flattenArray(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flattenArray(val, depth - 1) : val), [])
    : arr.slice();
}`,
  },
  {
    id: 'js-6',
    language: 'javascript',
    title: 'Currying Function with Arity Check',
    difficulty: 'Intermediate',
    filename: 'curry.js',
    description: 'Functional programming curry helper for partial application.',
    code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}`,
  },

  // ==================== TYPESCRIPT ====================
  {
    id: 'ts-1',
    language: 'typescript',
    title: 'Custom React Typing Hook with Stats',
    difficulty: 'Intermediate',
    filename: 'useTypingEngine.ts',
    description: 'React hook managing keystrokes, accuracy, and live WPM.',
    code: `export const useTyping = (snippet: string) => {
  const [index, setIndex] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);

  const handleKey = useCallback((char: string) => {
    if (char === snippet[index]) {
      setIndex(prev => prev + 1);
    } else {
      setErrors(prev => prev + 1);
    }
  }, [index, snippet]);

  return { index, errors, handleKey, isDone: index >= snippet.length };
};`,
  },
  {
    id: 'ts-2',
    language: 'typescript',
    title: 'Discriminated State Union Machine',
    difficulty: 'Intermediate',
    filename: 'raceState.ts',
    description: 'Type-safe state transitions using discriminated unions.',
    code: `type RaceState = 
  | { status: 'idle' }
  | { status: 'countdown'; seconds: number }
  | { status: 'active'; startTime: number; wpm: number }
  | { status: 'completed'; finalWpm: number; rank: number };

function formatRaceBanner(state: RaceState): string {
  switch (state.status) {
    case 'countdown': return \`Starting in \${state.seconds}s\`;
    case 'active': return \`Racing at \${state.wpm} WPM\`;
    case 'completed': return \`Finished! Rank #\${state.rank}\`;
    default: return 'Waiting for racer...';
  }
}`,
  },
  {
    id: 'ts-3',
    language: 'typescript',
    title: 'DeepReadonly Recursive Utility Type',
    difficulty: 'Advanced (LeetCode)',
    filename: 'deepReadonly.ts',
    description: 'Recursive TypeScript mapped type guaranteeing total immutability.',
    code: `type DeepReadonly<T> = T extends Function | boolean | number | string | null | undefined
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : { readonly [P in keyof T]: DeepReadonly<T[P]> };`,
  },
  {
    id: 'ts-4',
    language: 'typescript',
    title: 'Generic Result Type with Pattern Matching',
    difficulty: 'Intermediate',
    filename: 'result.ts',
    description: 'Rust-style Result<T, E> error handling in TypeScript.',
    code: `export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export function matchResult<T, E, R>(
  res: Result<T, E>,
  onOk: (val: T) => R,
  onError: (err: E) => R
): R {
  return res.ok ? onOk(res.value) : onError(res.error);
}`,
  },
  {
    id: 'ts-5',
    language: 'typescript',
    title: 'Type Guard Assertion Function',
    difficulty: 'Beginner',
    filename: 'typeGuards.ts',
    description: 'Narrowing unknown objects to strongly typed Developer models.',
    code: `interface Developer {
  id: string;
  wpm: number;
  languages: string[];
}

function isDeveloper(obj: unknown): obj is Developer {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'wpm' in obj &&
    Array.isArray((obj as any).languages)
  );
}`,
  },

  // ==================== C++ ====================
  {
    id: 'cpp-1',
    language: 'cpp',
    title: 'Thread-Safe Producer Consumer Queue',
    difficulty: 'Advanced (LeetCode)',
    filename: 'SafeQueue.hpp',
    description: 'Multithreaded queue with condition variables and mutex locks.',
    code: `template <typename T>
class SafeQueue {
private:
  std::queue<T> queue_;
  mutable std::mutex mutex_;
  std::condition_variable cond_;
public:
  void push(T val) {
    std::lock_guard<std::mutex> lock(mutex_);
    queue_.push(std::move(val));
    cond_.notify_one();
  }
  T pop() {
    std::unique_lock<std::mutex> lock(mutex_);
    cond_.wait(lock, [this] { return !queue_.empty(); });
    T val = std::move(queue_.front());
    queue_.pop();
    return val;
  }
};`,
  },
  {
    id: 'cpp-2',
    language: 'cpp',
    title: 'Smart Pointer Custom Deleter',
    difficulty: 'Intermediate',
    filename: 'SocketManager.cpp',
    description: 'std::unique_ptr managing raw C OS socket handles safely.',
    code: `struct SocketCloser {
  void operator()(int* fd) const {
    if (fd && *fd >= 0) {
      close(*fd);
      delete fd;
    }
  }
};

using ScopedSocket = std::unique_ptr<int, SocketCloser>;

ScopedSocket openConnection(const char* host, int port) {
  int sock = socket(AF_INET, SOCK_STREAM, 0);
  return ScopedSocket(new int(sock));
}`,
  },
  {
    id: 'cpp-3',
    language: 'cpp',
    title: 'Variadic Template Print Helper',
    difficulty: 'Beginner',
    filename: 'logger.hpp',
    description: 'C++17 fold expression printing variable arguments.',
    code: `template <typename... Args>
void logTelemetry(const std::string& prefix, Args&&... args) {
  std::cout << "[" << prefix << "] ";
  ((std::cout << args << " "), ...);
  std::cout << "\\n";
}`,
  },
  {
    id: 'cpp-4',
    language: 'cpp',
    title: 'Fast Matrix Multiply (Cache Friendly)',
    difficulty: 'Advanced (LeetCode)',
    filename: 'matrix_mult.cpp',
    description: 'Cache-oblivious matrix multiplication algorithm.',
    code: `void matMul(const std::vector<std::vector<int>>& A, 
            const std::vector<std::vector<int>>& B, 
            std::vector<std::vector<int>>& C, int N) {
  for (int i = 0; i < N; ++i) {
    for (int k = 0; k < N; ++k) {
      for (int j = 0; j < N; ++j) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }
}`,
  },
  {
    id: 'cpp-5',
    language: 'cpp',
    title: 'Custom RAII Smart Pointer (UniquePtr)',
    difficulty: 'Intermediate',
    filename: 'UniquePtr.hpp',
    description: 'Minimal zero-overhead move-only unique ownership pointer.',
    code: `template <typename T>
class UniquePtr {
private:
  T* ptr = nullptr;
public:
  explicit UniquePtr(T* p = nullptr) : ptr(p) {}
  ~UniquePtr() { delete ptr; }
  UniquePtr(const UniquePtr&) = delete;
  UniquePtr& operator=(const UniquePtr&) = delete;
  UniquePtr(UniquePtr&& o) noexcept : ptr(o.ptr) { o.ptr = nullptr; }
  T* get() const noexcept { return ptr; }
  T& operator*() const { return *ptr; }
};`,
  },
  {
    id: 'cpp-6',
    language: 'cpp',
    title: 'Segment Tree Range Sum Query',
    difficulty: 'Advanced (LeetCode)',
    filename: 'SegmentTree.cpp',
    description: 'Logarithmic range sum query and point update tree.',
    code: `void build(const std::vector<int>& a, int v, int tl, int tr) {
  if (tl == tr) {
    tree[v] = a[tl];
  } else {
    int tm = (tl + tr) / 2;
    build(a, v * 2, tl, tm);
    build(a, v * 2 + 1, tm + 1, tr);
    tree[v] = tree[v * 2] + tree[v * 2 + 1];
  }
}`,
  },

  // ==================== RUST ====================
  {
    id: 'rust-1',
    language: 'rust',
    title: 'Crossbeam Concurrent Worker Channels',
    difficulty: 'Intermediate',
    filename: 'worker_pool.rs',
    description: 'Fearless concurrency in Rust with bounded MPMC channels.',
    code: `use crossbeam_channel::{bounded, Sender, Receiver};
use std::thread;

pub fn spawn_workers<T: Send + 'static>(count: usize) -> (Sender<T>, Receiver<T>) {
    let (tx, rx) = bounded(1024);
    for _ in 0..count {
        let thread_rx = rx.clone();
        thread::spawn(move || {
            while let Ok(job) = thread_rx.recv() {
                process_job(job);
            }
        });
    }
    (tx, rx)
}`,
  },
  {
    id: 'rust-2',
    language: 'rust',
    title: 'Custom Fibonacci Iterator Trait',
    difficulty: 'Beginner',
    filename: 'fib_iter.rs',
    description: 'Implementing the standard Iterator trait for lazy streams.',
    code: `struct Fibonacci {
    curr: u64,
    next: u64,
}

impl Iterator for Fibonacci {
    type Item = u64;
    fn next(&mut self) -> Option<Self::Item> {
        let new_next = self.curr + self.next;
        self.curr = self.next;
        self.next = new_next;
        Some(self.curr)
    }
}`,
  },
  {
    id: 'rust-3',
    language: 'rust',
    title: 'Axum Async Web Route Handler',
    difficulty: 'Intermediate',
    filename: 'api.rs',
    description: 'High-performance async HTTP endpoint in Axum framework.',
    code: `async fn get_telemetry(
    Path(user_id): Path<String>,
    State(db): State<Arc<Database>>,
) -> Result<Json<TelemetryResponse>, StatusCode> {
    match db.find_user(&user_id).await {
        Ok(user) => Ok(Json(TelemetryResponse::from(user))),
        Err(_) => Err(StatusCode::NOT_FOUND),
    }
}`,
  },
  {
    id: 'rust-4',
    language: 'rust',
    title: 'Arc and Mutex Thread Safe State',
    difficulty: 'Intermediate',
    filename: 'shared_state.rs',
    description: 'Shared mutable state across threads with Arc and Mutex.',
    code: `pub struct SharedRoster {
    members: Arc<Mutex<Vec<String>>>,
}

impl SharedRoster {
    pub fn add_member(&self, name: String) {
        let mut lock = self.members.lock().unwrap();
        lock.push(name);
    }
}`,
  },
  {
    id: 'rust-5',
    language: 'rust',
    title: 'Zero-Copy Slice Pattern Matching',
    difficulty: 'Advanced (LeetCode)',
    filename: 'zero_copy.rs',
    description: 'Idiomatic zero-allocation slice parsing using Rust pattern matching.',
    code: `pub fn parse_packet<'a>(bytes: &'a [u8]) -> Option<(&'a str, u32)> {
    match bytes {
        [b'V', b'E', b'L', rest @ ..] if rest.len() >= 4 => {
            let id = std::str::from_utf8(&rest[..rest.len() - 4]).ok()?;
            let val = u32::from_be_bytes(rest[rest.len() - 4..].try_into().ok()?);
            Some((id, val))
        }
        _ => None,
    }
}`,
  },
  {
    id: 'rust-6',
    language: 'rust',
    title: 'Custom Error Type with thiserror',
    difficulty: 'Beginner',
    filename: 'errors.rs',
    description: 'Strongly-typed domain error enumeration with derive macros.',
    code: `#[derive(Debug, PartialEq)]
pub enum RaceEngineError {
    RoomFull(usize),
    InvalidTelemetry(String),
    ConnectionClosed,
}

impl std::fmt::Display for RaceEngineError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}`,
  },

  // ==================== GO ====================
  {
    id: 'go-1',
    language: 'go',
    title: 'Worker Pool with Context Cancellation',
    difficulty: 'Intermediate',
    filename: 'worker_pool.go',
    description: 'Idiomatic Go concurrency with sync.WaitGroup and context.',
    code: `func StartWorkerPool(ctx context.Context, workers int, jobs <-chan int) {
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for {
                select {
                case <-ctx.Done():
                    return
                case job, ok := <-jobs:
                    if !ok { return }
                    processJob(id, job)
                }
            }
        }(i)
    }
    wg.Wait()
}`,
  },
  {
    id: 'go-2',
    language: 'go',
    title: 'HTTP Middleware Logger with Context',
    difficulty: 'Beginner',
    filename: 'middleware.go',
    description: 'Standard Go net/http middleware logging request durations.',
    code: `func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("[%s] %s completed in %v", r.Method, r.URL.Path, time.Since(start))
    })
}`,
  },
  {
    id: 'go-3',
    language: 'go',
    title: 'Mutex Guarded Thread-Safe Map',
    difficulty: 'Intermediate',
    filename: 'safemap.go',
    description: 'Generic sync.RWMutex wrapper for read-heavy workloads.',
    code: `type SafeStore[K comparable, V any] struct {
    mu   sync.RWMutex
    data map[K]V
}

func (s *SafeStore[K, V]) Get(key K) (V, bool) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    val, exists := s.data[key]
    return val, exists
}`,
  },
  {
    id: 'go-4',
    language: 'go',
    title: 'Fan-In Channel Multiplexer',
    difficulty: 'Advanced (LeetCode)',
    filename: 'fanin.go',
    description: 'Multiplexing multiple input channels into single output stream.',
    code: `func FanIn[T any](ch1, ch2 <-chan T) <-chan T {
    out := make(chan T)
    go func() {
        defer close(out)
        for ch1 != nil || ch2 != nil {
            select {
            case v, ok := <-ch1:
                if !ok { ch1 = nil; continue }
                out <- v
            case v, ok := <-ch2:
                if !ok { ch2 = nil; continue }
                out <- v
            }
        }
    }()
    return out
}`,
  },
  {
    id: 'go-5',
    language: 'go',
    title: 'Context Timeout HTTP Client Request',
    difficulty: 'Intermediate',
    filename: 'client.go',
    description: 'Resilient external API fetch with 3-second context cancellation.',
    code: `func FetchStats(ctx context.Context, url string) ([]byte, error) {
    reqCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, url, nil)
    if err != nil {
        return nil, err
    }
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}`,
  },
  {
    id: 'go-6',
    language: 'go',
    title: 'Atomic Compare And Swap Spinlock',
    difficulty: 'Beginner',
    filename: 'atomic_flag.go',
    description: 'Lock-free concurrency using atomic memory operations.',
    code: `type SpinLock struct {
    state uint32
}

func (s *SpinLock) Lock() {
    for !atomic.CompareAndSwapUint32(&s.state, 0, 1) {
        runtime.Gosched()
    }
}

func (s *SpinLock) Unlock() {
    atomic.StoreUint32(&s.state, 0)
}`,
  },

  // ==================== SQL ====================
  {
    id: 'sql-1',
    language: 'sql',
    title: 'Window Function Rolling 7-Day Average',
    difficulty: 'Intermediate',
    filename: 'rolling_wpm.sql',
    description: 'Analytical window functions with sliding time-frame partitions.',
    code: `SELECT 
    user_id,
    race_date,
    wpm,
    AVG(wpm) OVER (
        PARTITION BY user_id 
        ORDER BY race_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_avg_wpm,
    DENSE_RANK() OVER (ORDER BY wpm DESC) AS daily_rank
FROM races
WHERE race_date >= CURRENT_DATE - INTERVAL '30 days';`,
  },
  {
    id: 'sql-2',
    language: 'sql',
    title: 'Recursive CTE Organizational Hierarchy',
    difficulty: 'Advanced (LeetCode)',
    filename: 'org_tree.sql',
    description: 'Recursive Common Table Expression traversing adjacency lists.',
    code: `WITH RECURSIVE TeamHierarchy AS (
    SELECT employee_id, manager_id, full_name, 1 AS depth
    FROM employees
    WHERE manager_id IS NULL
    UNION ALL
    SELECT e.employee_id, e.manager_id, e.full_name, th.depth + 1
    FROM employees e
    INNER JOIN TeamHierarchy th ON e.manager_id = th.employee_id
)
SELECT * FROM TeamHierarchy ORDER BY depth, full_name;`,
  },
  {
    id: 'sql-3',
    language: 'sql',
    title: 'Upsert with Conflict Handling',
    difficulty: 'Beginner',
    filename: 'upsert_user.sql',
    description: 'Atomic PostgreSQL / SQLite upsert statement.',
    code: `INSERT INTO users (id, email, best_wpm, total_runs, updated_at)
VALUES ('u_902', 'dev@velocity.app', 112, 1, NOW())
ON CONFLICT (id) DO UPDATE SET
    best_wpm = GREATEST(users.best_wpm, EXCLUDED.best_wpm),
    total_runs = users.total_runs + 1,
    updated_at = NOW();`,
  },
  {
    id: 'sql-4',
    language: 'sql',
    title: 'Conditional Aggregation Pivot by Month',
    difficulty: 'Intermediate',
    filename: 'pivot_revenue.sql',
    description: 'Pivoting relational rows into column matrices with CASE WHEN.',
    code: `SELECT 
    language,
    COUNT(*) AS total_races,
    ROUND(AVG(wpm), 2) AS avg_wpm,
    COUNT(CASE WHEN wpm >= 100 THEN 1 END) AS pro_count,
    COUNT(CASE WHEN wpm < 60 THEN 1 END) AS rookie_count
FROM telemetry_logs
GROUP BY language
HAVING COUNT(*) > 5
ORDER BY avg_wpm DESC;`,
  },
  {
    id: 'sql-5',
    language: 'sql',
    title: 'ACID Transaction with Row Locking',
    difficulty: 'Advanced (LeetCode)',
    filename: 'transfer_coins.sql',
    description: 'Pessimistic locking and balance transfer transaction.',
    code: `BEGIN TRANSACTION;
SELECT balance FROM accounts 
WHERE user_id = 'u_sender' FOR UPDATE;

UPDATE accounts 
SET balance = balance - 150 
WHERE user_id = 'u_sender' AND balance >= 150;

UPDATE accounts 
SET balance = balance + 150 
WHERE user_id = 'u_receiver';
COMMIT;`,
  },
  {
    id: 'sql-6',
    language: 'sql',
    title: 'Leaderboard Percentile Ranking',
    difficulty: 'Intermediate',
    filename: 'percentile_rank.sql',
    description: 'Calculate exact typing percentile using PERCENT_RANK windowing.',
    code: `SELECT 
    user_id,
    best_wpm,
    ROUND((PERCENT_RANK() OVER (ORDER BY best_wpm ASC) * 100)::numeric, 1) AS percentile
FROM user_stats
WHERE best_wpm > 0
ORDER BY best_wpm DESC
LIMIT 50;`,
  },

  // ==================== HTML & CSS ====================
  {
    id: 'html-1',
    language: 'html_css',
    title: 'Modern Responsive Card with Flexbox & Grid',
    difficulty: 'Beginner',
    filename: 'card.html',
    description: 'Accessible semantic card component with hover transition.',
    code: `<article class="card">
  <header class="card-header">
    <h3 class="card-title">CodeVelocity Sprint</h3>
    <span class="badge">Esports Live</span>
  </header>
  <div class="card-body">
    <p>Zero-latency multi-line code typing platform.</p>
  </div>
  <footer class="card-footer">
    <button class="btn btn-primary">Start Race</button>
  </footer>
</article>`,
  },
  {
    id: 'html-2',
    language: 'html_css',
    title: 'Glassmorphism Backdrop Blur Panel',
    difficulty: 'Intermediate',
    filename: 'glass.css',
    description: 'Modern translucent glowing glassmorphism CSS styling.',
    code: `.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
}`,
  },
  {
    id: 'html-3',
    language: 'html_css',
    title: 'Cyberpunk Neon Glow Button & Keyframes',
    difficulty: 'Intermediate',
    filename: 'neon_button.css',
    description: 'Glowing animated cyber button with CSS keyframe pulse.',
    code: `.neon-btn {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: #0b0f19;
  font-weight: 800;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.neon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.8);
}`,
  },
  {
    id: 'html-4',
    language: 'html_css',
    title: 'Accessible Dark Mode CSS Variables',
    difficulty: 'Beginner',
    filename: 'theme.css',
    description: 'CSS Custom Properties responsive to prefers-color-scheme.',
    code: `:root {
  --bg-primary: #0b0f19;
  --text-primary: #f8fafc;
  --accent-cyan: #38bdf8;
}
@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #ffffff;
    --text-primary: #0f172a;
    --accent-cyan: #0284c7;
  }
}`,
  },
  {
    id: 'html-5',
    language: 'html_css',
    title: 'CSS Grid Holy Grail Dashboard Layout',
    difficulty: 'Advanced (LeetCode)',
    filename: 'dashboard_grid.css',
    description: 'Modern named grid-template-areas layout with responsive collapse.',
    code: `.app-shell {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 260px 1fr 320px;
  grid-template-areas:
    "nav nav nav"
    "sidebar main telemetry"
    "footer footer footer";
  min-height: 100vh;
}`,
  },
  {
    id: 'html-6',
    language: 'html_css',
    title: 'Custom Toggle Switch with Pseudo Elements',
    difficulty: 'Beginner',
    filename: 'toggle.html',
    description: 'Pure CSS accessible toggle switch with smooth sliding thumb.',
    code: `<label class="switch">
  <input type="checkbox" checked />
  <span class="slider round"></span>
</label>
<style>
.switch { position: relative; display: inline-block; width: 48px; height: 26px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: #334155; border-radius: 26px; cursor: pointer; }
.slider:before { content: ""; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .3s; }
input:checked + .slider { background: #38bdf8; }
input:checked + .slider:before { transform: translateX(22px); }
</style>`,
  },
];

// Helper: Pick a random snippet from available pool (different from currentId)
export function getRandomSnippet(
  language: SupportedLanguage,
  currentId?: string,
  difficulty?: string
): { snippet: CodeSnippet; index: number } {
  let pool = CODE_SNIPPETS.filter((s) => s.language === language);
  if (difficulty && difficulty !== 'All') {
    const diffPool = pool.filter((s) => s.difficulty === difficulty);
    if (diffPool.length > 0) pool = diffPool;
  }

  if (pool.length === 0) {
    return { snippet: CODE_SNIPPETS[0], index: 0 };
  }

  // Filter out currentId if multiple snippets exist
  const candidates = pool.length > 1 ? pool.filter((s) => s.id !== currentId) : pool;
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  const index = pool.findIndex((s) => s.id === picked.id);

  return { snippet: picked, index: Math.max(0, index) };
}
