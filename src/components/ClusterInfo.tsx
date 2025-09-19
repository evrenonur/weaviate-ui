'use client';

import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, Database, Cpu, HardDrive, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import JsonView from '@uiw/react-json-view';
import { JsonViewer } from '@/components/ui/json-viewer';
import { weaviateClient } from '@/lib/api/weaviate';
import { WeaviateMeta } from '@/types/weaviate';

export function ClusterInfo() {
  const [meta, setMeta] = useState<WeaviateMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = async () => {
    try {
      setLoading(true);
      setError(null);
      const metaData = await weaviateClient.getMeta();
      setMeta(metaData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cluster info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  if (loading) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading cluster information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={fetchMeta}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Cluster Information</h2>
          <p className="text-muted-foreground">
            Server details and configuration of your Weaviate instance
          </p>
        </div>
        <Button variant="outline" onClick={fetchMeta}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {meta && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <CardTitle>Server Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hostname</p>
                  <p className="font-mono text-sm">{meta.hostname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="font-mono text-sm">{meta.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <CardTitle>Enabled Modules</CardTitle>
              </div>
              <CardDescription>
                Modules extend Weaviate's functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meta.modules && Object.keys(meta.modules).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(meta.modules).map(([moduleName, moduleInfo]) => (
                    <div key={moduleName} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{moduleName}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Enabled
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No modules configured</p>
              )}
            </CardContent>
          </Card>

          {/* Raw Meta Data */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <CardTitle>Raw Meta Data</CardTitle>
              </div>
              <CardDescription>
                Complete meta information returned by the server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JsonViewer 
                data={meta}
                title="Raw Meta Information"
                showDownloadButton={true}
                maxHeight="400px"
                collapsedDepth={2}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}