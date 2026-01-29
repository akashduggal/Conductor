import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { MODALITIES } from '../../utils/constants';
import { Modality } from '../../types/dataset';

interface DatasetFiltersProps {
  onFilterChange: (filters: { modality?: Modality; search?: string }) => void;
}

export const DatasetFilters = ({ onFilterChange }: DatasetFiltersProps) => {
  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState<Modality | ''>('');

  const handleSearch = () => {
    onFilterChange({
      search: search || undefined,
      modality: selectedModality || undefined,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedModality('');
    onFilterChange({});
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-800 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-zinc-400" />
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value as Modality | '')}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Modalities</option>
            {MODALITIES.map((mod) => (
              <option key={mod} value={mod}>
                {mod.charAt(0).toUpperCase() + mod.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};
