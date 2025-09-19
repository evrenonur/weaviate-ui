// Weaviate API types
export interface WeaviateClass {
  class: string;
  description?: string;
  vectorIndexType?: string;
  vectorIndexConfig?: Record<string, any>;
  properties?: WeaviateProperty[];
  multiTenancy?: {
    enabled: boolean;
  };
}

export interface WeaviateProperty {
  name: string;
  dataType: string[];
  description?: string;
  tokenization?: string;
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
}

export interface WeaviateObject {
  id: string;
  class: string;
  properties: Record<string, any>;
  vector?: number[];
  creationTimeUnix?: number;
  lastUpdateTimeUnix?: number;
  additional?: {
    id?: string;
    vector?: number[];
    certainty?: number;
    distance?: number;
    score?: number;
  };
}

export interface WeaviateSchema {
  classes: WeaviateClass[];
}

export interface WeaviateResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export interface WeaviateMeta {
  hostname: string;
  version: string;
  modules: Record<string, any>;
}

export interface ConnectionStatus {
  connected: boolean;
  url: string;
  error?: string;
  meta?: WeaviateMeta;
}

export interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

export interface QueryResult {
  data?: any;
  errors?: any[];
  loading: boolean;
  timestamp: number;
}