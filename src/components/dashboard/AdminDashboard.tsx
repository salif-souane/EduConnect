import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Skeleton,
  Stack,
  Divider,
  Container
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material';
import Statistics from '../statistics/Statistics';

interface Stats {
  totalUsers: number;
  totalClasses: number;
  totalSubjects: number;
  totalStudents: number;
}

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  academic_year: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalStudents: 0,
  });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentClasses, setRecentClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      const [usersRes, classesRes, subjectsRes, studentsRes, recentUsersRes, recentClassesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role, created_at')
          .limit(5),
        supabase
          .from('classes')
          .select('*')
          .limit(5),
      ]);

      console.log('Recent classes data:', recentClassesRes);
      console.log('Recent classes error:', recentClassesRes.error);
      console.log('Classes count:', classesRes.count);

      if (recentClassesRes.error) {
        console.error('Error fetching classes:', recentClassesRes.error);
        setError(`Erreur lors du chargement des classes: ${recentClassesRes.error.message}`);
      }

      setStats({
        totalUsers: usersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        totalStudents: studentsRes.count || 0,
      });
      setRecentUsers(recentUsersRes.data || []);
      setRecentClasses(recentClassesRes.data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(`Erreur lors du chargement: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: stats.totalUsers,
      icon: PeopleIcon,
      color: 'primary.main',
      bgColor: 'primary.light',
      trend: '+12%',
    },
    {
      title: 'Élèves',
      value: stats.totalStudents,
      icon: PersonIcon,
      color: 'success.main',
      bgColor: 'success.light',
      trend: '+8%',
    },
    {
      title: 'Classes',
      value: stats.totalClasses,
      icon: SchoolIcon,
      color: 'warning.main',
      bgColor: 'warning.light',
      trend: '+5%',
    },
    {
      title: 'Matières',
      value: stats.totalSubjects,
      icon: MenuBookIcon,
      color: 'secondary.main',
      bgColor: 'secondary.light',
      trend: '+3%',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'enseignant': return 'primary';
      case 'eleve': return 'success';
      case 'parent': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 4 }} />
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 3,
            mb: 4,
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <Card key={item}>
                <CardContent>
                  <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 1 }} />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />
              {[1, 2].map((item) => (
                <Skeleton key={item} variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 1 }} />
              ))}
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Tableau de bord administrateur
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vue d'ensemble de la plateforme éducative et statistiques
        </Typography>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', borderLeft: 4, borderColor: 'error.main' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Cartes de statistiques */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title}
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: card.bgColor,
                      color: card.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    <Icon fontSize="medium" />
                  </Avatar>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={card.trend}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
                
                <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                  {card.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Section inférieure */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Utilisateurs récents */}
        <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
                Utilisateurs récents
              </Typography>
              
              {recentUsers.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Aucun utilisateur créé pour le moment
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {recentUsers.map((user) => (
                    <Paper
                      key={user.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.first_name?.[0]?.toUpperCase()}
                          {user.last_name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button 
                endIcon={<ArrowForwardIcon />}
                variant="text"
                color="primary"
              >
                Voir tous les utilisateurs
              </Button>
            </CardActions>
          </Card>

        {/* Classes récentes */}
        <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
                Classes récentes
              </Typography>
              
              {recentClasses.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Aucune classe créée pour le moment
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {recentClasses.map((cls) => (
                    <Paper
                      key={cls.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <SchoolIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {cls.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cls.level} • {cls.academic_year}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button 
                endIcon={<ArrowForwardIcon />}
                variant="text"
                color="primary"
              >
                Voir toutes les classes
              </Button>
            </CardActions>
          </Card>
      </Box>

      {/* Actions rapides */}
      <Card sx={{ height: '100%', mt: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
                Actions rapides
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  sx={{
                    py: 2,
                    justifyContent: 'flex-start',
                    textAlign: 'left'
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Ajouter un utilisateur</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Créer un nouveau compte
                    </Typography>
                  </Box>
                </Button>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<GroupAddIcon />}
                  sx={{
                    py: 2,
                    justifyContent: 'flex-start',
                    textAlign: 'left'
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Créer une classe</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Ajouter une nouvelle classe
                    </Typography>
                  </Box>
                </Button>
                
                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Autres actions
                  </Typography>
                </Divider>
                
                <Stack spacing={1}>
                  {[
                    { label: 'Gérer les matières', icon: <MenuBookIcon />, color: 'warning' },
                    { label: 'Voir les statistiques', icon: <TrendingUpIcon />, color: 'info' },
                    { label: 'Modérer les contenus', icon: <SchoolIcon />, color: 'secondary' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      fullWidth
                      variant="outlined"
                      startIcon={action.icon}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
      <Statistics initialStats={{
        users: stats.totalUsers,
        classes: stats.totalClasses,
        subjects: stats.totalSubjects,
        students: stats.totalStudents,
      }} />
    </Container>
  );
}