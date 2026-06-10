// components/Skeleton.jsx
const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700
    ${rounded} ${className}`} />
);

export const CourseCardSkeleton = () => (
  <div className="bg-[var(--surface-1)] rounded-2xl overflow-hidden
    border border-[var(--border-light)]">
    <Skeleton className="w-full h-44" rounded="rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-full" rounded="rounded-lg" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr>
    {[1,2,3,4].map(i => (
      <td key={i} className="px-5 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Skeleton;