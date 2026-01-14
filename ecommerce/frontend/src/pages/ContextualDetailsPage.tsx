import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/calendar/Card';
import '@/styles/calendar-tokens.css';

interface DetailData {
    id: string;
    type: string;
    title: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export default function ContextualDetailsPage() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<DetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // TODO: Replace with actual API call
                // const response = await fetch(`/api/v1/${type}/${id}/details`);
                // const result = await response.json();

                // Mock data for demonstration
                setTimeout(() => {
                    setData({
                        id: id || '',
                        type: type || '',
                        title: `${type} Details - ${id}`,
                        metadata: {
                            status: 'active',
                            priority: 'high',
                            tags: ['important', 'urgent'],
                            description: 'This is a detailed view of the selected item with contextual information.',
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                    setIsLoading(false);
                }, 800);
            } catch (err) {
                setError('Failed to load details');
                setIsLoading(false);
            }
        };

        if (type && id) {
            fetchDetails();
        }
    }, [type, id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="h-8 w-8 border-4 border-[#a29bfe] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
                <Card variant="elevated" className="max-w-md">
                    <CardContent className="text-center py-8">
                        <p className="text-red-400 mb-4">{error || 'No data found'}</p>
                        <Button onClick={() => navigate(-1)}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary">
            {/* Glassmorphic Navbar */}
            <nav className="glass-navbar fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold text-white">{data.title}</h1>
                        <p className="text-sm text-white/60">Contextual Details</p>
                    </div>
                </div>
            </nav>

            <div className="pt-24 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    {/* Main Content */}
                    <div className="space-y-6">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>Detailed information about this {type}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-white/60">ID</dt>
                                        <dd className="text-white font-mono mt-1">{data.id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-white/60">Type</dt>
                                        <dd className="text-white capitalize mt-1">{data.type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-white/60">Status</dt>
                                        <dd className="mt-1">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                                                {data.metadata.status}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-white/60">Description</dt>
                                        <dd className="text-white mt-1">{data.metadata.description}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {data.metadata.tags && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.metadata.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 rounded-full bg-[#a29bfe]/20 text-[#a29bfe] text-sm"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
                                        <div>
                                            <p className="text-white/60">Created</p>
                                            <p className="text-white mt-1">{new Date(data.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60">Updated</p>
                                            <p className="text-white mt-1">{new Date(data.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Live Sidebar */}
                    <div className="space-y-4">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="primary" size="sm" className="w-full">
                                    Edit
                                </Button>
                                <Button variant="secondary" size="sm" className="w-full">
                                    Share
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full text-red-400 hover:bg-red-500/10">
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-lg">Priority</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/80 capitalize">{data.metadata.priority}</span>
                                    <span className="h-3 w-3 rounded-full bg-[#ffcc00] animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
