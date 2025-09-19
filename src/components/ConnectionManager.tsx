'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  StarOff, 
  Download, 
  Upload, 
  Wifi, 
  WifiOff,
  Settings,
  Clock,
  Heart,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStore, WeaviateConnection } from '@/lib/utils/connectionStore';

interface ConnectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSelect: (connection: WeaviateConnection) => void;
  currentConnection: WeaviateConnection | null;
}

interface ConnectionFormData {
  name: string;
  url: string;
  apiKey: string;
  description: string;
}

export function ConnectionManager({ 
  isOpen, 
  onClose, 
  onConnectionSelect, 
  currentConnection 
}: ConnectionManagerProps) {
  const [connections, setConnections] = useState<WeaviateConnection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WeaviateConnection | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>({
    name: '',
    url: '',
    apiKey: '',
    description: '',
  });
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen]);

  const loadConnections = () => {
    setConnections(ConnectionStore.getConnections());
  };

  const resetForm = () => {
    setFormData({ name: '', url: '', apiKey: '', description: '' });
    setEditingConnection(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Name and URL are required');
      return;
    }

    try {
      if (editingConnection) {
        ConnectionStore.updateConnection(editingConnection.id, {
          name: formData.name.trim(),
          url: formData.url.trim(),
          apiKey: formData.apiKey.trim() || undefined,
          description: formData.description.trim() || undefined,
        });
      } else {
        ConnectionStore.saveConnection({
          name: formData.name.trim(),
          url: formData.url.trim(),
          apiKey: formData.apiKey.trim() || undefined,
          description: formData.description.trim() || undefined,
          isFavorite: false,
        });
      }
      
      loadConnections();
      resetForm();
    } catch (error) {
      alert('Failed to save connection');
    }
  };

  const handleEdit = (connection: WeaviateConnection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      url: connection.url,
      apiKey: connection.apiKey || '',
      description: connection.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (connection: WeaviateConnection) => {
    if (confirm(`Delete connection "${connection.name}"?`)) {
      ConnectionStore.deleteConnection(connection.id);
      loadConnections();
    }
  };

  const handleToggleFavorite = (connection: WeaviateConnection) => {
    ConnectionStore.toggleFavorite(connection.id);
    loadConnections();
  };

  const handleTestConnection = async (connection: WeaviateConnection) => {
    setTestingConnection(connection.id);
    // Here you would implement actual connection testing
    // For now, just simulate
    setTimeout(() => {
      setTestingConnection(null);
    }, 2000);
  };

  const handleConnect = (connection: WeaviateConnection) => {
    ConnectionStore.setActiveConnection(connection);
    onConnectionSelect(connection);
    onClose();
  };

  const getFilteredConnections = () => {
    switch (activeTab) {
      case 'favorites':
        return ConnectionStore.getFavoriteConnections();
      case 'recent':
        return ConnectionStore.getRecentConnections(10);
      default:
        return connections;
    }
  };

  const handleExport = () => {
    const data = ConnectionStore.exportConnections();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weaviate-connections.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (ConnectionStore.importConnections(content)) {
            loadConnections();
            alert('Connections imported successfully');
          } else {
            alert('Invalid file format');
          }
        } catch (error) {
          alert('Failed to import connections');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-xl max-w-4xl max-h-[90vh] overflow-hidden border shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-500" />
                Connection Manager
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your Weaviate connections
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-80 border-r bg-muted/20">
            <div className="p-4">
              <Button 
                onClick={() => setShowForm(true)} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-4">
              <div className="flex bg-muted rounded-lg p-1">
                {[
                  { id: 'all', label: 'All', icon: Settings },
                  { id: 'favorites', label: 'Favorites', icon: Heart },
                  { id: 'recent', label: 'Recent', icon: Clock },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connection List */}
            <div className="flex-1 overflow-auto px-4 pb-4">
              <div className="space-y-2">
                {getFilteredConnections().map((connection) => (
                  <div
                    key={connection.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      currentConnection?.id === connection.id
                        ? 'bg-primary/10 border-primary/30 shadow-md'
                        : 'bg-background hover:bg-muted/50'
                    }`}
                    onClick={() => handleConnect(connection)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          currentConnection?.id === connection.id
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`} />
                        <span className="font-medium text-sm">{connection.name}</span>
                        {connection.isFavorite && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(connection);
                          }}
                        >
                          {connection.isFavorite ? (
                            <StarOff className="h-3 w-3" />
                          ) : (
                            <Star className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(connection);
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(connection);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {connection.url}
                    </div>
                    {connection.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {connection.description}
                      </div>
                    )}
                    {connection.lastConnected && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last: {new Date(connection.lastConnected).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {showForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingConnection ? 'Edit Connection' : 'Add New Connection'}
                  </CardTitle>
                  <CardDescription>
                    {editingConnection ? 'Update connection details' : 'Create a new Weaviate connection'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Connection Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Weaviate Instance"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">URL</label>
                    <Input
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="http://localhost:8080"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">API Key (Optional)</label>
                    <Input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Your API key"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Production instance"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      <Check className="h-4 w-4 mr-2" />
                      {editingConnection ? 'Update' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Select a Connection</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a connection from the list or create a new one
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Connection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}