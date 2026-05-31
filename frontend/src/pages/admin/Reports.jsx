import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)

  const attendanceQuery = useQuery({
    queryKey: ['reportAttendance', from, to],
    queryFn: () => api.get(`/reports/attendance-summary?from=${from}&to=${to}`).then(res => res.data),
    enabled: !!from && !!to,
  })

  const ratingsQuery = useQuery({
    queryKey: ['reportRatings', from, to],
    queryFn: () => api.get(`/reports/ratings-summary?from=${from}&to=${to}`).then(res => res.data),
    enabled: !!from && !!to,
  })

  const tasksQuery = useQuery({
    queryKey: ['reportTasks'],
    queryFn: () => api.get('/reports/task-completion').then(res => res.data),
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reports</h2>

      <div className="mb-4 flex gap-4 items-center">
        <div>
          <label className="block text-sm">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border p-2 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">Attendance Summary</h3>
          {attendanceQuery.isLoading && <p>Loading...</p>}
          {attendanceQuery.data?.length === 0 && <p>No data for selected period</p>}
          {attendanceQuery.data?.map(row => (
            <p key={row.role + row.status}>{row.role} – {row.status}: {row.count}</p>
          ))}
        </div>

        {/* Ratings Summary */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">Ratings Summary</h3>
          {ratingsQuery.isLoading && <p>Loading...</p>}
          {ratingsQuery.data?.length === 0 && <p>No data for selected period</p>}
          {ratingsQuery.data?.map(row => (
            <p key={row.role}>{row.role}: Avg {parseFloat(row.avg_score).toFixed(2)} ({row.total} ratings)</p>
          ))}
        </div>

        {/* Task Completion */}
        <div className="bg-white p-4 rounded shadow col-span-1 md:col-span-2">
          <h3 className="font-semibold text-lg mb-2">Task Completion</h3>
          {tasksQuery.isLoading && <p>Loading...</p>}
          {tasksQuery.data?.length === 0 && <p>No tasks</p>}
          {tasksQuery.data?.map(task => (
            <p key={task.id}>{task.title} – Verified: {task.verified}, Pending: {task.pending}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
