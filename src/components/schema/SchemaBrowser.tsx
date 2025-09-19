'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, ChevronRight, ChevronDown, Database, Settings, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { weaviateClient } from '@/lib/api/weaviate';
import { WeaviateSchema, WeaviateClass, WeaviateProperty } from '@/types/weaviate';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (className: string, properties: Array<{name: string, dataType: string}>) => void;
}

function AddClassModal({ isOpen, onClose, onSave }: AddClassModalProps) {
  const [className, setClassName] = useState('');
  const [properties, setProperties] = useState([{ name: '', dataType: 'text' }]);

  const addProperty = () => {
    setProperties([...properties, { name: '', dataType: 'text' }]);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index: number, field: 'name' | 'dataType', value: string) => {
    const updated = properties.map((prop, i) => 
      i === index ? { ...prop, [field]: value } : prop
    );
    setProperties(updated);
  };

  const handleSave = () => {
    if (!className.trim()) {
      alert('Class name is required');
      return;
    }
    
    const validProperties = properties.filter(p => p.name.trim());
    if (validProperties.length === 0) {
      alert('At least one property is required');
      return;
    }

    onSave(className.trim(), validProperties);
    setClassName('');
    setProperties([{ name: '', dataType: 'text' }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Add New Class</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Class Name
            </label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Enter class name (e.g., Article, Person)"
              className="bg-gray-800/50 border-gray-600/30"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-200">Properties</label>
              <Button variant="outline" size="sm" onClick={addProperty}>
                <Plus className="h-3 w-3 mr-1" />
                Add Property
              </Button>
            </div>
            
            <div className="space-y-3">
              {properties.map((property, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Input
                    value={property.name}
                    onChange={(e) => updateProperty(index, 'name', e.target.value)}
                    placeholder="Property name"
                    className="flex-1 bg-gray-800/50 border-gray-600/30"
                  />
                  <select
                    value={property.dataType}
                    onChange={(e) => updateProperty(index, 'dataType', e.target.value)}
                    className="px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-md text-white"
                  >
                    <option value="text">Text</option>
                    <option value="int">Integer</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                    <option value="text[]">Text Array</option>
                    <option value="int[]">Integer Array</option>
                  </select>
                  {properties.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProperty(index)}
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Create Class
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PropertyItemProps {
  property: WeaviateProperty;
}

function PropertyItem({ property }: PropertyItemProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-600/30 rounded-lg hover:border-blue-500/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">{property.name}</span>
              <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                {property.dataType.join(' | ')}
              </div>
            </div>
            {property.description && (
              <p className="text-sm text-gray-400 mt-1">{property.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {property.indexFilterable && (
            <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-xs text-green-300 font-medium">🔍 Filterable</span>
            </div>
          )}
          {property.indexSearchable && (
            <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <span className="text-xs text-purple-300 font-medium">🔎 Searchable</span>
            </div>
          )}
          {property.indexInverted && (
            <div className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
              <span className="text-xs text-orange-300 font-medium">📋 Inverted</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ClassItemProps {
  weaviateClass: WeaviateClass;
  onDelete: (className: string) => void;
}

function ClassItem({ weaviateClass, onDelete }: ClassItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/30 backdrop-blur-sm card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 hover:bg-white/10 transition-all duration-200"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-blue-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-blue-400" />
              )}
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg">
                <Database className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">{weaviateClass.class}</CardTitle>
                {weaviateClass.description && (
                  <CardDescription className="text-gray-400 mt-1">
                    {weaviateClass.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{weaviateClass.properties?.length || 0}</p>
                <p className="text-xs text-gray-400">Properties</p>
              </div>
              
              <div className="flex space-x-2">
                {weaviateClass.multiTenancy?.enabled && (
                  <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                    <span className="text-xs text-orange-300 font-medium">Multi-tenant</span>
                  </div>
                )}
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-xs text-green-300 font-medium">
                    {weaviateClass.vectorIndexType || 'HNSW'}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(weaviateClass.class)}
              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="border-t border-gray-600/30 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-400" />
                <span>Properties</span>
              </h4>
            </div>
            
            {weaviateClass.properties && weaviateClass.properties.length > 0 ? (
              <div className="grid gap-3">
                {weaviateClass.properties.map((property, index) => (
                  <PropertyItem key={index} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-600/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Database className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">No properties defined for this class</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function SchemaBrowser() {
  const [schema, setSchema] = useState<WeaviateSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchSchema = async () => {
    try {
      setLoading(true);
      setError(null);
      const schemaData = await weaviateClient.getSchema();
      setSchema(schemaData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schema');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (className: string) => {
    if (!confirm(`Are you sure you want to delete the class "${className}"?`)) {
      return;
    }

    try {
      await weaviateClient.deleteClass(className);
      await fetchSchema(); // Refresh schema
    } catch (err: any) {
      alert(`Failed to delete class: ${err.message}`);
    }
  };

  const handleCreateClass = async (className: string, properties: Array<{name: string, dataType: string}>) => {
    try {
      const classSchema = {
        class: className,
        properties: properties.map(prop => ({
          name: prop.name,
          dataType: [prop.dataType],
          description: `Property ${prop.name} of type ${prop.dataType}`
        }))
      };

      await weaviateClient.createClass(classSchema);
      await fetchSchema(); // Refresh schema
      alert(`Class "${className}" created successfully!`);
    } catch (err: any) {
      alert(`Failed to create class: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  if (loading) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading schema...</p>
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
            <Button onClick={fetchSchema}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl animate-float">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Schema Explorer
              </h2>
              <p className="text-gray-400 mt-1">
                Discover and manage your Weaviate data structure
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={fetchSchema}
              className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {schema && schema.classes && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-xl border border-blue-500/30 card-hover">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <Database className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{schema.classes.length}</p>
                  <p className="text-blue-300 text-sm">Total Classes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30 card-hover">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <Settings className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {schema.classes.reduce((total, cls) => total + (cls.properties?.length || 0), 0)}
                  </p>
                  <p className="text-green-300 text-sm">Total Properties</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30 card-hover">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/30 rounded-lg">
                  <Search className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Vector</p>
                  <p className="text-purple-300 text-sm">Search Ready</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {schema && schema.classes && schema.classes.length > 0 ? (
        <div className="space-y-6">
          {schema.classes.map((weaviateClass, index) => (
            <ClassItem
              key={index}
              weaviateClass={weaviateClass}
              onDelete={handleDeleteClass}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600/30 backdrop-blur-sm">
          <CardContent className="p-16 text-center">
            <div className="animate-float mb-6">
              <Database className="h-16 w-16 mx-auto text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Schema Detected</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Your Weaviate instance is ready for action! Start building your knowledge graph by creating your first class.
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Class
            </Button>
          </CardContent>
        </Card>
      )}

      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateClass}
      />
    </div>
  );
}