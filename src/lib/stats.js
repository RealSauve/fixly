// Derived counts for the dashboard strip. Always computed from the data,
// never stored.
export function computeStats(complaints) {
  const stats = {
    new: 0,
    inProgress: 0,
    waiting: 0,
    highPriority: 0,
  }

  for (const complaint of complaints) {
    if (complaint.status === 'New') stats.new += 1
    if (complaint.status === 'In Progress') stats.inProgress += 1
    if (complaint.status === 'Waiting on Customer') stats.waiting += 1
    if (complaint.priority === 'High' && complaint.status !== 'Resolved') {
      stats.highPriority += 1
    }
  }

  return stats
}
