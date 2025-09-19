'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Settings, 
  Search, 
  Code, 
  Activity,
  Menu,
  X,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { weaviateClient } from '@/lib/api/weaviate';
import { ConnectionStatus } from '@/types/weaviate';
import { WeaviateConnection } from '@/lib/utils/connectionStore';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  connectionStatus: ConnectionStatus;
  currentConnection?: WeaviateConnection | null;
  onOpenConnectionManager?: () => void;
}

const tabs = [
  { id: 'schema', label: 'Schema', icon: Database },
  { id: 'objects', label: 'Objects', icon: Search },
  { id: 'graphql', label: 'GraphQL', icon: Code },
  { id: 'cluster', label: 'Cluster Info', icon: Activity },
];

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  connectionStatus,
  currentConnection,
  onOpenConnectionManager
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`gradient-bg border-r border-white/10 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    } relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg animate-pulse-glow">
                <Database className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                  Weaviate Dashboard
                </h1>
                <p className="text-xs text-gray-400">Vector Database Manager</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-white/10 transition-all duration-200"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Connection Status */}
        <div className={`mb-4 p-4 rounded-xl backdrop-blur-md transition-all duration-300 ${
          connectionStatus.connected 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-red-500/20 border border-red-500/30'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`relative ${connectionStatus.connected ? 'animate-pulse-glow' : ''}`}>
              <Circle className={`h-3 w-3 ${
                connectionStatus.connected ? 'fill-green-400 text-green-400' : 'fill-red-400 text-red-400'
              }`} />
              {connectionStatus.connected && (
                <div className="absolute inset-0 h-3 w-3 bg-green-400 rounded-full opacity-75 animate-ping"></div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  connectionStatus.connected ? 'text-green-300' : 'text-red-300'
                }`}>
                  {connectionStatus.connected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentConnection?.name || connectionStatus.url}
                </p>
                {connectionStatus.meta && (
                  <p className="text-xs text-gray-500 mt-1">
                    🚀 v{connectionStatus.meta.version}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Connection Manager Button */}
        {!isCollapsed && onOpenConnectionManager && (
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={onOpenConnectionManager}
              className="w-full justify-start bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200"
            >
              <div className="p-1 rounded-md bg-blue-500/30 mr-3">
                <Settings className="h-4 w-4" />
              </div>
              Manage Connections
            </Button>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => onTabChange(tab.id)}
                className={`w-full justify-start group transition-all duration-200 ${
                  isCollapsed ? 'px-3' : 'px-4'
                } ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 border text-white shadow-lg' 
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-md transition-all duration-200 ${
                  isActive ? 'bg-green-500/30' : 'group-hover:bg-white/10'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                  <span className="ml-3 font-medium">{tab.label}</span>
                )}
                {!isCollapsed && isActive && (
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </Button>
            );
          })}
        </nav>

       
      </div>
    </aside>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    url: 'http://localhost:8080',
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await weaviateClient.checkConnection();
        setConnectionStatus(status);
      } catch (error) {
        setConnectionStatus({
          connected: false,
          url: 'http://localhost:8080',
          error: 'Failed to connect',
        });
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <div className="h-full">
        {children}
      </div>
    </div>
  );
}