import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Sliders, Check } from 'lucide-react';

interface SolverConfigModalProps {
  onClose: () => void;
}

export const SolverConfigModal: React.FC<SolverConfigModalProps> = ({ onClose }) => {
  const { solverConfig, setSolverConfig } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold tracking-tight">CP-SAT Solver Parameters</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optimization Time Limit (ms)
            </label>
            <select
              value={solverConfig.maxTimeMs}
              onChange={(e) =>
                setSolverConfig((prev) => ({
                  ...prev,
                  maxTimeMs: parseInt(e.target.value, 10),
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value={1500}>1,500 ms (Rapid Draft)</option>
              <option value={3000}>3,000 ms (Standard Balanced)</option>
              <option value={5000}>5,000 ms (Deep Annealing)</option>
              <option value={10000}>10,000 ms (Exhaustive Search)</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Morning Core Lecture Priority
                </span>
                <span className="text-[11px] text-slate-500">
                  Favor 07:00 - 12:00 morning slots for core theoretical subjects
                </span>
              </div>
              <input
                type="checkbox"
                checked={solverConfig.morningLecturePriority}
                onChange={(e) =>
                  setSolverConfig((prev) => ({
                    ...prev,
                    morningLecturePriority: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
              />
            </label>
          </div>

          <div className="pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Student Schedule Compactness Weight</span>
              <span className="text-indigo-600">{solverConfig.minimizeGapsWeight}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={solverConfig.minimizeGapsWeight}
              onChange={(e) =>
                setSolverConfig((prev) => ({
                  ...prev,
                  minimizeGapsWeight: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-indigo-600"
            />
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Higher values penalize idle hours between lectures on the same day.
            </span>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  );
};
