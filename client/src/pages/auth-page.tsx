import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Church, Users, Calendar, TrendingUp } from "lucide-react";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "user",
      email: "",
    },
  });

  // Redirect if already logged in - after hooks to avoid rules of hooks violation
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const onLogin = async (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegister = async (data: RegisterForm) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Forms */}
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-white rounded-xl shadow-lg border">
                <img
                  src="/logo.jpg"
                  alt="Logo Mission Évangélique Boanergès"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-foreground">
                  Mission Évangélique Boanergès
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground">Espace membre</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Connexion</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Se connecter</CardTitle>
                  <CardDescription>
                    Entrez vos identifiants pour accéder à votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="username">Nom d'utilisateur</Label>
                      <Input
                        id="username"
                        type="text"
                        {...loginForm.register("username")}
                        disabled={loginMutation.isPending}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                        disabled={loginMutation.isPending}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending
                        ? "Connexion..."
                        : "Se connecter"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex items-center justify-center bg-primary-50 p-8">
        <div className="max-w-md text-center">
          <Church className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Gestion d'Église Simplifiée
          </h2>
          <p className="text-gray-600 mb-8">
            ChurchFlow vous aide à gérer efficacement votre communauté avec des
            outils modernes pour les membres, les événements, les dons et bien
            plus.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-700">
                Gestion des membres et présences
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-700">
                Calendrier d'événements
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-700">
                Suivi des dons et statistiques
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
