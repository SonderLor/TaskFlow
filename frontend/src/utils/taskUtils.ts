export function getStatusBadgeVariant(statusTitle: string): string {
    const title = statusTitle.toLowerCase();
    
    if (title === 'open' || title === 'new' || title === 'to do') {
      return 'primary';
    } else if (title === 'in progress' || title === 'ongoing') {
      return 'info';
    } else if (title === 'review' || title === 'pending') {
      return 'warning';
    } else if (title === 'done' || title === 'completed' || title === 'closed') {
      return 'success';
    } else if (title === 'cancelled' || title === 'rejected') {
      return 'danger';
    } else {
      return 'secondary';
    }
  }
  