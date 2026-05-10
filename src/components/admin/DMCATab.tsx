import { Loader2, FileWarning } from 'lucide-react'
import { useDmcaRequests } from '@/hooks/useDb'

export function DMCATab() {
  const { data: requests, isLoading } = useDmcaRequests()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#22D3EE] animate-spin" />
      </div>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-20">
        <FileWarning className="w-10 h-10 text-[#475569] mx-auto mb-3" />
        <h3 className="text-sm font-bold text-[#E2E8F0] mb-1">No DMCA Requests</h3>
        <p className="text-xs text-[#64748b]">No takedown requests have been submitted yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.06)]">
            <th className="py-3 px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Date</th>
            <th className="py-3 px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Name</th>
            <th className="py-3 px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Email</th>
            <th className="py-3 px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Mod ID</th>
            <th className="py-3 px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Reason</th>
            <th className="py-3 px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]"
            >
              <td className="py-2.5 px-3 text-xs text-[#94a3b8] whitespace-nowrap">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
              </td>
              <td className="py-2.5 px-3 text-xs text-[#E2E8F0] font-medium">{r.name}</td>
              <td className="py-2.5 px-3 text-xs text-[#94a3b8]">{r.email}</td>
              <td className="py-2.5 px-3 text-xs font-mono text-[#64748b]">{r.modId || '—'}</td>
              <td className="py-2.5 px-3 text-xs text-[#94a3b8] max-w-[200px] truncate">{r.reason}</td>
              <td className="py-2.5 px-3">
                <span className="bdg bdg-vt-pending">{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
