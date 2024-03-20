using BenchmarkDotNet.Attributes;

namespace DH.Benchmarks
{
    [ShortRunJob, MemoryDiagnoser]
    public class FirstBenchy
    {
        [Params(1000, 10000, 100000)]
        public int N;

        private readonly List<int> _randomIntegers = [];

        [GlobalSetup]
        public void Setup()
        {
            Random random = new();
            for (int i = 0; i < N; i++)
            {
                _randomIntegers.Add(random.Next());
            }
        }

        [Benchmark]
        public void TestMethod()
        {
            _randomIntegers.Sort();
        }
    }
}
