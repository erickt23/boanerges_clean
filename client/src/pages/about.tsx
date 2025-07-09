import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n";
import { 
  Church, 
  Heart, 
  Users, 
  BookOpen, 
  Music, 
  Baby, 
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  Cross,
  HandHeart,
  Globe,
  Shield
} from "lucide-react";

export default function About() {
  const { t } = useTranslation();
  
  // Informations sur l'église
  const pastors = [
    {
      name: t('pastorEmmanuel'),
      role: t('pastorEmmanuelRole'),
      description: t('pastorEmmanuelDescription'),
      image: "/pasteur_emmanuel.jpg" // Specific image for Pastor Emmanuel
    },
    {
      name: t('pastorMichel'),
      role: t('pastorMichelRole'),
      description: t('pastorMichelDescription'),
      image: "/pasteur_michel.jpg" // Specific image for Pastor Michel
    },
    {
      name: t('deaconEsron'),
      role: t('deaconEsronRole'),
      description: t('deaconEsronDescription'),
      image: "/afroman.png" // Default image
    },
    {
      name: t('augustinN'),
      role: t('augustinNRole'),
      description: t('augustinNDescription'),
      image: "/afroman.png" // Default image
    }
  ];

  // Départements et ministères de l'église
  const departments = [
    {
      name: t('worshipAndPraise'),
      icon: Music,
      description: t('worshipAndPraiseDescription'),
      activities: [t('adultChoir'), t('youthChoir'), t('musicians'), t('soundTechnique')],
      leader: t('worshipLeader')
    },
    {
      name: t('sundaySchool'),
      icon: GraduationCap,
      description: t('sundaySchoolDescription'),
      activities: [t('toddlers'), t('children'), t('teenagers'), t('youngAdults')],
      leader: t('sundaySchoolLeader')
    },
    {
      name: t('womensMinistry'),
      icon: Heart,
      description: t('womensMinistryDescription'),
      activities: [t('monthlyMeetings'), t('biblicalTraining'), t('socialMutualAid'), t('intercessoryPrayer')],
      leader: t('womensMinistryLeader')
    },
    {
      name: t('youthMinistry'),
      icon: Users,
      description: t('youthMinistryDescription'),
      activities: [t('bibleStudies'), t('sportsActivities'), t('outings'), t('streetEvangelism')],
      leader: t('youthMinistryLeader')
    },
    {
      name: t('evangelismAndMissions'),
      icon: Globe,
      description: t('evangelismAndMissionsDescription'),
      activities: [t('evangelismCampaigns'), t('fieldMissions'), t('literatureDistribution'), t('homeVisits')],
      leader: t('evangelismLeader')
    },
    {
      name: t('intercessionAndPrayer'),
      icon: Shield,
      description: t('intercessionAndPrayerDescription'),
      activities: [t('prayerVigils'), t('dailyIntercession'), t('prayerForTheSick'), t('spiritualWarfare')],
      leader: t('intercessionLeader')
    },
    {
      name: t('socialAction'),
      icon: HandHeart,
      description: t('socialActionDescription'),
      activities: [t('foodAid'), t('medicalAssistance'), t('schoolSupport'), t('visitsToTheSick')],
      leader: t('socialActionLeader')
    },
    {
      name: t('daycare'),
      icon: Baby,
      description: t('daycareDescription'),
      activities: [t('childSupervision'), t('funActivities'), t('snacks'), t('educationalGames')],
      leader: t('daycareLeader')
    }
  ];

  const confessionPoints = [
    'confessionPoint1',
    'confessionPoint2',
    'confessionPoint3',
    'confessionPoint4',
    'confessionPoint5',
    'confessionPoint6',
    'confessionPoint7',
    'confessionPoint8',
    'confessionPoint9',
    'confessionPoint10',
    'confessionPoint11',
    'confessionPoint12'
  ];

  // Informations pratiques
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          title={t('aboutOurChurch')}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 space-y-6">
          {/* Notre Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <span>{t('ourMissionSection')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                {t('missionDescription')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('missionDescription2')}
              </p>
              <div className="mt-6 bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                <p className="text-destructive font-medium">
                  "{t('missionQuote')}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notre Vision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-blue-500" />
                <span>{t('ourVisionSection')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                {t('visionDescription')}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/10 p-6 rounded-lg">
                  <h3 className="font-semibold text-primary mb-3">{t('locallyTitle')}</h3>
                  <ul className="space-y-2 text-primary/80">
                    <li>• {t('localGoal1')}</li>
                    <li>• {t('localGoal2')}</li>
                    <li>• {t('localGoal3')}</li>
                    <li>• {t('localGoal4')}</li>
                  </ul>
                </div>
                <div className="bg-green-500/10 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">{t('globallyTitle')}</h3>
                  <ul className="space-y-2 text-green-700 dark:text-green-300">
                    <li>• {t('globalGoal1')}</li>
                    <li>• {t('globalGoal2')}</li>
                    <li>• {t('globalGoal3')}</li>
                    <li>• {t('globalGoal4')}</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 bg-primary/10 p-4 rounded-lg">
                <p className="text-primary font-medium text-center">
                  "{t('bibleQuote')}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notre Histoire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-green-500" />
                <span>{t('ourHistorySection')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                  {t('historyFirstParagraph')}
                </p>
                <p className="text-muted-foreground mb-4">
                  {t('historySecondParagraph')}
                </p>
                <p className="text-muted-foreground mb-4">
                  {t('historyThirdParagraph')}
                </p>
              </div>
              
              <div className="bg-green-500/10 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">{t('ourFoundations')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">{t('spiritualValues')}</h4>
                    <ul className="text-green-600 dark:text-green-400 text-sm space-y-1">
                      <li>• {t('spiritualValue1')}</li>
                      <li>• {t('spiritualValue2')}</li>
                      <li>• {t('spiritualValue3')}</li>
                      <li>• {t('spiritualValue4')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">{t('communityValues')}</h4>
                    <ul className="text-green-600 dark:text-green-400 text-sm space-y-1">
                      <li>• {t('communityValue1')}</li>
                      <li>• {t('communityValue2')}</li>
                      <li>• {t('communityValue3')}</li>
                      <li>• {t('communityValue4')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground italic">
                  "{t('historyQuote')}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confession de Foi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span>{t('confessionOfFaithSection')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('confessionIntro')}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {confessionPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Cross className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{t(point)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-primary text-sm font-medium">
                  {t('confessionFaithGuiding')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Corps pastoral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span>{t('pastoralTeam')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                {pastors.map((pastor, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-6 bg-muted/50 rounded-lg">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                      <img src={pastor.image} alt={pastor.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{pastor.name}</h3>
                    <Badge variant="secondary" className="mb-3">{pastor.role}</Badge>
                    <p className="text-muted-foreground text-sm">{pastor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Départements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <span>{t('ourDepartments')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept, index) => {
                  const Icon = dept.icon;
                  return (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-muted/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{dept.name}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{dept.description}</p>
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">{t('activities')}</h4>
                        <div className="flex flex-wrap gap-1">
                          {dept.activities.map((activity, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong>{t('responsible')}</strong> {dept.leader}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}