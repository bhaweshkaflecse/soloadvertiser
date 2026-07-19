'use client';

interface FilterOption {
  label: string;
  value: string;
}

interface TableFilterConfig {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date';
  options?: FilterOption[];
}

interface TableFiltersProps {
  filters: TableFilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function TableFilters({ filters, values, onChange, onClear }: TableFiltersProps) {
  const hasActiveFilters = Object.values(values).some((v) => v !== '');

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border rounded-lg mb-4">
      {filters.map((filter) => {
        if (filter.type === 'search') {
          return (
            <input
              key={filter.key}
              type="text"
              placeholder={filter.label}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          );
        }

        if (filter.type === 'select') {
          return (
            <select
              key={filter.key}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{filter.label}</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        if (filter.type === 'date') {
          return (
            <input
              key={filter.key}
              type="date"
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        }

        return null;
      })}

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
