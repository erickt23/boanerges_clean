import React, { useState, useMemo } from "react";
import { useParams, useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Archive, Eye, EyeOff, Calendar, User, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { insertForumReplySchema, type InsertForumReply } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

interface ForumTopic {
  id: number;
  categoryId: number;
  title: string;
  content: string;
  authorId: number;
  isHidden: boolean;
  isArchived: boolean;
  isSticky: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: string | null;
  lastReplyBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ForumReply {
  id: number;
  topicId: number;
  content: string;
  authorId: number;
  isHidden: boolean;
  parentReplyId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function TopicDetail() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { language, t } = useTranslation();
  const { toast } = useToast();
  const [newReplyContent, setNewReplyContent] = useState("");

  // Extract topic ID from URL path
  const pathParts = location.split('/');
  const topicId = parseInt(pathParts[pathParts.length - 1] || "0");
  
  // Extract topic ID from URL path
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // Fetch topic details
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery<ForumTopic>({
    queryKey: [`/api/forum/topics/${topicId}`],
    enabled: !!topicId,
  });

  // Fetch topic replies
  const { data: replies = [], isLoading: repliesLoading } = useQuery<ForumReply[]>({
    queryKey: [`/api/forum/topics/${topicId}/replies`],
    enabled: !!topicId,
  });

  // Collect all unique user IDs from topic and replies
  const allUserIds = useMemo(() => {
    const ids = new Set<number>();
    if (topic) ids.add(topic.authorId);
    replies.forEach(reply => ids.add(reply.authorId));
    return Array.from(ids);
  }, [topic, replies]);

  // Fetch user names for all users
  const { data: userNames = {}, isLoading: userNamesLoading } = useQuery({
    queryKey: ["/api/forum/user-names", allUserIds.join(",")],
    queryFn: async () => {
      if (allUserIds.length === 0) return {};
      const response = await fetch("/api/forum/user-names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: allUserIds }),
      });
      if (!response.ok) throw new Error("Failed to fetch user names");
      return response.json();
    },
    enabled: allUserIds.length > 0,
  });

  // Helper function to get user display name
  const getUserDisplayName = (authorId: number) => {
    if (userNamesLoading) return t("loading");
    return (userNames as any)[authorId] || `Utilisateur #${authorId}`;
  };

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (replyData: { content: string }) => {
      return apiRequest("POST", `/api/forum/topics/${topicId}/replies`, {
        content: replyData.content,
        authorId: user!.id,
        topicId: topicId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", topicId, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", topicId] });
      setNewReplyContent("");
      toast({
        title: t("success"),
        description: t("replyCreatedSuccessfully"),
      });
    },
    onError: (error) => {
      console.error("Reply creation error:", error);
      toast({
        title: t("error"),
        description: t("failedToCreateReply"),
        variant: "destructive",
      });
    },
  });

  // Toggle reply visibility mutation
  const toggleReplyVisibilityMutation = useMutation({
    mutationFn: async ({ replyId, isHidden }: { replyId: number; isHidden: boolean }) => {
      return apiRequest("PATCH", `/api/forum/replies/${replyId}/visibility`, { isHidden });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/topics/${topicId}/replies`] });
    },
  });

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: number) => {
      return apiRequest("DELETE", `/api/forum/replies/${replyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/topics/${topicId}/replies`] });
      toast({
        title: t("success"),
        description: t("replyDeleted"),
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("failedToDeleteReply"),
        variant: "destructive",
      });
    },
  });

  // Delete topic mutation
  const deleteTopicMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/forum/topics/${topicId}`);
    },
    onSuccess: () => {
      toast({
        title: t("success"),
        description: t("topicDeleted"),
      });
      setLocation("/forum");
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("failedToDeleteTopic"),
        variant: "destructive",
      });
    },
  });

  // Toggle topic visibility mutation
  const toggleTopicVisibilityMutation = useMutation({
    mutationFn: async ({ topicId, isHidden }: { topicId: number; isHidden: boolean }) => {
      return apiRequest("PATCH", `/api/forum/topics/${topicId}/visibility`, { isHidden });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/topics/${topicId}`] });
      toast({
        title: t("success"),
        description: t("topicVisibilityUpdated"),
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("failedToUpdateTopicVisibility"),
        variant: "destructive",
      });
    },
  });

  // Toggle topic archive mutation
  const toggleTopicArchiveMutation = useMutation({
    mutationFn: async ({ topicId, isArchived }: { topicId: number; isArchived: boolean }) => {
      return apiRequest("PATCH", `/api/forum/topics/${topicId}/archive`, { isArchived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forum/topics/${topicId}`] });
      toast({
        title: t("success"),
        description: t("topicArchiveStatusUpdated"),
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("failedToUpdateTopicArchiveStatus"),
        variant: "destructive",
      });
    },
  });

  const handleCreateReply = () => {
    if (!newReplyContent.trim()) return;
    createReplyMutation.mutate({ content: newReplyContent });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: language === "fr" ? fr : enUS,
      });
    } catch {
      return dateString;
    }
  };

  if (topicLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title={t("forum")} />
          <main className="flex-1 p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{t("loading")}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title={t("forum")} />
          <main className="flex-1 p-6">
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300">{t("topicNotFound")}</p>
              {topicError && (
                <p className="text-red-600 mt-2">Error: {topicError.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Topic ID: {topicId}</p>
              <Button
                variant="outline"
                onClick={() => setLocation("/forum")}
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToForum")}
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={topic?.title || t("forum")} />
        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-none lg:max-w-4xl lg:mx-auto px-2 py-4 lg:p-6">
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => setLocation("/forum")}
              className="mb-4 text-sm w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToForum")}
            </Button>

            {/* Topic header */}
            <Card className="mb-4 w-full">
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-3">
                  <div className="w-full">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                      {topic.isSticky && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {t("pinned")}
                        </Badge>
                      )}
                      {topic.isArchived && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400">
                          <Archive className="w-3 h-3 mr-1" />
                          {t("archived")}
                        </Badge>
                      )}
                      {topic.isHidden && isAdmin && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400">
                          {t("hidden")}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 break-words leading-tight">
                      {topic.title}
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">{getUserDisplayName(topic.authorId)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(topic.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{topic.viewCount} {t("views")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{topic.content}</p>
                </div>
                
                {/* Admin controls for topic */}
                {isAdmin && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toggleTopicVisibilityMutation.mutate({
                          topicId: topic.id,
                          isHidden: !topic.isHidden,
                        });
                      }}
                      className="h-8 px-3"
                    >
                      {topic.isHidden ? (
                        <Eye className="w-4 h-4 mr-1" />
                      ) : (
                        <EyeOff className="w-4 h-4 mr-1" />
                      )}
                      {topic.isHidden ? t("show") : t("hide")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toggleTopicArchiveMutation.mutate({
                          topicId: topic.id,
                          isArchived: !topic.isArchived,
                        });
                      }}
                      className="h-8 px-3"
                    >
                      {topic.isArchived ? (
                        <Archive className="w-4 h-4 mr-1" />
                      ) : (
                        <Archive className="w-4 h-4 mr-1" />
                      )}
                      {topic.isArchived ? t("unarchive") : t("archive")}
                    </Button>
                    {topic.isArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(t("confirmDeleteTopic"))) {
                            deleteTopicMutation.mutate();
                          }
                        }}
                        className="h-8 px-3 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {t("delete")}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Replies section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">
                  {t("replies")} ({replies.length})
                </h3>
              </div>

              {repliesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <>
                  {replies.map((reply: ForumReply) => (
                    <Card key={reply.id} className={reply.isHidden && !isAdmin ? "hidden" : ""}>
                      <CardHeader className="p-3 sm:p-4 lg:p-6 pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{getUserDisplayName(reply.authorId)}</span>
                            <span>•</span>
                            <span>{formatDate(reply.createdAt)}</span>
                            {reply.isHidden && isAdmin && (
                              <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 ml-2">
                                {t("hidden")}
                              </Badge>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReplyVisibilityMutation.mutate({
                                    replyId: reply.id,
                                    isHidden: !reply.isHidden,
                                  });
                                }}
                                className="h-8 w-8 p-0"
                              >
                                {reply.isHidden ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(t("confirmDeleteReply"))) {
                                    deleteReplyMutation.mutate(reply.id);
                                  }
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 pt-1">
                        <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{reply.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* Reply form */}
              {user && !topic.isArchived && (
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">{t("addReply")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-4">
                      <Textarea
                        placeholder={t("writeYourReply")}
                        value={newReplyContent}
                        onChange={(e) => setNewReplyContent(e.target.value)}
                        rows={4}
                        disabled={createReplyMutation.isPending}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleCreateReply}
                          disabled={!newReplyContent.trim() || createReplyMutation.isPending}
                        >
                          {createReplyMutation.isPending ? t("posting") : t("postReply")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {topic.isArchived && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                      <Archive className="w-5 h-5" />
                      <span>{t("topicArchived")}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!user && (
                <Card className="border-gray-200 bg-gray-50 dark:bg-gray-800">
                  <CardContent className="py-4 text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      {t("loginToReply")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}