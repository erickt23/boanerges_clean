import { useState, useEffect } from "react";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Church,
  Heart,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  BookOpen,
  Music,
  HandHeart,
  Globe,
  Languages,
  Download,
  ChevronLeft,
  ChevronRight,
  Star,
  UserCheck,
  GraduationCap,
  Shield,
  Baby,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Landing() {
  const { user, isLoading } = useAuth();
  const { t, language, changeLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if this is a public view request
  const urlParams = new URLSearchParams(window.location.search);
  const isPublicView = urlParams.get("public") === "true";

  // Fetch public events
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events/public"],
    queryFn: async () => {
      const res = await fetch("/api/events/public");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Church photos for carousel - using actual church images
  const churchPhotos = [
    {
      url: "./logo_hd.png",
      title: t("welcomeTitle"),
      subtitle: t("welcomeSubtitle"),
      isWelcome: true,
    },
    {
      url: "./exterieur.png",
      title: "Extérieur de l'église",
      subtitle: "Notre bâtiment au 906 rue King Ouest",
    },
    {
      url: "./service_culte.png",
      title: "Service de culte",
      subtitle: "Nos moments de louange et d'adoration",
    },
    {
      url: "./rassemblement_communautaire.png",
      title: "Rassemblement communautaire",
      subtitle: "La famille de Dieu réunie",
    },
    {
      url: "./ministere_jeunes.png",
      title: "Ministère des jeunes",
      subtitle: "La prochaine génération pour Christ",
    },
  ];

  // Pastors data
  const pastors = [
    {
      name: "Emmanuel KANKAJI",
      role: t("seniorPastor"),
      description:
        "Serviteur de Dieu, passionné par l'enseignement de la Parole et l'édification du peuple de Dieu.",
      photo: "./pasteur_emmanuel.jpg",
    },
    {
      name: "Michel KAYOMBO",
      role: t("associatePastor"),
      description:
        "Pasteur adjoint.",
      photo: "./pasteur_michel.jpg",
    },
    {
      name: "Augustin N.",
      role: t("evangelistRole"),
      description:
        "Administrateur",
      photo: "./afroman.png",
    },
    {
      name: "Esron N.",
      role: t("evangelistRole"),
      description:
        "Diacre",
      photo: "./afroman.png",
    },
    {
      name: "Messan ",
      role: t("evangelistRole"),
      description:
        "Secretaire",
      photo: "./afroman.png",
    },
  ];

  // Ministry departments
  const departments = [
    {
      name: t("Chorale Boanergès"),
      icon: Music,
      description: t("worshipDesc"),
      leader: "Nom à déterminer",
    },
    {
      name: t("evangelization"),
      icon: Globe,
      description: t("evangelizationDesc"),
      leader: "Nom à déterminer",
    },
    {
      name: "Intercession",
      icon: Shield,
      description:
        "Groupe de prière dédié à l'intercession pour l'église et les besoins de la communauté.",
      leader: "Nom à déterminer",
    },
    {
      name: "Département des Femmes",
      icon: Heart,
      description:
        "Accompagnement spirituel et social des femmes, formations et entraide communautaire.",
      leader: "Nom à déterminer",
    },
    {
      name: t("Département des Enfants"),
      icon: Users,
      description: t("youthDesc"),
      leader: "Nom à déterminer",
    },
    {
      name: t("Média"),
      icon: GraduationCap,
      description: t("sundaySchoolDesc"),
      leader: "Nom à déterminer",
    },
    {
      name: t("Protocole"),
      icon: GraduationCap,
      description: t("sundaySchoolDesc"),
      leader: "Nom à déterminer",
    },
    {
      name: t("Logistique"),
      icon: GraduationCap,
      description: t("sundaySchoolDesc"),
      leader: "Nom à déterminer",
    },
  ];

  // Generate ICS file for event
  const generateICS = (event: any) => {
    try {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date format for event:", event);
        return;
      }

      const formatDate = (date: Date) => {
        return date
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      };

      const icsContent = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Mission Évangélique Boanergès//Event//FR\r
BEGIN:VEVENT\r
UID:${event.id}@meb-sherbrooke.org\r
DTSTAMP:${formatDate(new Date())}\r
DTSTART:${formatDate(startDate)}\r
DTEND:${formatDate(endDate)}\r
SUMMARY:${event.title}\r
DESCRIPTION:${event.description || ""}\r
LOCATION:906 rue King Ouest, Sherbrooke, QC\r
ORGANIZER;CN=Mission Évangélique Boanergès:MAILTO:contact@meb-sherbrooke.org\r
END:VEVENT\r
END:VCALENDAR\r`;

      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Track download
      trackEventAction(event.id, "download");
    } catch (error) {
      console.error("Error generating ICS file:", error);
    }
  };

  // Track event interactions
  const trackEventAction = async (
    eventId: number,
    action: "interested" | "attending" | "download",
  ) => {
    try {
      await fetch("/api/events/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          action,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Error tracking event action:", error);
    }
  };

  // Navigate carousel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % churchPhotos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + churchPhotos.length) % churchPhotos.length,
    );
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % churchPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [churchPhotos.length]);

  const services = [
    {
      title: t("sundayWorship"),
      time: t("sundayWorshipTime"),
      description: t("sundayWorshipDesc"),
      icon: Church,
    },
    {
      title: t("prayerEvening"),
      time: t("prayerEveningTime"),
      description: t("prayerEveningDesc"),
      icon: Heart,
    },
    {
      title: t("bibleStudy"),
      time: t("bibleStudyTime"),
      description: t("bibleStudyDesc"),
      icon: BookOpen,
    },
    {
      title: t("choirReharsal"),
      time: t("choirReharsalTime"),
      description: t("choirReharsalDesc"),
      icon: BookOpen,
    },
  ];

  // Redirect to dashboard if already logged in, unless it's a public view
  if (user && !isLoading && !isPublicView) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header/Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                <Church className="h-8 w-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {t("missionEvangelique")}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t("boanerges")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={language} onValueChange={changeLanguage}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 FR</SelectItem>
                  <SelectItem value="en">🇺🇸 EN</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Users className="h-4 w-4 mr-2" />
                  {t("membersSpace")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Photo Carousel with Welcome */}
      <section className="relative">
        <div className="relative h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={churchPhotos[currentImageIndex].url}
              alt={churchPhotos[currentImageIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              {churchPhotos[currentImageIndex].isWelcome ? (
                <>
                  <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                    {churchPhotos[currentImageIndex].title}
                  </h1>
                  <p className="text-xl lg:text-2xl mb-8">
                    {churchPhotos[currentImageIndex].subtitle}
                  </p>
                  {/*}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <MapPin className="h-5 w-5 mr-2" />
                      {t("joinUs")}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-gray-900"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      {t("contactUs")}
                    </Button>
                  </div>
                  */}
                </>
              ) : (
                <>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    {churchPhotos[currentImageIndex].title}
                  </h2>
                  <p className="text-lg lg:text-xl">
                    {churchPhotos[currentImageIndex].subtitle}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-20"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-20"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {churchPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Public Events Calendar */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("upcomingEvents")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Rejoignez-nous pour nos prochains événements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event: any) => (
              <Card key={event.id} className="border-none shadow-lg flex flex-col min-h-[250px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="mb-2">
                      {event.startDate
                        ? (() => {
                            try {
                              const date = new Date(event.startDate);
                              if (isNaN(date.getTime()))
                                return t("dateToConfirm") || "Date à confirmer";
                              return date.toLocaleDateString(
                                language === "fr" ? "fr-FR" : "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              );
                            } catch (error) {
                              console.error("Date parsing error:", error);
                              return t("dateToConfirm") || "Date à confirmer";
                            }
                          })()
                        : t("dateToConfirm") || "Date à confirmer"}
                    </Badge>
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow justify-between">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {event.description}
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => generateICS(event)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("addToCalendar")}
                    </Button>
                    {/*}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => trackEventAction(event.id, "interested")}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {t("interested")}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => trackEventAction(event.id, "attending")}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {t("attending")}
                      </Button>
                    </div>
                    */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Heart className="h-6 w-6 text-red-500" />
                  <span>{t("ourMissionSection")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {t("missionDescription")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Globe className="h-6 w-6 text-blue-500" />
                  <span>{t("ourVisionSection")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {t("visionDescription")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services & Horaires */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("ourServices")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t("welcomeSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="border-none shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{service.title}</CardTitle>
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                      {service.time}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corps Pastoral */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("ourPastors")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t("meetOurTeam")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pastors.map((pastor, index) => {
              return (
                <Card key={index} className="border-none shadow-lg text-center">
                  <CardHeader>
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                      <img
                        src={pastor.photo}
                        alt={pastor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{pastor.name}</CardTitle>
                    <Badge variant="secondary" className="mx-auto">
                      {pastor.role}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{pastor.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ministry Departments */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("ourDepartments")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Découvrez nos différents départements et leurs responsables
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => {
              const Icon = dept.icon;
              const colors = [
                "bg-blue-100 text-blue-600",
                "bg-green-100 text-green-600",
                "bg-pink-100 text-pink-600",
                "bg-purple-100 text-purple-600",
                "bg-orange-100 text-orange-600",
                "bg-indigo-100 text-indigo-600",
              ];

              return (
                <Card key={index} className="border-none shadow-lg">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3 ${colors[index % colors.length]}`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-lg text-center text-gray-900 dark:text-gray-100">
                      {dept.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {dept.description}
                    </p>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        Responsable: {dept.leader}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Confession de Foi */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("confessionOfFaith")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t("confessionDesc")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>{t("biblicalFoundations")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement1")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement2")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement3")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement4")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement5")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement6")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>{t("spiritualLife")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement7")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement8")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement9")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement10")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement11")}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("faithStatement12")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg max-w-4xl mx-auto">
              <p className="text-blue-800 dark:text-blue-200 font-medium text-lg italic">
                {t("faithQuote")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Church className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-white">Mission Évangélique Boanergès</h3>
                </div>
              </div>
              <p className="text-gray-400">
                Une communauté de foi dédiée à l'amour du Christ et au service
                de notre prochain.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Liens Rapides</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#mission"
                    className="hover:text-white transition-colors"
                  >
                    Notre Mission
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-white transition-colors"
                  >
                    Nos Cultes
                  </a>
                </li>
                <li>
                  <a
                    href="#ministeres"
                    className="hover:text-white transition-colors"
                  >
                    Départements
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>906 rue King Ouest</li>
                <li>Sherbrooke, QC J1H 1S2 Canada </li>
                <li>+18199934420</li>
                <li>missioneva.boanerges@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>
              &copy; 2025 Mission Évangélique Boanergès. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
