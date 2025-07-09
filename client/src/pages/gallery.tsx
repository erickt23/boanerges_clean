import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import { Eye, Upload, FolderPlus, Grid, List, Image, Video, Tag, Trash2, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useRoleProtection } from "@/hooks/use-role-protection";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PhotoAlbum {
  id: number;
  title: string;
  description?: string;
  eventId?: number;
  createdBy: number;
  createdAt: string;
}

interface Photo {
  id: number;
  albumId: number;
  name: string;
  filename: string;
  originalName: string;
  caption?: string;
  mediaType: "photo" | "video";
  fileSize?: number;
  duration?: number;
  tags?: string[];
  uploadedBy: number;
  uploadedAt: string;
}

interface Event {
  id: number;
  title: string;
  type: string;
  startDate: string;
}

const albumSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  eventId: z.number().optional(),
});

const photoSchema = z.object({
  albumId: z.number().min(1, "L'album est requis"),
  name: z.string().min(1, "Le nom est requis"),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export default function Gallery() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { canAccess } = useRoleProtection();
  const queryClient = useQueryClient();
  
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
  const [uploadMediaOpen, setUploadMediaOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showMediaDetails, setShowMediaDetails] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Query: Albums
  const { data: albums = [], isLoading: albumsLoading } = useQuery<PhotoAlbum[]>({
    queryKey: ["/api/gallery/albums"]
  });

  // Query: Events for album creation
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"]
  });

  // Query: Photos
  const { data: photos = [], isLoading: photosLoading, error: photosError } = useQuery<Photo[]>({
    queryKey: ["/api/gallery/photos", selectedAlbum],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedAlbum) params.append("albumId", selectedAlbum.toString());
      const response = await fetch(`/api/gallery/photos?${params.toString()}`);
      if (!response.ok) {
        console.error("Failed to fetch photos: ", response.status, response.statusText);
        throw new Error('Failed to fetch photos');
      }
      return response.json();
    }
  });

  // Query: All photos to get available tags
  const { data: allPhotos = [], error: allPhotosError } = useQuery<Photo[]>({
    queryKey: ["/api/gallery/photos/all"],
    queryFn: async () => {
      const response = await fetch("/api/gallery/photos");
      if (!response.ok) {
        console.error("Failed to fetch all photos: ", response.status, response.statusText);
        throw new Error('Failed to fetch photos');
      }
      return response.json();
    }
  });

  console.log("Auth User:", user);
  console.log("Photos Error:", photosError);
  console.log("All Photos Error:", allPhotosError);

  // Get unique tags from all photos
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    allPhotos.forEach(photo => {
      if (photo.tags) {
        photo.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [allPhotos]);

  // Filter photos by selected tags
  const filteredPhotos = React.useMemo(() => {
    if (selectedTags.length === 0) return photos;
    return photos.filter(photo => 
      photo.tags && photo.tags.length > 0 && selectedTags.some(tag => photo.tags!.includes(tag))
    );
  }, [photos, selectedTags]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Create Album Mutation
  const createAlbumMutation = useMutation({
    mutationFn: (data: z.infer<typeof albumSchema>) => 
      apiRequest("POST", "/api/gallery/albums", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/albums"] });
      setCreateAlbumOpen(false);
      toast({
        title: t("success"),
        description: "Album créé avec succès",
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Erreur lors de la création de l'album",
        variant: "destructive",
      });
    }
  });

  // Upload Media Mutation
  const uploadMediaMutation = useMutation({
    mutationFn: (formData: FormData) => 
      fetch("/api/gallery/photos", {
        method: "POST",
        body: formData,
        credentials: "include"
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/photos"] });
      setUploadMediaOpen(false);
      toast({
        title: t("success"),
        description: "Média ajouté avec succès",
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Erreur lors de l'ajout du média",
        variant: "destructive",
      });
    }
  });

  // Delete Photo Mutation
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: number) => 
      apiRequest("DELETE", `/api/gallery/photos/${photoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/photos"] });
      toast({
        title: t("success"),
        description: "Média supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Erreur lors de la suppression du média",
        variant: "destructive",
      });
    }
  });

  const albumForm = useForm<z.infer<typeof albumSchema>>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const photoForm = useForm<z.infer<typeof photoSchema>>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      albumId: selectedAlbum || 0,
      caption: "",
      tags: [],
    },
  });

  const onCreateAlbum = (data: z.infer<typeof albumSchema>) => {
    createAlbumMutation.mutate(data);
  };

  const onUploadMedia = (data: z.infer<typeof photoSchema>) => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast({
        title: t("error"),
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('albumId', data.albumId.toString());
    formData.append('name', data.name);
    formData.append('caption', data.caption || '');
    formData.append('tags', JSON.stringify(data.tags || []));
    
    uploadMediaMutation.mutate(formData);
  };

  // Reset photo form when dialog opens
  const handleUploadDialogOpen = (open: boolean) => {
    setUploadMediaOpen(open);
    if (open) {
      photoForm.reset({
        albumId: selectedAlbum || 0,
        caption: "",
        tags: [],
      });
    }
  };

  const handlePhotoDetailOpen = (photo: Photo | null) => {
    setSelectedPhoto(photo);
    setShowMediaDetails(false); // Always hide details when opening a new photo
  };

  const handleDeletePhoto = (photoId: number) => {
    deletePhotoMutation.mutate(photoId);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!canAccess("gallery")) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Header title={t("gallery")} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions nécessaires pour accéder à cette section.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header title={t("gallery")} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  title={t("gridView")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  title={t("listView")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={createAlbumOpen} onOpenChange={setCreateAlbumOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    {t("createAlbum")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("createAlbum")}</DialogTitle>
                  </DialogHeader>
                  <Form {...albumForm}>
                    <form onSubmit={albumForm.handleSubmit(onCreateAlbum)} className="space-y-4">
                      <FormField
                        control={albumForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("albumTitle")}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t("albumTitle")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={albumForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder={t("albumDescription")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={albumForm.control}
                        name="eventId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Événement associé (optionnel)</FormLabel>
                            <FormControl>
                              <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("selectEvent")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {events.map((event) => (
                                    <SelectItem key={event.id} value={event.id.toString()}>
                                      {event.title} - {(() => {
                                        try {
                                          return event.startDate ? format(new Date(event.startDate), "dd/MM/yyyy", { locale: fr }) : 'Date non disponible';
                                        } catch (error) {
                                          return event.startDate || 'Date invalide';
                                        }
                                      })()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setCreateAlbumOpen(false)}>
                          Annuler
                        </Button>
                        <Button type="submit" disabled={createAlbumMutation.isPending}>
                          {createAlbumMutation.isPending ? "Création..." : "Créer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {albums.length > 0 && (
                <Dialog open={uploadMediaOpen} onOpenChange={handleUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      {t("addMedia")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('addMedia')}</DialogTitle>
                    </DialogHeader>
                    <Form {...photoForm}>
                      <form onSubmit={photoForm.handleSubmit(onUploadMedia)} className="space-y-4">
                        <FormField
                          control={photoForm.control}
                          name="albumId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Album</FormLabel>
                              <FormControl>
                                <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('selectAlbum')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {albums.map((album) => (
                                      <SelectItem key={album.id} value={album.id.toString()}>
                                        {album.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={photoForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('mediaName')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('mediaNamePlaceholder')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormItem>
                          <FormLabel>{t('fileSelect')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="file"
                              accept="image/*,video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                // File handling is done during form submission
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                        <FormField
                          control={photoForm.control}
                          name="caption"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('legendOption')}</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder={t("mediaDescription")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormItem>
                          <FormLabel>{t('tagOption')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t("tagHint")}
                              onChange={(e) => {
                                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                photoForm.setValue("tags", tags);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => handleUploadDialogOpen(false)}>
                            {t("cancel")}
                          </Button>
                          <Button type="submit" disabled={uploadMediaMutation.isPending}>
                            {/* {t('{uploadMediaMutation.isPending ? "Ajout..." : "Ajouter"}')} */}
                            {t('add')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Albums Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("albums")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      <Button
                        variant={selectedAlbum === null ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedAlbum(null)}
                      >
                        {t("allMedia")}
                      </Button>
                      {albums.map((album) => (
                        <Button
                          key={album.id}
                          variant={selectedAlbum === album.id ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedAlbum(album.id)}
                        >
                          {album.title}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Media Gallery */}
            <div className="lg:col-span-3">
              {albumsLoading || photosLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : albums.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Aucun album disponible. Créez votre premier album pour commencer.
                    </p>
                    <Button onClick={() => setCreateAlbumOpen(true)}>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Créer un album
                    </Button>
                  </CardContent>
                </Card>
              ) : (photos?.length || 0) === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {selectedAlbum ? t("noMediaInAlbum") : t("selectAlbumToView")}
                    </p>
                    {albums.length > 0 && (
                      <Button onClick={() => setUploadMediaOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter un média
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Tag Filter Section */}
                  {availableTags.length > 0 && (
                    <Card className="mb-6">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4" />
                            <span className="text-sm font-medium">{t('filterByTags')}</span>
                          </div>
                          {selectedTags.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={clearTagFilters}
                              className="text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Effacer ({selectedTags.length})
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map(tag => (
                            <Badge
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "secondary"}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => toggleTag(tag)}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {selectedTags.length > 0 && (
                          <div className="mt-3 text-sm text-muted-foreground">
                            {filteredPhotos.length} média(s) trouvé(s) avec {selectedTags.length === 1 ? 'le tag' : 'les tags'}: {selectedTags.join(', ')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                  {filteredPhotos?.map((photo: Photo) => (
                    <Card key={photo.id} className="group cursor-pointer" onClick={() => handlePhotoDetailOpen(photo)}>
                      <CardContent className="p-4">
                        <div className="relative">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                            {photo.mediaType === "video" ? (
                              <video 
                                src={`/uploads/gallery/${photo.filename}`}
                                className="w-full h-full object-cover rounded-lg"
                                muted
                                onError={(e) => {
                                  const target = e.target as HTMLVideoElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <img 
                                src={`/uploads/gallery/${photo.filename}`}
                                alt={photo.originalName}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            )}
                            {/* Fallback icon display (hidden by default) */}
                            <div className="hidden flex-col items-center justify-center w-full h-full">
                              {photo.mediaType === "video" ? (
                                <>
                                  <Video className="h-12 w-12 text-muted-foreground mb-2" />
                                  <span className="text-xs text-muted-foreground font-medium">{t("video").toUpperCase()}</span>
                                </>
                              ) : (
                                <>
                                  <Image className="h-12 w-12 text-muted-foreground mb-2" />
                                  <span className="text-xs text-muted-foreground font-medium">{t("photo").toUpperCase()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-center mt-2 w-full">
                            <p className="truncate text-foreground font-medium">{photo.name}</p>
                            {photo.fileSize && (
                              <p className="text-muted-foreground mt-1">{formatFileSize(photo.fileSize)}</p>
                            )}
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="secondary" onClick={() => setSelectedPhoto(photo)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              {canAccess("gallery", "delete") && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer le média</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer ce média ? Cette action ne peut pas être annulée.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeletePhoto(photo.id)}>
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium truncate">{photo.name}</h3>
                          {photo.caption && (
                            <p className="text-sm text-muted-foreground truncate">{photo.caption}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center">
                              {photo.mediaType === "video" ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <Image className="h-3 w-3 mr-1" />
                              )}
                              {photo.mediaType}
                            </span>
                            <span>
                              {photo.fileSize && formatFileSize(photo.fileSize)}
                              {photo.duration && ` • ${formatDuration(photo.duration)}`}
                            </span>
                          </div>
                          {photo.tags && photo.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {photo.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {photo.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{photo.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Media Detail Dialog */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={(open) => {
          if (!open) setSelectedPhoto(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.name}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex flex-col items-center">
              <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {selectedPhoto.mediaType === "video" ? (
                  <video 
                    src={`/uploads/gallery/${selectedPhoto.filename}`}
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={`/uploads/gallery/${selectedPhoto.filename}`}
                    alt={selectedPhoto.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <Button 
                variant="outline" 
                className="mb-4" 
                onClick={() => setShowMediaDetails(!showMediaDetails)}
              >
                {showMediaDetails ? t('hideDetails') : t('showDetails')}
              </Button>
              {showMediaDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">{t('mediaDetailsTitle')}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="capitalize">{selectedPhoto.mediaType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('mediaName')}:</span>
                          <span>{selectedPhoto.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('originalFileName')}:</span>
                          <span>{selectedPhoto.originalName}</span>
                        </div>
                        {selectedPhoto.fileSize && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taille:</span>
                            <span>{formatFileSize(selectedPhoto.fileSize)}</span>
                          </div>
                        )}
                        {selectedPhoto.duration && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Durée:</span>
                            <span>{formatDuration(selectedPhoto.duration)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ajouté le:</span>
                          <span>{format(new Date(selectedPhoto.uploadedAt), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                    {selectedPhoto.caption && (
                      <div>
                        <h4 className="font-medium mb-2">Légende</h4>
                        <p className="text-sm text-muted-foreground">{selectedPhoto.caption}</p>
                      </div>
                    )}
                    {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPhoto.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}