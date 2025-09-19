import axios, { AxiosInstance } from 'axios';
import { GraphQLClient } from 'graphql-request';
import { 
  WeaviateSchema, 
  WeaviateObject, 
  WeaviateMeta, 
  ConnectionStatus, 
  WeaviateResponse 
} from '@/types/weaviate';

class WeaviateClient {
  private baseURL: string;
  private apiKey?: string;
  private restClient!: AxiosInstance;
  private graphqlClient!: GraphQLClient;

  constructor(baseURL: string = 'http://localhost:8080', apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.initializeClients();
  }

  private initializeClients(): void {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    this.restClient = axios.create({
      baseURL: `${this.baseURL}/v1`,
      timeout: 10000,
      headers,
    });

    const graphqlHeaders: Record<string, string> = {};
    if (this.apiKey) {
      graphqlHeaders['Authorization'] = `Bearer ${this.apiKey}`;
    }

    this.graphqlClient = new GraphQLClient(`${this.baseURL}/v1/graphql`, {
      headers: graphqlHeaders,
    });
  }

  // Connection and health check
  async checkConnection(): Promise<ConnectionStatus> {
    try {
      const response = await this.restClient.get('/');
      const meta = await this.getMeta();
      return {
        connected: true,
        url: this.baseURL,
        meta,
      };
    } catch (error: any) {
      return {
        connected: false,
        url: this.baseURL,
        error: error.message || 'Connection failed',
      };
    }
  }

  // Get meta information
  async getMeta(): Promise<WeaviateMeta> {
    const response = await this.restClient.get('/meta');
    return response.data;
  }

  // Schema operations
  async getSchema(): Promise<WeaviateSchema> {
    const response = await this.restClient.get('/schema');
    return response.data;
  }

  async createClass(classObj: any): Promise<void> {
    await this.restClient.post('/schema', classObj);
  }

  async deleteClass(className: string): Promise<void> {
    await this.restClient.delete(`/schema/${className}`);
  }

  // Object operations
  async getObjects(params?: {
    className?: string;
    limit?: number;
    offset?: number;
    where?: any;
  }): Promise<{objects: WeaviateObject[]; totalResults?: number}> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.className) queryParams.append('class', params.className);
    
    const response = await this.restClient.get(`/objects?${queryParams.toString()}`);
    return {
      objects: response.data.objects || [],
      totalResults: response.data.totalResults,
    };
  }

  async getObjectById(id: string, className?: string): Promise<WeaviateObject> {
    const url = className ? `/objects/${className}/${id}` : `/objects/${id}`;
    const response = await this.restClient.get(url);
    return response.data;
  }

  async createObject(object: Partial<WeaviateObject>): Promise<WeaviateObject> {
    const response = await this.restClient.post('/objects', object);
    return response.data;
  }

  async updateObject(id: string, object: Partial<WeaviateObject>): Promise<WeaviateObject> {
    const response = await this.restClient.put(`/objects/${id}`, object);
    return response.data;
  }

  async deleteObject(id: string, className?: string): Promise<void> {
    const url = className ? `/objects/${className}/${id}` : `/objects/${id}`;
    await this.restClient.delete(url);
  }

  // GraphQL operations
  async graphqlQuery(query: string, variables?: Record<string, any>): Promise<WeaviateResponse> {
    try {
      const data = await this.graphqlClient.request(query, variables);
      return { data };
    } catch (error: any) {
      return {
        errors: error.response?.errors || [{ message: error.message }],
      };
    }
  }

  // Batch operations
  async batchCreate(objects: Partial<WeaviateObject>[]): Promise<WeaviateResponse[]> {
    const response = await this.restClient.post('/batch/objects', {
      objects,
    });
    return response.data;
  }

  // Search helpers
  async searchObjects(query: string, className?: string, limit: number = 10): Promise<WeaviateResponse> {
    const graphqlQuery = `
      {
        Get {
          ${className || 'Article'}(
            limit: ${limit}
            where: {
              operator: Like
              path: ["*"]
              valueText: "${query}"
            }
          ) {
            _additional {
              id
              score
            }
          }
        }
      }
    `;
    
    return this.graphqlQuery(graphqlQuery);
  }

  // Utility methods
  updateConnection(url: string, apiKey?: string): void {
    this.baseURL = url;
    this.apiKey = apiKey;
    this.initializeClients();
  }

  setBaseURL(url: string): void {
    this.updateConnection(url, this.apiKey);
  }

  setApiKey(apiKey?: string): void {
    this.updateConnection(this.baseURL, apiKey);
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }
}

// Export singleton instance
export const weaviateClient = new WeaviateClient();

// Export class for custom instances
export { WeaviateClient };