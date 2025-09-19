'use client';

import React, { useState, useRef } from 'react';
import { Play, Copy, Download, RotateCcw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { JsonViewer } from '@/components/ui/json-viewer';
import { weaviateClient } from '@/lib/api/weaviate';
import { WeaviateResponse } from '@/types/weaviate';

const defaultQuery = `{
  Get {
    # Replace with your class name
    Article(limit: 10) {
      title
      content
      _additional {
        id
        certainty
      }
    }
  }
}`;

const exampleQueries = [
  {
    name: 'Get Objects',
    description: 'Basic query to get objects from a class',
    query: `{
  Get {
    Article(limit: 5) {
      title
      content
      _additional {
        id
        score
      }
    }
  }
}`
  },
  {
    name: 'Semantic Search',
    description: 'Search objects by semantic similarity',
    query: `{
  Get {
    Article(
      nearText: {
        concepts: ["artificial intelligence"]
      }
      limit: 3
    ) {
      title
      content
      _additional {
        id
        certainty
      }
    }
  }
}`
  },
  {
    name: 'Where Filter',
    description: 'Filter objects by property values',
    query: `{
  Get {
    Article(
      where: {
        path: ["title"]
        operator: Like
        valueText: "*AI*"
      }
      limit: 5
    ) {
      title
      content
    }
  }
}`
  },
  {
    name: 'Aggregate',
    description: 'Get aggregate information about a class',
    query: `{
  Aggregate {
    Article {
      meta {
        count
      }
      title {
        count
        topOccurrences {
          occurs
          value
        }
      }
    }
  }
}`
  },
  {
    name: 'Explore',
    description: 'Explore data without knowing the schema',
    query: `{
  Explore(
    nearText: {
      concepts: ["science"]
    }
    limit: 3
  ) {
    beacon
    className
    certainty
  }
}`
  }
];

interface QueryResult {
  data?: any;
  errors?: any[];
  loading: boolean;
  executionTime?: number;
}

export function GraphQLInterface() {
  const [query, setQuery] = useState(defaultQuery);
  const [result, setResult] = useState<QueryResult>({ loading: false });
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const editorRef = useRef<any>(null);

  const executeQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a GraphQL query');
      return;
    }

    setResult({ loading: true });
    const startTime = Date.now();

    try {
      const response: WeaviateResponse = await weaviateClient.graphqlQuery(query);
      const executionTime = Date.now() - startTime;
      
      setResult({
        data: response.data,
        errors: response.errors,
        loading: false,
        executionTime,
      });
    } catch (error: any) {
      setResult({
        errors: [{ message: error.message }],
        loading: false,
        executionTime: Date.now() - startTime,
      });
    }
  };

  const copyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  const downloadResult = () => {
    if (!result.data && !result.errors) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'weaviate-query-result.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetQuery = () => {
    setQuery(defaultQuery);
    setResult({ loading: false });
    setSelectedExample(null);
  };

  const loadExample = (example: typeof exampleQueries[0], index: number) => {
    setQuery(example.query);
    setSelectedExample(index);
    setResult({ loading: false });
  };

  return (
    <div className="p-6 h-full flex">
      {/* Left Panel - Query Editor */}
      <div className="flex-1 flex flex-col mr-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">GraphQL Query</h2>
            <p className="text-muted-foreground">
              Write and execute GraphQL queries against your Weaviate instance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={copyQuery}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={resetQuery}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={executeQuery} disabled={result.loading}>
              <Play className="h-4 w-4 mr-2" />
              {result.loading ? 'Running...' : 'Run Query'}
            </Button>
          </div>
        </div>

        {/* Query Editor */}
        <Card className="flex-1 mb-4">
          <CardContent className="p-0">
            <CodeMirror
              ref={editorRef}
              value={query}
              height="400px"
              extensions={[javascript()]}
              theme={oneDark}
              onChange={(value) => setQuery(value)}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                bracketMatching: true,
                indentOnInput: true,
                highlightSelectionMatches: true,
              }}
            />
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Results</CardTitle>
                {result.executionTime && (
                  <CardDescription>
                    Executed in {result.executionTime}ms
                  </CardDescription>
                )}
              </div>
              {(result.data || result.errors) && (
                <Button variant="outline" size="sm" onClick={downloadResult}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-auto">
              {result.loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Executing query...</p>
                </div>
              ) : result.errors ? (
                <div className="p-6">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h4 className="text-destructive font-medium mb-2">Query Errors:</h4>
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-destructive">
                        {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              ) : result.data ? (
                <div className="p-4">
                  <JsonViewer 
                    data={result.data}
                    title="Query Results"
                    showDownloadButton={true}
                    maxHeight="50vh"
                    collapsedDepth={2}
                  />
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <Play className="h-8 w-8 mx-auto mb-4" />
                  <p>Execute a query to see results</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Examples */}
      <div className="w-80">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle>Example Queries</CardTitle>
            </div>
            <CardDescription>
              Click on any example to load it into the editor
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example, index)}
                  className={`w-full text-left p-4 border-b hover:bg-accent transition-colors ${
                    selectedExample === index ? 'bg-accent' : ''
                  }`}
                >
                  <div className="font-medium text-sm">{example.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Query Tips */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">GraphQL Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <strong>Get:</strong> Query objects from specific classes
            </div>
            <div>
              <strong>Aggregate:</strong> Get meta information and statistics
            </div>
            <div>
              <strong>Explore:</strong> Fuzzy search without knowing schema
            </div>
            <div>
              <strong>nearText:</strong> Semantic search by text concepts
            </div>
            <div>
              <strong>where:</strong> Filter by property values
            </div>
            <div>
              <strong>_additional:</strong> Get metadata like ID, certainty
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}