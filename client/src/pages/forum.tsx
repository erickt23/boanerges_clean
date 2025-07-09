import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Plus,
  Eye,
  EyeOff,
  Archive,
  ArchiveRestore,
  Users,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Edit,
  Settings,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";

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

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
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

export default function Forum() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("");
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<ForumCategory | null>(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Fetch forum categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/forum/categories"],
    queryFn: async () => {
      const res = await fetch("/api/forum/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch all topics with optional category filter
  const { data: allTopics = [] } = useQuery({
    queryKey: ["/api/forum/topics", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory ? `?categoryId=${selectedCategory}` : "";
      const res = await fetch(`/api/forum/topics${params}`);
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json();
    },
  });

  // Collect all unique user IDs from topics
  const allUserIds = useMemo(() => {
    const ids = new Set<number>();
    allTopics.forEach((topic: any) => ids.add(topic.authorId));
    return Array.from(ids);
  }, [allTopics]);

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



  // Filter topics based on search term and archive status
  const filteredTopics = allTopics.filter((topic: ForumTopic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort topics by creation date (latest first)
  const sortedTopics = [...filteredTopics].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activeTopics = sortedTopics.filter((topic: ForumTopic) => !topic.isArchived);
  const archivedTopics = sortedTopics.filter((topic: ForumTopic) => topic.isArchived);

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      return apiRequest("POST", "/api/forum/topics", topicData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      setIsCreateTopicOpen(false);
      setNewTopicTitle("");
      setNewTopicContent("");
      setNewTopicCategory("");
      toast({
        title: t("success"),
        description: t("topicCreatedSuccessfully"),
      });
    },
    onError: (error) => {
      //console.error("Topic creation error:", error);
      toast({
        title: t("error"),
        description: t("failedToCreateTopic"),
        variant: "destructive",
      });
    },
  });

  // Toggle topic visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ topicId, isHidden }: { topicId: number; isHidden: boolean }) => {
      return apiRequest("PATCH", `/api/forum/topics/${topicId}/visibility`, { isHidden });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
    },
  });

  // Toggle topic archive mutation
  const toggleArchiveMutation = useMutation({
    mutationFn: async ({ topicId, isArchived }: { topicId: number; isArchived: boolean }) => {
      return apiRequest("PATCH", `/api/forum/topics/${topicId}/archive`, { isArchived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
    },
  });

  // Edit category mutation
  const editCategoryMutation = useMutation({
    mutationFn: async (categoryData: { id: number; name: string; description: string }) => {
      return apiRequest("PATCH", `/api/forum/categories/${categoryData.id}`, {
        name: categoryData.name,
        description: categoryData.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      setEditCategoryName("");
      setEditCategoryDescription("");
      toast({
        title: t("success"),
        description: t("categoryUpdatedSuccessfully"),
      });
    },
    onError: (error) => {
      //console.error("Category edit error:", error);
      toast({
        title: t("error"),
        description: t("failedToUpdateCategory"),
        variant: "destructive",
      });
    },
  });

  // Track view count mutation
  const trackViewMutation = useMutation({
    mutationFn: async (topicId: number) => {
      return apiRequest("POST", `/api/forum/topics/${topicId}/view`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description: string }) => {
      return apiRequest("POST", "/api/forum/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      setIsCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      toast({
        title: t("success"),
        description: t("categoryCreatedSuccessfully"),
      });
    },
    onError: (error) => {
      //console.error("Category create error:", error);
      toast({
        title: t("error"),
        description: t("failedToCreateCategory"),
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return apiRequest("DELETE", `/api/forum/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      setDeletingCategory(null);
      toast({
        title: t("success"),
        description: t("categoryDeletedSuccessfully"),
      });
    },
    onError: (error) => {
      //console.error("Category delete error:", error);
      toast({
        title: t("error"),
        description: t("failedToDeleteCategory"),
        variant: "destructive",
      });
    },
  });

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !newTopicCategory) return;

    createTopicMutation.mutate({
      title: newTopicTitle,
      content: newTopicContent,
      categoryId: parseInt(newTopicCategory),
    });
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

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat: ForumCategory) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  };

  // Fetch all topics for counting purposes
  const { data: allTopicsForCounting = [] } = useQuery({
    queryKey: ["/api/forum/topics", "all"],
    queryFn: async () => {
      const res = await fetch("/api/forum/topics");
      if (!res.ok) throw new Error("Failed to fetch all topics");
      return res.json();
    },
  });

  const getTopicCountForCategory = (categoryId: number) => {
    return allTopicsForCounting.filter((topic: ForumTopic) => 
      topic.categoryId === categoryId && !topic.isHidden
    ).length;
  };

  const handleEditCategory = (category: ForumCategory) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description);
    setIsEditCategoryOpen(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    editCategoryMutation.mutate({
      id: editingCategory.id,
      name: editCategoryName,
      description: editCategoryDescription,
    });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    createCategoryMutation.mutate({
      name: newCategoryName,
      description: newCategoryDescription,
    });
  };

  const handleTopicClick = (topicId: number) => {
    // Track view count when topic is clicked
    trackViewMutation.mutate(topicId);
    // Navigate to topic detail page using React Router
    setLocation(`/topic/${topicId}`);
  };

  const handleDeleteCategory = (category: ForumCategory) => {
    setDeletingCategory(category);
  };

  const confirmDeleteCategory = () => {
    if (!deletingCategory) return;
    deleteCategoryMutation.mutate(deletingCategory.id);
  };

  const renderTopicCard = (topic: ForumTopic) => (
    <Card 
      key={topic.id} 
      className="mb-3 sm:mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleTopicClick(topic.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
              {topic.isSticky && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                  📌 Pinned
                </Badge>
              )}
              {topic.isArchived && (
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  {t("archived")}
                </Badge>
              )}
              {topic.isHidden && isAdmin && (
                <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                  {t("hidden")}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">{getCategoryName(topic.categoryId)}</Badge>
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold hover:text-blue-600 cursor-pointer break-words">
              {topic.title}
            </CardTitle>
            <p className="text-sm text-foreground/80 mt-2 line-clamp-2 break-words">
              {topic.content}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibilityMutation.mutate({
                    topicId: topic.id,
                    isHidden: !topic.isHidden,
                  });
                }}
                className="h-8 w-8 p-0"
              >
                {topic.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleArchiveMutation.mutate({
                    topicId: topic.id,
                    isArchived: !topic.isArchived,
                  });
                }}
                className="h-8 w-8 p-0"
              >
                {topic.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-muted-foreground gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-foreground font-medium">{getUserDisplayName(topic.authorId)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{topic.viewCount || 0} {t("views")}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{topic.replyCount || 0} {t("replies")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="truncate">{formatDate(topic.createdAt)}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header title={t("communityForum")} />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background p-2 sm:p-4 lg:p-8">
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">{t("restrictedAccess")}</h3>
                <p className="text-gray-600">{t("forumRestrictedMessage")}</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={t("communityForum")} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background p-2 sm:p-4 lg:p-8">

          {/* Controls */}
          <div className="flex flex-col space-y-3 mb-6 sm:flex-row sm:space-y-0 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory?.toString() || "all"}
              onValueChange={(value) => setSelectedCategory(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((category: ForumCategory) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateTopicOpen} onOpenChange={setIsCreateTopicOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("createTopic")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t("createNewTopic")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("title")}</label>
                    <Input
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder={t("enterTopicTitle")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("category")}</label>
                    <Select value={newTopicCategory} onValueChange={setNewTopicCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: ForumCategory) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("content")}</label>
                    <Textarea
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder={t("shareYourThoughts")}
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateTopicOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button 
                      onClick={handleCreateTopic}
                      disabled={!newTopicTitle.trim() || !newTopicContent.trim() || !newTopicCategory || createTopicMutation.isPending}
                    >
                      {createTopicMutation.isPending ? t("creating") : t("createTopic")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col space-y-4 xl:grid xl:grid-cols-4 xl:gap-6 xl:space-y-0">
            {/* Categories Sidebar */}
            <div className="order-2 xl:order-1 xl:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <CardTitle className="text-base sm:text-lg">{t("categories")}</CardTitle>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCreateCategoryOpen(true)}
                        className="text-xs w-full h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t("createCategory")}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {categories.length > 0 ? (
                    <div className="space-y-2">
                      {categories.map((category: ForumCategory) => (
                        <div
                          key={category.id}
                          className={`p-2 sm:p-3 rounded-lg transition-colors ${
                            selectedCategory === category.id 
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" 
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(
                              selectedCategory === category.id ? null : category.id
                            )}
                          >
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-foreground">
                                {category.name} ({getTopicCountForCategory(category.id)})
                              </h4>
                              {isAdmin && (
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditCategory(category);
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCategory(category);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">{t("noCategoriesAvailable")}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-3 order-1 xl:order-2">
              {/* Active Topics */}
              {activeTopics.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">{t("topics")}</h2>
                  {activeTopics.map(renderTopicCard)}
                </div>
              )}

              {/* Archived Topics */}
              {archivedTopics.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-orange-600">{t("archivedTopics")}</h2>
                  {archivedTopics.map(renderTopicCard)}
                </div>
              )}

              {/* No Topics */}
              {activeTopics.length === 0 && archivedTopics.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">{t("noTopics")}</h3>
                    <p className="text-gray-600 mb-4">{t("shareIdeasWithCommunity")}</p>
                    <Button onClick={() => setIsCreateTopicOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("createTopic")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Edit Category Dialog */}
          <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("editCategory")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("categoryName")}</label>
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder={t("enterCategoryName")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("categoryDescription")}</label>
                  <Textarea
                    value={editCategoryDescription}
                    onChange={(e) => setEditCategoryDescription(e.target.value)}
                    placeholder={t("enterCategoryDescription")}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button 
                    onClick={handleSaveCategory}
                    disabled={!editCategoryName.trim() || editCategoryMutation.isPending}
                  >
                    {editCategoryMutation.isPending ? t("updating") : t("save")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Category Dialog */}
          <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("createCategory")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">{t("categoryName")}</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("enterCategoryName")}
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">{t("categoryDescription")}</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder={t("enterCategoryDescription")}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button 
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                  >
                    {createCategoryMutation.isPending ? t("creating") : t("createCategory")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Category Confirmation Dialog */}
          <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteCategoryConfirmation")}</DialogTitle>
                <DialogDescription>
                  {t("deleteCategoryWarning")} "{deletingCategory?.name}"
                  <br />
                  <br />
                  {t("deleteCategoryExplanation")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingCategory(null)}>
                  {t("cancel")}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmDeleteCategory}
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? t("deleting") : t("delete")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}