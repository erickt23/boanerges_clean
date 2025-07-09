import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  ChevronRight
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
  isPinned: boolean;
  viewCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("");

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

  // Fetch forum topics
  const { data: allTopics = [] } = useQuery({
    queryKey: ["/api/forum/topics", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/forum/topics?categoryId=${selectedCategory}`
        : "/api/forum/topics";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json();
    },
  });

  // Fetch recent topics
  const { data: recentTopics = [] } = useQuery({
    queryKey: ["/api/forum/topics/recent"],
    queryFn: async () => {
      const res = await fetch("/api/forum/topics/recent?limit=5");
      if (!res.ok) throw new Error("Failed to fetch recent topics");
      return res.json();
    },
  });

  // Filter topics based on search term and archive status
  const filteredTopics = allTopics.filter((topic: ForumTopic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTopics = filteredTopics.filter((topic: ForumTopic) => !topic.isArchived);
  const archivedTopics = filteredTopics.filter((topic: ForumTopic) => topic.isArchived);

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      return apiRequest("/api/forum/topics", "POST", topicData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics/recent"] });
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
      console.error("Topic creation error:", error);
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
      return apiRequest(`/api/forum/topics/${topicId}/visibility`, "PATCH", { isHidden });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
    },
  });

  // Toggle topic archive mutation
  const toggleArchiveMutation = useMutation({
    mutationFn: async ({ topicId, isArchived }: { topicId: number; isArchived: boolean }) => {
      return apiRequest(`/api/forum/topics/${topicId}/archive`, "PATCH", { isArchived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
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

  const renderTopicCard = (topic: ForumTopic) => (
    <Card key={topic.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {topic.isPinned && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Pinned
                </Badge>
              )}
              {topic.isArchived && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <Archive className="w-3 h-3 mr-1" />
                  {t("archived")}
                </Badge>
              )}
              {topic.isHidden && isAdmin && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {t("hidden")}
                </Badge>
              )}
              <Badge variant="outline">{getCategoryName(topic.categoryId)}</Badge>
            </div>
            <CardTitle className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
              {topic.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {topic.content}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toggleVisibilityMutation.mutate({
                    topicId: topic.id,
                    isHidden: !topic.isHidden,
                  })
                }
              >
                {topic.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toggleArchiveMutation.mutate({
                    topicId: topic.id,
                    isArchived: !topic.isArchived,
                  })
                }
              >
                {topic.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{topic.viewCount} {t("views")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(topic.lastActivityAt)}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4" />
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
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background p-4 lg:p-8">
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
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("communityForum")}</h1>
            <p className="text-gray-600">{t("engageWithCommunityMembers")}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("selectCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("categories")}</SelectItem>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("createNewTopic")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("category")}</label>
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
                <label className="text-sm font-medium">{t("topicTitle")}</label>
                <Input
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder={t("enterTopicTitle")}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("content")}</label>
                <Textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder={t("describeQuestion")}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateTopicOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button 
                  onClick={handleCreateTopic}
                  disabled={!newTopicTitle.trim() || !newTopicContent.trim() || !newTopicCategory}
                >
                  {t("createTopic")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Recent Topics Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("recentTopics")}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTopics.length > 0 ? (
                <div className="space-y-3">
                  {recentTopics.map((topic: ForumTopic) => (
                    <div key={topic.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{topic.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{getCategoryName(topic.categoryId)}</span>
                        <span>{formatDate(topic.lastActivityAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">{t("noRecentTopics")}</p>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">{t("categories")}</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category: ForumCategory) => (
                    <div
                      key={category.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCategory === category.id 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                    >
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      {category.description && (
                        <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">{t("noCategories")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {/* Active Topics */}
          {activeTopics.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{t("topics")}</h2>
              {activeTopics.map(renderTopicCard)}
            </div>
          )}

          {/* Archived Topics */}
          {archivedTopics.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-orange-600">{t("archivedTopics")}</h2>
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
        </main>
      </div>
    </div>
  );
}