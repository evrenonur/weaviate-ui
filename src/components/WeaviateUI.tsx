'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Layout';
import { ConnectionManager } from '@/components/ConnectionManager';
import { SchemaBrowser } from '@/components/schema/SchemaBrowser';
import { ObjectsBrowser } from '@/components/objects/ObjectsBrowser';
import { GraphQLInterface } from '@/components/graphql/GraphQLInterface';
import { ClusterInfo } from '@/components/ClusterInfo';
import { weaviateClient } from '@/lib/api/weaviate';
import { ConnectionStatus } from '@/types/weaviate';
import { ConnectionStore, WeaviateConnection } from '@/lib/utils/connectionStore';

interface TabContentProps {
  activeTab: string;
}

function TabContent({ activeTab }: TabContentProps) {
  switch (activeTab) {
    case 'schema':
      return <SchemaBrowser />;
    case 'objects':
      return <ObjectsBrowser />;
    case 'graphql':
      return <GraphQLInterface />;
    case 'cluster':
      return <ClusterInfo />;
    default:
      return <SchemaBrowser />;
  }
}

export default function WeaviateUI() {
  const [activeTab, setActiveTab] = useState('schema');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    url: 'http://localhost:8080',
  });
  const [currentConnection, setCurrentConnection] = useState<WeaviateConnection | null>(null);
  const [showConnectionManager, setShowConnectionManager] = useState(false);

  useEffect(() => {
    // Initialize default connections if none exist
    ConnectionStore.initializeDefaults();
    
    // Load active connection
    const activeConnection = ConnectionStore.getActiveConnection();
    if (activeConnection) {
      setCurrentConnection(activeConnection);
      weaviateClient.updateConnection(activeConnection.url, activeConnection.apiKey);
    }
    
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const status = await weaviateClient.checkConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({
        connected: false,
        url: weaviateClient.getBaseURL(),
        error: 'Failed to connect',
      });
    }
  };

  const handleConnectionSelect = (connection: WeaviateConnection) => {
    setCurrentConnection(connection);
    weaviateClient.updateConnection(connection.url, connection.apiKey);
    
    // Update connection status
    setConnectionStatus({
      connected: false,
      url: connection.url,
    });
    
    // Check new connection
    checkConnection();
  };

  // Automatically check connection every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        connectionStatus={connectionStatus}
        currentConnection={currentConnection}
        onOpenConnectionManager={() => setShowConnectionManager(true)}
      />
      <main className="flex-1 overflow-hidden">
        <TabContent activeTab={activeTab} />
      </main>

      <ConnectionManager
        isOpen={showConnectionManager}
        onClose={() => setShowConnectionManager(false)}
        onConnectionSelect={handleConnectionSelect}
        currentConnection={currentConnection}
      />
    </div>
  );
}