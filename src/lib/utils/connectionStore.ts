// LocalStorage keys
export const STORAGE_KEYS = {
  WEAVIATE_CONNECTIONS: 'weaviate_connections',
  ACTIVE_CONNECTION: 'weaviate_active_connection',
  CONNECTION_HISTORY: 'weaviate_connection_history',
} as const;

// Connection interface
export interface WeaviateConnection {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  description?: string;
  isFavorite: boolean;
  lastConnected?: number;
  createdAt: number;
}

// Connection store class
export class ConnectionStore {
  // Get all saved connections
  static getConnections(): WeaviateConnection[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WEAVIATE_CONNECTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load connections:', error);
      return [];
    }
  }

  // Save connection
  static saveConnection(connection: Omit<WeaviateConnection, 'id' | 'createdAt'>): WeaviateConnection {
    const connections = this.getConnections();
    const newConnection: WeaviateConnection = {
      ...connection,
      id: this.generateId(),
      createdAt: Date.now(),
    };

    // Check if URL already exists
    const existingIndex = connections.findIndex(c => c.url === connection.url);
    if (existingIndex >= 0) {
      connections[existingIndex] = { ...connections[existingIndex], ...connection };
      this.setConnections(connections);
      return connections[existingIndex];
    }

    connections.push(newConnection);
    this.setConnections(connections);
    return newConnection;
  }

  // Update connection
  static updateConnection(id: string, updates: Partial<WeaviateConnection>): boolean {
    const connections = this.getConnections();
    const index = connections.findIndex(c => c.id === id);
    
    if (index >= 0) {
      connections[index] = { ...connections[index], ...updates };
      this.setConnections(connections);
      return true;
    }
    return false;
  }

  // Delete connection
  static deleteConnection(id: string): boolean {
    const connections = this.getConnections();
    const filtered = connections.filter(c => c.id !== id);
    
    if (filtered.length !== connections.length) {
      this.setConnections(filtered);
      
      // If deleted connection was active, clear active connection
      const activeId = this.getActiveConnectionId();
      if (activeId === id) {
        this.setActiveConnection(null);
      }
      return true;
    }
    return false;
  }

  // Get active connection
  static getActiveConnection(): WeaviateConnection | null {
    const activeId = this.getActiveConnectionId();
    if (!activeId) return null;
    
    const connections = this.getConnections();
    return connections.find(c => c.id === activeId) || null;
  }

  // Set active connection
  static setActiveConnection(connection: WeaviateConnection | null): void {
    const id = connection?.id || '';
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONNECTION, id);
    
    // Update last connected timestamp
    if (connection) {
      this.updateConnection(connection.id, { lastConnected: Date.now() });
    }
  }

  // Get active connection ID
  static getActiveConnectionId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONNECTION) || null;
  }

  // Toggle favorite
  static toggleFavorite(id: string): boolean {
    const connections = this.getConnections();
    const connection = connections.find(c => c.id === id);
    
    if (connection) {
      connection.isFavorite = !connection.isFavorite;
      this.setConnections(connections);
      return connection.isFavorite;
    }
    return false;
  }

  // Get recent connections
  static getRecentConnections(limit: number = 5): WeaviateConnection[] {
    const connections = this.getConnections();
    return connections
      .filter(c => c.lastConnected)
      .sort((a, b) => (b.lastConnected || 0) - (a.lastConnected || 0))
      .slice(0, limit);
  }

  // Get favorite connections
  static getFavoriteConnections(): WeaviateConnection[] {
    return this.getConnections().filter(c => c.isFavorite);
  }

  // Private methods
  private static setConnections(connections: WeaviateConnection[]): void {
    localStorage.setItem(STORAGE_KEYS.WEAVIATE_CONNECTIONS, JSON.stringify(connections));
  }

  private static generateId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize with default localhost connection
  static initializeDefaults(): void {
    const connections = this.getConnections();
    
    if (connections.length === 0) {
      const defaultConnection = this.saveConnection({
        name: 'Local Weaviate',
        url: 'http://localhost:8080',
        description: 'Default local Weaviate instance',
        isFavorite: true,
      });
      
      this.setActiveConnection(defaultConnection);
    }
  }

  // Export connections
  static exportConnections(): string {
    const connections = this.getConnections();
    return JSON.stringify(connections, null, 2);
  }

  // Import connections
  static importConnections(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as WeaviateConnection[];
      
      if (Array.isArray(imported)) {
        // Validate structure
        const valid = imported.every(conn => 
          conn.name && conn.url && typeof conn.isFavorite === 'boolean'
        );
        
        if (valid) {
          const existing = this.getConnections();
          const merged = [...existing];
          
          imported.forEach(newConn => {
            const existingIndex = merged.findIndex(c => c.url === newConn.url);
            if (existingIndex >= 0) {
              merged[existingIndex] = { ...merged[existingIndex], ...newConn };
            } else {
              merged.push({
                ...newConn,
                id: this.generateId(),
                createdAt: Date.now(),
              });
            }
          });
          
          this.setConnections(merged);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to import connections:', error);
      return false;
    }
  }
}