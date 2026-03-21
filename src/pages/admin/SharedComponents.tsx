import { ChevronLeft, ChevronRight } from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-500/30',
    pending: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30',
    failed: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30',
    waived: 'bg-gray-100 dark:bg-gray-600/20 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/30',
    connected: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-500/30',
    error: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startIndex} to {endIndex} of {totalItems}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 7) return true;
              if (page === 1 || page === totalPages) return true;
              if (page >= currentPage - 1 && page <= currentPage + 1) return true;
              return false;
            })
            .map((page, index, array) => {
              const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
              return (
                <div key={page} className="flex items-center space-x-1">
                  {showEllipsisBefore && (
                    <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg shadow-blue-500/50 dark:shadow-blue-600/50'
                        : 'bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}
        </div>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
