import React, { useState } from 'react';
import {
  Calculator,
  Cpu,
  Binary,
  Zap,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  calculateOhmsLaw,
  compareAlgorithmComplexity,
  calculateDegreeClass,
  solveQuadraticEquation,
  calculateProjectileMotion,
  GradeItem,
} from '../utils/stemCalculators.ts';

export const StemToolsView: React.FC = () => {
  const [activeSubTool, setActiveSubTool] = useState<'ohms' | 'bigo' | 'calculus' | 'gpa' | 'quadratic' | 'binary' | 'projectile'>('ohms');

  // Ohm's Law state
  const [voltageInput, setVoltageInput] = useState<string>('12');
  const [currentInput, setCurrentInput] = useState<string>('2');
  const [resistanceInput, setResistanceInput] = useState<string>('');

  // Big-O simulator state
  const [inputSizeN, setInputSizeN] = useState<number>(64);

  // Degree classification state
  const [grades, setGrades] = useState<GradeItem[]>([
    { courseCode: 'SE201', credits: 4, mark: 78 },
    { courseCode: 'CS101', credits: 4, mark: 82 },
    { courseCode: 'MTH204', credits: 3, mark: 71 },
    { courseCode: 'EE302', credits: 4, mark: 68 },
  ]);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCredits, setNewCredits] = useState('4');
  const [newMark, setNewMark] = useState('75');

  // Quadratic calculator state
  const [quadraticA, setQuadraticA] = useState('1');
  const [quadraticB, setQuadraticB] = useState('-3');
  const [quadraticC, setQuadraticC] = useState('2');

  // Binary converter state
  const [binaryInput, setBinaryInput] = useState('101101');

  // Projectile motion state
  const [projectileVelocity, setProjectileVelocity] = useState('20');
  const [projectileAngle, setProjectileAngle] = useState('45');

  // Calculate Ohm's Law
  const vNum = voltageInput ? parseFloat(voltageInput) : undefined;
  const iNum = currentInput ? parseFloat(currentInput) : undefined;
  const rNum = resistanceInput ? parseFloat(resistanceInput) : undefined;
  const ohmsResult = calculateOhmsLaw({
    voltage: Number.isFinite(vNum) ? vNum : undefined,
    current: Number.isFinite(iNum) ? iNum : undefined,
    resistance: Number.isFinite(rNum) ? rNum : undefined,
  });

  // Calculate Big-O
  const complexityResults = compareAlgorithmComplexity(inputSizeN);

  // Calculate Degree Classification
  const gpaResult = calculateDegreeClass(grades);

  // Additional STEM calculations
  const quadraticValues = solveQuadraticEquation(
    Number.parseFloat(quadraticA) || 0,
    Number.parseFloat(quadraticB) || 0,
    Number.parseFloat(quadraticC) || 0
  );

  const decimalValue = Number.parseInt(binaryInput, 2) || 0;
  const projectile = calculateProjectileMotion(
    Number.parseFloat(projectileVelocity) || 0,
    Number.parseFloat(projectileAngle) || 0,
    9.81
  );

  const addGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim()) return;
    setGrades((prev) => [
      ...prev,
      {
        courseCode: newCourseCode.trim().toUpperCase(),
        credits: parseInt(newCredits) || 3,
        mark: Math.min(100, Math.max(0, parseFloat(newMark) || 0)),
      },
    ]);
    setNewCourseCode('');
  };

  const removeGrade = (index: number) => {
    setGrades((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-indigo-400" />
          Interactive STEM Formula & Engineering Tools
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Handy mathematical calculators, circuit laws, algorithmic complexity simulators, and official university grading tools.
        </p>

        {/* Sub-tools Tab Bar */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTool('ohms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTool === 'ohms'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Ohm's Law & Circuit Calculator</span>
          </button>

          <button
            onClick={() => setActiveSubTool('bigo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTool === 'bigo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Algorithm Complexity (Big-O)</span>
          </button>

          <button
            onClick={() => setActiveSubTool('calculus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTool === 'calculus'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Binary className="w-4 h-4 text-sky-400" />
            <span>Laplace & Calculus Reference</span>
          </button>

          <button
            onClick={() => setActiveSubTool('gpa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTool === 'gpa'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>UZ Degree Classification Calculator</span>
          </button>

          <button
            onClick={() => setActiveSubTool('quadratic')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTool === 'quadratic'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span>Quadratic Solver</span>
          </button>

          <button
            onClick={() => setActiveSubTool('binary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTool === 'binary'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Binary / Decimal Converter</span>
          </button>

          <button
            onClick={() => setActiveSubTool('projectile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTool === 'projectile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Projectile Motion</span>
          </button>
        </div>
      </div>

      {/* Tool 1: Ohm's Law */}
      {activeSubTool === 'ohms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Ohm's Law Input (Provide any 2 values)
            </h2>
            <p className="text-xs text-slate-400">
              Formula: <code className="text-amber-300 font-mono">V = I × R</code> and <code className="text-amber-300 font-mono">P = V × I = I²R</code>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Voltage (V in Volts)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 12"
                  value={voltageInput}
                  onChange={(e) => setVoltageInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current (I in Amperes)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 2"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resistance (R in Ohms Ω)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 6 (leave empty to compute)"
                  value={resistanceInput}
                  onChange={(e) => setResistanceInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setVoltageInput('');
                  setCurrentInput('');
                  setResistanceInput('');
                }}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Reset inputs
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-2">Calculated Circuit Values</h2>
              {ohmsResult ? (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Voltage (V)</span>
                    <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
                      {ohmsResult.voltage.toFixed(2)} V
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Current (I)</span>
                    <p className="text-2xl font-mono font-bold text-sky-400 mt-1">
                      {ohmsResult.current.toFixed(2)} A
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Resistance (R)</span>
                    <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                      {ohmsResult.resistance.toFixed(2)} Ω
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Power Dissipated (P)</span>
                    <p className="text-2xl font-mono font-bold text-rose-400 mt-1">
                      {ohmsResult.power.toFixed(2)} W
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs mt-6 bg-slate-950 rounded-xl">
                  Please enter at least two numerical values on the left to compute the circuit parameters.
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300">
              💡 <strong>Lab Tip (EE302):</strong> When analyzing DC circuit loops, ensure power limits match resistor ratings (e.g. standard 1/4W vs 1W resistors).
            </div>
          </div>
        </div>
      )}

      {/* Tool 2: Big-O Complexity */}
      {activeSubTool === 'bigo' && (
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Algorithm Growth Rate Simulator (Big-O Asymptotics)
              </h2>
              <p className="text-xs text-slate-400">
                Visualize how runtime operations scale as input size (n) increases.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Input Size (n):</span>
              <input
                type="number"
                min={1}
                max={100000}
                value={inputSizeN}
                onChange={(e) => setInputSizeN(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {complexityResults.map((step) => (
              <div key={step.notation} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                    {step.notation}
                  </span>
                  <h4 className="text-xs font-semibold text-white mt-2">{step.name}</h4>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Est. Operations</span>
                  <p className="text-lg font-mono font-bold text-emerald-400">
                    {step.operations === Infinity ? 'Infinity' : step.operations.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 mt-4">
            <h4 className="font-bold text-white">Classic Algorithm Classifications:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400">
              <div>• <strong>O(1):</strong> Array index lookup, Hash table insert/lookup (amortized)</div>
              <div>• <strong>O(log n):</strong> Binary search, balanced BST search</div>
              <div>• <strong>O(n):</strong> Linear scan, array copy, breadth-first search on tree</div>
              <div>• <strong>O(n log n):</strong> Merge Sort, Quick Sort (average), Heap Sort</div>
              <div>• <strong>O(n²):</strong> Bubble Sort, Insertion Sort, nested loop matrix addition</div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 3: Calculus & Laplace Reference */}
      {activeSubTool === 'calculus' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-sky-400" />
              Laplace Transform Cheat Sheet (MTH204)
            </h2>
            <p className="text-xs text-slate-400">Standard operational transform pairs for engineering mathematics:</p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">f(t) = 1</span>
                <span className="text-sky-300">F(s) = 1 / s</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">f(t) = tⁿ</span>
                <span className="text-sky-300">F(s) = n! / sⁿ⁺¹</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">f(t) = eᵃᵗ</span>
                <span className="text-sky-300">F(s) = 1 / (s - a)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">f(t) = sin(ωt)</span>
                <span className="text-sky-300">F(s) = ω / (s² + ω²)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">f(t) = cos(ωt)</span>
                <span className="text-sky-300">F(s) = s / (s² + ω²)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">f'(t)</span>
                <span className="text-sky-300">s F(s) - f(0)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-300">f''(t)</span>
                <span className="text-sky-300">s² F(s) - s f(0) - f'(0)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Differential Equations & Calculus Tips
            </h2>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-indigo-300">Second-Order Linear Homogeneous ODEs:</h4>
              <p className="font-mono text-slate-200">a y'' + b y' + c y = 0</p>
              <p className="text-slate-400">Auxiliary equation: <code className="text-white">a r² + b r + c = 0</code></p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Two distinct real roots (r₁, r₂): <code className="text-sky-300">y = c₁e^(r₁t) + c₂e^(r₂t)</code></li>
                <li>Repeated root (r): <code className="text-sky-300">y = (c₁ + c₂t)e^(rt)</code></li>
                <li>Complex roots (α ± iβ): <code className="text-sky-300">y = e^(αt)(c₁ cos βt + c₂ sin βt)</code></li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-amber-300">Fundamental Physics Constants:</h4>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400">
                <div>c = 2.998 × 10⁸ m/s</div>
                <div>e = 1.602 × 10⁻¹⁹ C</div>
                <div>h = 6.626 × 10⁻³⁴ J·s</div>
                <div>ε₀ = 8.854 × 10⁻¹² F/m</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 4: Degree Classification */}
      {activeSubTool === 'gpa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              University Degree Modules & Marks (Zimbabwe Standard)
            </h2>
            <p className="text-xs text-slate-400">
              Enter your course module marks (0-100%) and credit weightings to calculate your weighted overall grade classification.
            </p>

            <form onSubmit={addGrade} className="flex flex-wrap gap-2 pt-2">
              <input
                type="text"
                placeholder="Course (e.g. SE202)"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white uppercase font-mono w-28"
              />
              <input
                type="number"
                placeholder="Credits"
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono w-20"
              />
              <input
                type="number"
                placeholder="Mark %"
                value={newMark}
                onChange={(e) => setNewMark(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono w-24"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                + Add Course
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {grades.map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-300">{g.courseCode}</span>
                    <span className="text-slate-400">{g.credits} Credits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{g.mark}%</span>
                    <button
                      onClick={() => removeGrade(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Degree Classification Result</h3>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 text-center mt-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Overall Weighted Average
                </span>
                <p className="text-4xl font-extrabold font-mono text-white mt-1">
                  {gpaResult.averageMark.toFixed(1)}%
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                  {gpaResult.classification}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between">
                  <span>First Class (1):</span>
                  <strong className="text-emerald-400 font-mono">75% - 100%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Upper Second (2.1):</span>
                  <strong className="text-sky-400 font-mono">65% - 74%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Lower Second (2.2):</span>
                  <strong className="text-amber-400 font-mono">60% - 64%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Pass (3):</span>
                  <strong className="text-slate-300 font-mono">50% - 59%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 5: Quadratic Solver */}
      {activeSubTool === 'quadratic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              Quadratic Equation Solver
            </h2>
            <p className="text-xs text-slate-400">Solve ax² + bx + c = 0 for real roots.</p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">a</label>
                <input value={quadraticA} onChange={(e) => setQuadraticA(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">b</label>
                <input value={quadraticB} onChange={(e) => setQuadraticB(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">c</label>
                <input value={quadraticC} onChange={(e) => setQuadraticC(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3">Results</h3>
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3 text-xs text-slate-300">
              <div className="flex justify-between"><span>Discriminant:</span><strong className="font-mono text-indigo-300">{quadraticValues.discriminant.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Root 1:</span><strong className="font-mono text-emerald-300">{quadraticValues.roots[0] === null ? 'No real root' : quadraticValues.roots[0].toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Root 2:</span><strong className="font-mono text-emerald-300">{quadraticValues.roots[1] === null ? 'No real root' : quadraticValues.roots[1].toFixed(2)}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 6: Binary/Decimal converter */}
      {activeSubTool === 'binary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-cyan-400" />
              Binary to Decimal Converter
            </h2>
            <label className="block text-[11px] text-slate-400 mb-1">Binary value</label>
            <input
              value={binaryInput}
              onChange={(e) => setBinaryInput(e.target.value.replace(/[^01]/g, ''))}
              placeholder="101101"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3">Converted result</h3>
            <div className="space-y-3 rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-300">
              <div className="flex justify-between"><span>Decimal:</span><strong className="font-mono text-cyan-300">{decimalValue}</strong></div>
              <div className="flex justify-between"><span>Hex:</span><strong className="font-mono text-cyan-300">{decimalValue.toString(16).toUpperCase()}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 7: Projectile Motion */}
      {activeSubTool === 'projectile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Projectile Motion Calculator
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Initial velocity (m/s)</label>
                <input value={projectileVelocity} onChange={(e) => setProjectileVelocity(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Launch angle (°)</label>
                <input value={projectileAngle} onChange={(e) => setProjectileAngle(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-3">Trajectory results</h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400 block">Time of flight</span><strong className="font-mono text-rose-300">{projectile.timeOfFlight.toFixed(2)} s</strong></div>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400 block">Range</span><strong className="font-mono text-rose-300">{projectile.range.toFixed(2)} m</strong></div>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400 block">Max height</span><strong className="font-mono text-rose-300">{projectile.maxHeight.toFixed(2)} m</strong></div>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400 block">Vx</span><strong className="font-mono text-rose-300">{projectile.horizontalVelocity.toFixed(2)} m/s</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
