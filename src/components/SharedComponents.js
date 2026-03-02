export function StatusBadge({ status }) {
  const statusLabels = {
    new: "جديد",
    offered: "معروض",
    accepted: "مقبول",
    assigned: "معيّن",
    in_progress: "جاري",
    completed: "مكتمل",
    cancelled: "ملغى",
    scheduled: "مجدول"
  };
  
  return (
    <span className={`status-badge status-${status}`} data-testid={`status-badge-${status}`}>
      {statusLabels[status] || status}
    </span>
  );
}

export function StatsCard({ title, value, icon: Icon, color = "primary" }) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700"
  };
  
  return (
    <div className="bg-white border border-border rounded-lg p-6 card-hover" data-testid="stats-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-2xl font-bold text-primary mb-1" data-testid="stats-value">{value}</p>
      <p className="text-sm text-muted-foreground" data-testid="stats-title">{title}</p>
    </div>
  );
}

export function RequestCard({ request, onViewDetails }) {
  const serviceTypeLabels = {
    substitute: "معلم بديل",
    remote_school: "مدرسة عن بعد",
    special_education: "تعليم شامل"
  };
  
  const modeLabels = {
    in_person: "حضوري",
    remote: "عن بعد"
  };
  
  return (
    <div className="bg-white border border-border rounded-lg p-6 card-hover" data-testid="request-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary mb-1" data-testid="request-subject">{request.subject}</h3>
          <p className="text-sm text-muted-foreground" data-testid="request-grade">{request.grade}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">نوع الخدمة:</span>
          <span className="font-medium text-primary">{serviceTypeLabels[request.service_type]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">طريقة التعليم:</span>
          <span className="font-medium text-primary">{modeLabels[request.mode]}</span>
        </div>
        {request.city && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">المدينة:</span>
            <span className="font-medium text-primary">{request.city}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">التاريخ:</span>
          <span className="font-medium text-primary">{new Date(request.date_time).toLocaleDateString('ar-SA')}</span>
        </div>
      </div>
      
      {request.notes && (
        <p className="text-sm text-muted-foreground mb-4 border-t pt-3">
          {request.notes}
        </p>
      )}
      
      <button
        onClick={() => onViewDetails(request.request_id)}
        className="w-full btn-primary py-2 rounded-lg text-sm"
        data-testid="view-request-btn"
      >
        عرض التفاصيل
      </button>
    </div>
  );
}

export function AssignmentCard({ assignment, onViewDetails }) {
  return (
    <div className="bg-white border border-border rounded-lg p-6 card-hover" data-testid="assignment-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary mb-1">جلسة تعليمية</h3>
          <p className="text-sm text-muted-foreground">{assignment.assignment_id}</p>
        </div>
        <StatusBadge status={assignment.status} />
      </div>
      
      {assignment.meeting_link && (
        <div className="mb-4">
          <a
            href={assignment.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-secondary hover:underline"
            data-testid="meeting-link"
          >
            رابط الجلسة ↗
          </a>
        </div>
      )}
      
      {assignment.notes && (
        <p className="text-sm text-muted-foreground mb-4">
          {assignment.notes}
        </p>
      )}
      
      <button
        onClick={() => onViewDetails(assignment.assignment_id)}
        className="w-full btn-primary py-2 rounded-lg text-sm"
        data-testid="view-assignment-btn"
      >
        عرض التفاصيل
      </button>
    </div>
  );
}
