import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ArrowLeft,
  Video,
  Link2,
  CheckCircle,
  Clock,
  User,
  BookOpen,
  MapPin,
  Calendar,
  Save,
  Play,
  Star,
  Upload,
  FileText,
  Trash2,
  MessageCircle,
  Send,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { StatusBadge } from "../components/SharedComponents";
import JitsiMeet from "../components/JitsiMeet";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJitsi, setShowJitsi] = useState(false);
  const [meetingLinkInput, setMeetingLinkInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewLoaded, setReviewLoaded] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, assignmentRes] = await Promise.all([
          fetch(`${API}/auth/me`, { credentials: "include" }),
          fetch(`${API}/assignments/${id}`, { credentials: "include" }),
        ]);

        const userData = await userRes.json();
        setUser(userData);

        if (!assignmentRes.ok) {
          navigate("/assignments");
          return;
        }

        const assignmentData = await assignmentRes.json();
        setAssignment(assignmentData);
        setMeetingLinkInput(assignmentData.meeting_link || "");
        setNotesInput(assignmentData.notes || "");

        // Fetch the related teaching request for context
        if (assignmentData.request_id) {
          const reqRes = await fetch(
            `${API}/requests/${assignmentData.request_id}`,
            { credentials: "include" },
          );
          if (reqRes.ok) {
            setRequest(await reqRes.json());
          }
        }

        // Fetch existing review if assignment is completed
        if (assignmentData.status === "completed") {
          try {
            const reviewRes = await fetch(`${API}/assignments/${id}/review`, {
              credentials: "include",
            });
            if (reviewRes.ok) {
              const reviewData = await reviewRes.json();
              if (reviewData) setReview(reviewData);
            }
          } catch {}
          setReviewLoaded(true);
        }

        // Fetch files for this assignment
        try {
          const filesRes = await fetch(`${API}/files?assignment_id=${id}`, {
            credentials: "include",
          });
          if (filesRes.ok) setFiles(await filesRes.json());
        } catch {}

        // Fetch chat messages
        try {
          const chatRes = await fetch(`${API}/chat/${id}`, {
            credentials: "include",
          });
          if (chatRes.ok) setChatMessages(await chatRes.json());
        } catch {}
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Poll for new chat messages every 5 seconds
  const fetchChatMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/chat/${id}`, { credentials: "include" });
      if (res.ok) {
        const msgs = await res.json();
        setChatMessages(msgs);
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    const interval = setInterval(fetchChatMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchChatMessages]);

  const chatContainerRef = useRef(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSaveMeetingLink = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ meeting_link: meetingLinkInput }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAssignment(updated);
      }
    } catch (error) {
      console.error("Error saving meeting link:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: notesInput }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAssignment(updated);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await fetch(`${API}/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAssignment(updated);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleMarkComplete = async () => {
    try {
      const res = await fetch(`${API}/assignments/${id}/complete`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        setAssignment((prev) => ({
          ...prev,
          status: "completed",
          completed_at: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.error("Error completing assignment:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating < 1) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API}/assignments/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReview(data);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignment_id", id);
      const res = await fetch(`${API}/files/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        const newFile = await res.json();
        setFiles((prev) => [...prev, newFile]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const res = await fetch(`${API}/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.file_id !== fileId));
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatSending) return;
    setChatSending(true);
    try {
      const res = await fetch(`${API}/chat/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: chatInput.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages((prev) => [...prev, msg]);
        setChatInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setChatSending(false);
    }
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const isTeacher = user.role === "teacher";
  const isCompleted = assignment.status === "completed";
  const isCancelled = assignment.status === "cancelled";
  const canEdit = isTeacher && !isCompleted && !isCancelled;

  const serviceTypeLabels = {
    substitute: t("serviceTypes.substitute"),
    remote_school: t("serviceTypes.remoteSchool"),
    special_education: t("serviceTypes.specialEducation"),
  };
  const modeLabels = {
    in_person: t("modes.inPerson"),
    remote: t("modes.remote"),
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const sidebarItems = [
    {
      icon: BackIcon,
      label: t("common.back"),
      onClick: () => navigate("/assignments"),
    },
  ];

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div
        className="fade-in max-w-4xl mx-auto"
        dir={isRTL ? "rtl" : "ltr"}
        data-testid="assignment-detail-page"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-primary">
              {t("assignments.assignmentDetails")}
            </h1>
            <StatusBadge status={assignment.status} />
          </div>
          <p className="text-muted-foreground">
            {assignment.teacher_name && assignment.student_name
              ? `${t("assignments.teacher")}: ${assignment.teacher_name} · ${t("assignments.student")}: ${assignment.student_name}`
              : assignment.assignment_id}
          </p>
        </div>

        {/* Jitsi Video Call Area */}
        {showJitsi && (
          <div className="mb-6">
            <JitsiMeet
              roomName={
                assignment.jitsi_room || `badeel-${assignment.assignment_id}`
              }
              userName={user.name || user.email}
              onClose={() => setShowJitsi(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content — Left/Right depends on RTL */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details Card */}
            {request && (
              <div className="bg-white border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t("assignments.requestInfo")}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t("requests.subject")}
                    </span>
                    <p className="font-medium text-primary">
                      {request.subject}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("requests.grade")}
                    </span>
                    <p className="font-medium text-primary">{request.grade}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("requests.serviceType")}
                    </span>
                    <p className="font-medium text-primary">
                      {serviceTypeLabels[request.service_type]}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("requests.mode")}
                    </span>
                    <p className="font-medium text-primary">
                      {modeLabels[request.mode]}
                    </p>
                  </div>
                  {request.city && (
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {t("requests.city")}
                      </span>
                      <p className="font-medium text-primary">{request.city}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t("requests.dateTime")}
                    </span>
                    <p className="font-medium text-primary">
                      {new Date(request.date_time).toLocaleString(
                        isRTL ? "ar-SA" : "en-US",
                      )}
                    </p>
                  </div>
                </div>
                {request.notes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      {t("requests.notes")}
                    </span>
                    <p className="text-sm text-primary mt-1">{request.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Meeting Link Card */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                {t("assignments.meetingLink")}
              </h2>

              {canEdit ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={meetingLinkInput}
                    onChange={(e) => setMeetingLinkInput(e.target.value)}
                    placeholder={t("assignments.setMeetingLink")}
                    className="flex-1 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    dir="ltr"
                  />
                  <button
                    onClick={handleSaveMeetingLink}
                    disabled={saving}
                    className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    {t("common.save")}
                  </button>
                </div>
              ) : assignment.meeting_link ? (
                <a
                  href={assignment.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline flex items-center gap-1"
                >
                  <Link2 className="w-4 h-4" />
                  {t("assignments.joinMeeting")} ↗
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("assignments.noMeetingLink")}
                </p>
              )}
            </div>

            {/* Notes Card */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4">
                {t("assignments.updateNotes")}
              </h2>
              {canEdit ? (
                <div className="space-y-2">
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder={t("assignments.notesPlaceholder")}
                    className="w-full border border-border rounded-lg px-4 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    {t("common.save")}
                  </button>
                </div>
              ) : assignment.notes ? (
                <p className="text-sm text-primary">{assignment.notes}</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("assignments.noNotes")}
                </p>
              )}
            </div>

            {/* Files Card */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("files.title")}
              </h2>

              {!isCompleted && !isCancelled && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" />
                    {uploading ? t("files.uploading") : t("files.uploadFile")}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.pptx,.xlsx"
                    />
                  </label>
                </div>
              )}

              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("files.noFiles")}
                </p>
              ) : (
                <div className="space-y-2">
                  {files.map((f) => (
                    <div
                      key={f.file_id}
                      className="flex items-center gap-2 p-2 border rounded-md text-sm"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <a
                        href={`${BACKEND_URL}${f.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 truncate text-primary hover:underline"
                      >
                        {f.original_name}
                      </a>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(f.size / 1024).toFixed(0)}KB
                      </span>
                      {f.uploader_id === user.user_id && (
                        <button
                          onClick={() => handleDeleteFile(f.file_id)}
                          className="text-red-500 hover:text-red-700 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — Actions */}
          <div className="space-y-6">
            {/* Video Call Card */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" />
                {t("assignments.videoCall")}
              </h2>
              {!isCompleted && !isCancelled && (
                <button
                  onClick={() => setShowJitsi(!showJitsi)}
                  className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    showJitsi
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {showJitsi ? (
                    <>
                      <Video className="w-4 h-4" />
                      {t("assignments.endClass")}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {isTeacher
                        ? t("assignments.startClass")
                        : t("assignments.joinClass")}
                    </>
                  )}
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                {t("assignments.jitsiNote")}
              </p>
            </div>

            {/* Status & Actions Card */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t("assignments.statusActions")}
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("status.label")}
                  </span>
                  <StatusBadge status={assignment.status} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("assignments.createdAt")}
                  </span>
                  <span className="text-primary">
                    {new Date(assignment.created_at).toLocaleDateString(
                      isRTL ? "ar-SA" : "en-US",
                    )}
                  </span>
                </div>

                {assignment.completed_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("assignments.completedAt")}
                    </span>
                    <span className="text-primary">
                      {new Date(assignment.completed_at).toLocaleDateString(
                        isRTL ? "ar-SA" : "en-US",
                      )}
                    </span>
                  </div>
                )}

                {/* Teacher: participants info */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("assignments.teacher")}:
                    </span>
                    <span className="font-medium text-primary">
                      {assignment.teacher_name || assignment.teacher_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("assignments.student")}:
                    </span>
                    <span className="font-medium text-primary">
                      {assignment.student_name || assignment.student_id}
                    </span>
                  </div>
                </div>

                {/* Action buttons for teacher */}
                {canEdit && (
                  <div className="pt-3 border-t border-border space-y-2">
                    {assignment.status === "scheduled" && (
                      <button
                        onClick={() => handleUpdateStatus("in_progress")}
                        className="w-full btn-primary py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        {t("assignments.startSession")}
                      </button>
                    )}
                    {assignment.status === "in_progress" && (
                      <button
                        onClick={handleMarkComplete}
                        className="w-full py-2 rounded-lg text-sm flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t("assignments.markComplete")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Review Card */}
            {isCompleted && reviewLoaded && (
              <div className="bg-white border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t("reviews.title")}
                </h2>

                {review ? (
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-primary">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t("reviews.submitted")}
                    </p>
                  </div>
                ) : !isTeacher ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t("reviews.rateExperience")}
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 cursor-pointer transition-colors ${
                              star <= reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={t("reviews.commentPlaceholder")}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={reviewRating < 1 || reviewSubmitting}
                      className="w-full btn-primary py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {reviewSubmitting
                        ? t("reviews.submitting")
                        : t("reviews.submit")}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("reviews.noReviewYet")}
                  </p>
                )}
              </div>
            )}

            {/* Chat Card */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t("chat.title")}
              </h2>
              <div
                className="border border-border rounded-lg flex flex-col"
                style={{ height: 300 }}
              >
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-3 space-y-2"
                >
                  {chatMessages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t("chat.noMessages")}
                    </p>
                  )}
                  {chatMessages.map((msg) => {
                    const isMine = msg.sender_id === user?.user_id;
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMine ? "bg-primary text-white" : "bg-accent text-foreground"}`}
                        >
                          {!isMine && (
                            <p className="text-xs font-semibold mb-1">
                              {msg.sender_name}
                            </p>
                          )}
                          <p>{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-muted-foreground"}`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString(
                              isRTL ? "ar-SA" : "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-border p-2 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={t("chat.placeholder")}
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || chatSending}
                    className="btn-primary px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
