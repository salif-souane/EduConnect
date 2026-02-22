import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Avatar, Skeleton, Container } from '@mui/material';
import { People as PeopleIcon, School as SchoolIcon, MenuBook as MenuBookIcon, Person as PersonIcon } from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';

interface Stats {
    users: number;
    classes: number;
    subjects: number;
    students: number;
}

interface Props {
    initialStats?: Stats | null;
}

const Statistics: React.FC<Props> = ({ initialStats = null }) => {
    const [stats, setStats] = useState<Stats | null>(initialStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialStats) {
            // If parent provided stats, use them and skip fetching
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const [usersRes, classesRes, subjectsRes, studentsRes] = await Promise.all([
                    supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    supabase.from('classes').select('id', { count: 'exact', head: true }),
                    supabase.from('subjects').select('id', { count: 'exact', head: true }),
                    supabase.from('students').select('id', { count: 'exact', head: true }),
                ]);

                setStats({
                    users: usersRes.count || 0,
                    classes: classesRes.count || 0,
                    subjects: subjectsRes.count || 0,
                    students: studentsRes.count || 0,
                });
            } catch (err) {
                console.error('Erreur récupération statistiques', err);
                setError('Impossible de charger les statistiques.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [initialStats]);

    const cards = [
        { title: 'Utilisateurs', value: stats?.users ?? 0, icon: <PeopleIcon />, color: 'primary' },
        { title: 'Élèves', value: stats?.students ?? 0, icon: <PersonIcon />, color: 'success' },
        { title: 'Classes', value: stats?.classes ?? 0, icon: <SchoolIcon />, color: 'warning' },
        { title: 'Matières', value: stats?.subjects ?? 0, icon: <MenuBookIcon />, color: 'secondary' },
    ];

    const chartData = cards.map((c) => ({ name: c.title, value: c.value }));

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Statistiques Globales
            </Typography>

            {error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                    {loading
                        ? [1, 2, 3, 4].map((i) => (
                                <Card key={i}>
                                    <CardContent>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Skeleton variant="circular" width={48} height={48} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton variant="text" width="60%" />
                                                <Skeleton variant="text" width="40%" />
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))
                        : cards.map((c) => (
                                <Card key={c.title}>
                                    <CardContent>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: `${c.color}.main` }}>{c.icon}</Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {c.value.toLocaleString()}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {c.title}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                </Box>
            )}

            {!loading && !error && stats && stats.users === 0 && stats.classes === 0 && stats.subjects === 0 && (
                <Typography sx={{ mt: 2 }} color="text.secondary">
                    Aucune donnée de statistiques disponible pour le moment.
                </Typography>
            )}

            {/* Chart récapitulatif */}
            {!loading && !error && stats && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            Vue synthétique
                        </Typography>
                        <Box sx={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#1976d2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default Statistics;