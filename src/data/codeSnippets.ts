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
    .map(Driver::getUsername)
    .sorted()
    .toList();
}`,
  },

  // ==================== PYTHON ====================
  {
    id: 'py-1',
    language: 'python',
    title: 'Two Sum Optimal Algorithm (LeetCode #1)',
    difficulty: 'Intermediate',
    filename: 'two_sum.py',
    description: 'Optimal O(n) hashmap solution to find indices adding to target.',
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
  },
  {
    id: 'py-2',
    language: 'python',
    title: 'Binary Search Implementation',
    difficulty: 'Beginner',
    filename: 'binary_search.py',
    description: 'O(log N) divide and conquer over a sorted array.',
    code: `def binary_search(arr: list[int], target: int) -> int:
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
  },
  {
    id: 'py-3',
    language: 'python',
    title: 'Execution Benchmark Decorator',
    difficulty: 'Advanced (LeetCode)',
    filename: 'benchmark.py',
    description: 'High-precision function execution timing decorator with functools.',
    code: `import time
from functools import wraps

def time_it(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"{func.__name__} took {duration:.4f}s")
        return result
    return wrapper`,
  },

  // ==================== JAVASCRIPT ====================
  {
    id: 'js-1',
    language: 'javascript',
    title: 'Async Fetch with Exponential Backoff',
    difficulty: 'Intermediate',
    filename: 'fetchWithRetry.js',
    description: 'Resilient network request with retry counter and delay.',
    code: `async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}`,
  },
  {
    id: 'js-2',
    language: 'javascript',
    title: 'Custom Event Debounce Hook',
    difficulty: 'Beginner',
    filename: 'debounce.js',
    description: 'Keystroke event debounce higher-order closure function.',
    code: `function debounce(callback, delay = 300) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}`,
  },
  {
    id: 'js-3',
    language: 'javascript',
    title: 'Array Pipeline Group By',
    difficulty: 'Intermediate',
    filename: 'groupBy.js',
    description: 'Grouping complex objects by key using Array.prototype.reduce.',
    code: `const groupRacersByTier = (racers) => {
  return racers.reduce((acc, racer) => {
    const tier = racer.wpm >= 100 ? 'Apex' : 'Pro';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(racer.username);
    return acc;
  }, {});
};`,
  },

  // ==================== TYPESCRIPT ====================
  {
    id: 'ts-1',
    language: 'typescript',
    title: 'Custom React Typing Hook',
    difficulty: 'Intermediate',
    filename: 'useTypingEngine.ts',
    description: 'Strongly-typed React state hook returning telemetry getters.',
    code: `export const useTyping = (snippet: string) => {
  const [index, setIndex] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);

  const handleKey = useCallback((char: string) => {
    if (char === snippet[index]) {
      setIndex(prev => prev + 1);
    }
  }, [snippet, index]);

  return { index, wpm, handleKey };
};`,
  },
  {
    id: 'ts-2',
    language: 'typescript',
    title: 'Discriminated State Union Machine',
    difficulty: 'Advanced (LeetCode)',
    filename: 'raceState.ts',
    description: 'Exhaustive pattern-matching state union for WebSocket rooms.',
    code: `type RaceState =
  | { status: 'idle'; roomId: null }
  | { status: 'countdown'; seconds: number }
  | { status: 'racing'; currentWpm: number; progress: number }
  | { status: 'finished'; rank: number; accuracy: number };

function handleState(state: RaceState): string {
  switch (state.status) {
    case 'countdown': return \`Starting in \${state.seconds}s\`;
    case 'racing': return \`Driving at \${state.currentWpm} WPM\`;
    case 'finished': return \`Finished in P\${state.rank}\`;
    default: return 'Waiting for race...';
  }
}`,
  },

  // ==================== C++ ====================
  {
    id: 'cpp-1',
    language: 'cpp',
    title: 'STL Vector Sort with Custom Lambda',
    difficulty: 'Beginner',
    filename: 'leaderboard.cpp',
    description: 'Sorting racer structs using std::sort and modern C++ lambda.',
    code: `struct Racer {
  std::string name;
  int wpm;
  double accuracy;
};

void sortRacers(std::vector<Racer>& racers) {
  std::sort(racers.begin(), racers.end(), [](const Racer& a, const Racer& b) {
    if (a.wpm != b.wpm) return a.wpm > b.wpm;
    return a.accuracy > b.accuracy;
  });
}`,
  },
  {
    id: 'cpp-2',
    language: 'cpp',
    title: 'Thread-Safe Queue with Mutex',
    difficulty: 'Intermediate',
    filename: 'thread_queue.cpp',
    description: 'Thread-safe packet queue using std::mutex and std::condition_variable.',
    code: `template <typename T>
class SafeQueue {
private:
  std::queue<T> q;
  mutable std::mutex mtx;
public:
  void push(T val) {
    std::lock_guard<std::mutex> lock(mtx);
    q.push(std::move(val));
  }
  bool pop(T& val) {
    std::lock_guard<std::mutex> lock(mtx);
    if (q.empty()) return false;
    val = std::move(q.front());
    q.pop();
    return true;
  }
};`,
  },

  // ==================== RUST ====================
  {
    id: 'rust-1',
    language: 'rust',
    title: 'Idiomatic Pattern Matching with Result',
    difficulty: 'Beginner',
    filename: 'telemetry_parser.rs',
    description: 'Robust error handling with Rust match on string parsing.',
    code: `fn parse_speed(raw: &str) -> Result<u32, String> {
  let trimmed = raw.trim();
  match trimmed.parse::<u32>() {
    Ok(speed) if speed > 250 => Err("Speed anomaly detected".into()),
    Ok(speed) => Ok(speed),
    Err(_) => Err("Invalid integer payload".into()),
  }
}`,
  },
  {
    id: 'rust-2',
    language: 'rust',
    title: 'Multi-Thread Worker with Arc & Mutex',
    difficulty: 'Intermediate',
    filename: 'concurrency.rs',
    description: 'Sharing mutable state safely across threads using Arc and Mutex.',
    code: `use std::sync::{Arc, Mutex};
use std::thread;

pub fn calculate_total_wpm(scores: Vec<u32>) -> u32 {
  let counter = Arc::new(Mutex::new(0));
  let mut handles = vec![];

  for score in scores {
    let c = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
      let mut total = c.lock().unwrap();
      *total += score;
    }));
  }

  for h in handles { h.join().unwrap(); }
  let final_val = *counter.lock().unwrap();
  final_val
}`,
  },

  // ==================== GO ====================
  {
    id: 'go-1',
    language: 'go',
    title: 'Goroutine Channel Worker Pool',
    difficulty: 'Intermediate',
    filename: 'worker_pool.go',
    description: 'Concurrent task processing using buffered Go channels.',
    code: `func TelemetryWorker(id int, jobs <-chan int, results chan<- int) {
  for speed := range jobs {
    time.Sleep(time.Millisecond * 20)
    adjusted := speed + (id * 2)
    results <- adjusted
  }
}

func main() {
  jobs := make(chan int, 100)
  results := make(chan int, 100)
  for w := 1; w <= 3; w++ {
    go TelemetryWorker(w, jobs, results)
  }
}`,
  },

  // ==================== SQL ====================
  {
    id: 'sql-1',
    language: 'sql',
    title: 'Cohort Leaderboard with DENSE_RANK',
    difficulty: 'Beginner',
    filename: 'rankings.sql',
    description: 'Multi-line query ranking typists per cohort over 7 days.',
    code: `SELECT 
  user_id,
  username,
  MAX(wpm) AS peak_wpm,
  ROUND(AVG(accuracy), 2) AS avg_accuracy,
  DENSE_RANK() OVER (ORDER BY MAX(wpm) DESC) AS rank_pos
FROM race_results
WHERE completed_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id, username
HAVING COUNT(race_id) >= 5
ORDER BY rank_pos ASC;`,
  },

  // ==================== HTML & CSS ====================
  {
    id: 'html-1',
    language: 'html_css',
    title: 'Modern Tailwind Glassmorphic Card',
    difficulty: 'Beginner',
    filename: 'RacerCard.tsx',
    description: 'Clean responsive card markup with flexbox and neon border accents.',
    code: `<div className="flex flex-col items-center justify-between p-6 rounded-2xl bg-slate-900/80 border border-sky-500/30 shadow-2xl backdrop-blur-xl">
  <div className="flex items-center gap-3 w-full">
    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
    <h3 className="text-lg font-bold text-slate-100 font-mono">
      Telemetry HUD
    </h3>
  </div>
  <p className="text-xs text-slate-400 mt-2">
    Zero-latency typing metrics stream
  </p>
</div>`,
  },
];
