'use client';

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, Trash2, Eye, Edit3, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import JsonView from '@uiw/react-json-view';
import { JsonViewer } from '@/components/ui/json-viewer';
import { weaviateClient } from '@/lib/api/weaviate';
import { WeaviateObject, WeaviateSchema, WeaviateClass } from '@/types/weaviate';
import { formatDate, truncateString } from '@/lib/utils';

interface AddObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (className: string, properties: Record<string, any>) => void;
  schema: WeaviateSchema | null;
}

function AddObjectModal({ isOpen, onClose, onSave, schema }: AddObjectModalProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [properties, setProperties] = useState<Record<string, any>>({});

  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    // Initialize properties based on class schema
    const classSchema = schema?.classes?.find(c => c.class === className);
    if (classSchema?.properties) {
      const initialProps: Record<string, any> = {};
      classSchema.properties.forEach(prop => {
        if (prop.dataType?.includes('text')) {
          initialProps[prop.name] = '';
        } else if (prop.dataType?.includes('int') || prop.dataType?.includes('number')) {
          initialProps[prop.name] = 0;
        } else if (prop.dataType?.includes('boolean')) {
          initialProps[prop.name] = false;
        } else if (prop.dataType?.includes('date')) {
          initialProps[prop.name] = new Date().toISOString();
        } else {
          initialProps[prop.name] = '';
        }
      });
      setProperties(initialProps);
    }
  };

  const updateProperty = (propName: string, value: any) => {
    setProperties(prev => ({
      ...prev,
      [propName]: value
    }));
  };

  const handleSave = () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    // Filter out empty properties
    const filteredProps = Object.fromEntries(
      Object.entries(properties).filter(([_, value]) => value !== '' && value !== null)
    );

    if (Object.keys(filteredProps).length === 0) {
      alert('Please provide at least one property value');
      return;
    }

    onSave(selectedClass, filteredProps);
    setSelectedClass('');
    setProperties({});
    onClose();
  };

  if (!isOpen) return null;

  const selectedClassSchema = schema?.classes?.find(c => c.class === selectedClass);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Add New Object</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-md text-white"
            >
              <option value="">Choose a class...</option>
              {schema?.classes?.map(cls => (
                <option key={cls.class} value={cls.class}>
                  {cls.class}
                </option>
              ))}
            </select>
          </div>

          {selectedClassSchema && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-4">
                Properties
              </label>
              <div className="space-y-4">
                {selectedClassSchema.properties?.map(prop => (
                  <div key={prop.name}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {prop.name} ({prop.dataType?.join(', ')})
                    </label>
                    {prop.dataType?.includes('boolean') ? (
                      <select
                        value={properties[prop.name] ? 'true' : 'false'}
                        onChange={(e) => updateProperty(prop.name, e.target.value === 'true')}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-md text-white"
                      >
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                    ) : prop.dataType?.includes('int') || prop.dataType?.includes('number') ? (
                      <Input
                        type="number"
                        value={properties[prop.name] || ''}
                        onChange={(e) => updateProperty(prop.name, parseFloat(e.target.value) || 0)}
                        className="bg-gray-800/50 border-gray-600/30"
                        placeholder={`Enter ${prop.name}`}
                      />
                    ) : prop.dataType?.includes('date') ? (
                      <Input
                        type="datetime-local"
                        value={properties[prop.name] ? new Date(properties[prop.name]).toISOString().slice(0, -1) : ''}
                        onChange={(e) => updateProperty(prop.name, e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="bg-gray-800/50 border-gray-600/30"
                      />
                    ) : (
                      <Input
                        value={properties[prop.name] || ''}
                        onChange={(e) => updateProperty(prop.name, e.target.value)}
                        className="bg-gray-800/50 border-gray-600/30"
                        placeholder={`Enter ${prop.name}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Create Object
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ObjectItemProps {
  object: WeaviateObject;
  onDelete: (id: string) => void;
  onView: (object: WeaviateObject) => void;
}

function ObjectItem({ object, onDelete, onView }: ObjectItemProps) {
  const propertyCount = Object.keys(object.properties || {}).length;
  
  return (
    <div className="p-5 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-gray-600/30 rounded-xl hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.01] group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full group-hover:shadow-lg group-hover:shadow-cyan-400/20 transition-all duration-300"></div>
            <div>
              <h3 className="text-base font-mono font-semibold text-white group-hover:text-cyan-300 transition-colors duration-200">
                {truncateString(object.id, 30)}
              </h3>
              <div className="flex items-center space-x-4 mt-2">
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                  <span className="text-xs text-purple-300 font-medium">📁 {object.class}</span>
                </div>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-xs text-green-300 font-medium">🔧 {propertyCount} props</span>
                </div>
                {object.creationTimeUnix && (
                  <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                    <span className="text-xs text-orange-300 font-medium">⏰ {formatDate(object.creationTimeUnix)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(object)}
            className="h-10 w-10 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:scale-110 transition-all duration-200"
          >
            <Eye className="h-4 w-4 text-blue-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 hover:scale-110 transition-all duration-200"
          >
            <Edit3 className="h-4 w-4 text-yellow-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(object.id)}
            className="h-10 w-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:scale-110 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 text-red-300" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ObjectDetailsModalProps {
  object: WeaviateObject | null;
  isOpen: boolean;
  onClose: () => void;
}

function ObjectDetailsModal({ object, isOpen, onClose }: ObjectDetailsModalProps) {
  if (!isOpen || !object) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-600/30 rounded-2xl max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-600/30 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-12 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              <div>
                <h3 className="text-xl font-bold text-white">Object Details</h3>
                <p className="text-sm text-gray-400 font-mono bg-gray-800/50 px-3 py-1 rounded-md mt-1">
                  {object.id}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-10 w-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:scale-110 transition-all duration-200"
            >
              <X className="h-4 w-4 text-red-300" />
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-auto max-h-[70vh] bg-gray-900/50">
          <JsonViewer 
            data={object}
            title="Object Data"
            showDownloadButton={true}
            maxHeight="60vh"
            collapsedDepth={2}
          />
        </div>
      </div>
    </div>
  );
}

export function ObjectsBrowser() {
  const [objects, setObjects] = useState<WeaviateObject[]>([]);
  const [schema, setSchema] = useState<WeaviateSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedObject, setSelectedObject] = useState<WeaviateObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const pageSize = 20;

  const fetchObjects = async (page: number = 1, className?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await weaviateClient.getObjects({
        className: className || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      
      setObjects(response.objects);
      setTotalResults(response.totalResults || response.objects.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch objects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const schemaData = await weaviateClient.getSchema();
      setSchema(schemaData);
      
      // Set first class as default if available
      if (schemaData.classes && schemaData.classes.length > 0 && !selectedClass) {
        setSelectedClass(schemaData.classes[0].class);
      }
    } catch (err: any) {
      console.error('Failed to fetch schema:', err);
    }
  };

  const handleDeleteObject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this object?')) {
      return;
    }

    try {
      await weaviateClient.deleteObject(id, selectedClass || undefined);
      await fetchObjects(currentPage, selectedClass || undefined);
    } catch (err: any) {
      alert(`Failed to delete object: ${err.message}`);
    }
  };

  const handleViewObject = (object: WeaviateObject) => {
    setSelectedObject(object);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchObjects(currentPage, selectedClass || undefined);
  };

  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    setCurrentPage(1);
    fetchObjects(1, className || undefined);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchObjects(page, selectedClass || undefined);
  };

  const handleCreateObject = async (className: string, properties: Record<string, any>) => {
    try {
      const objectData = {
        class: className,
        properties: properties
      };

      await weaviateClient.createObject(objectData);
      await fetchObjects(currentPage, selectedClass || undefined);
      alert(`Object created successfully in class "${className}"!`);
    } catch (err: any) {
      alert(`Failed to create object: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchObjects(1, selectedClass);
    } else {
      fetchObjects(1);
    }
  }, [selectedClass]);

  const totalPages = Math.ceil(totalResults / pageSize);

  if (loading && objects.length === 0) {
    return (
      <div className="p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading objects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-1 h-16 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Objects
            </h2>
            <p className="text-gray-400 mt-1">
              Browse and manage your Weaviate objects
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={loading}
            className="bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50 hover:border-blue-500/30 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Object
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search objects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600/30 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder-gray-400"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => handleClassChange(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:border-blue-500/50 focus:ring-blue-500/20 min-w-[180px]"
        >
          <option value="">All Classes</option>
          {schema?.classes?.map((cls) => (
            <option key={cls.class} value={cls.class}>
              {cls.class}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/30 rounded-xl">
          <p className="text-red-300">⚠️ Error: {error}</p>
        </div>
      )}

      {/* Results */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse-glow"></div>
          <p className="text-sm text-gray-400">
            Showing <span className="text-cyan-400 font-semibold">{objects.length}</span> of <span className="text-cyan-400 font-semibold">{totalResults}</span> objects
            {selectedClass && (
              <span className="ml-2 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-xs">
                in class "{selectedClass}"
              </span>
            )}
          </p>
        </div>
      </div>

      {objects.length > 0 ? (
        <>
          <div className="space-y-3">
            {objects.map((object) => (
              <ObjectItem
                key={object.id}
                object={object}
                onDelete={handleDeleteObject}
                onView={handleViewObject}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50 hover:border-blue-500/30 disabled:opacity-30 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="px-6 py-2 bg-gradient-to-r from-gray-800/60 to-gray-700/60 border border-gray-600/30 rounded-lg">
                <span className="text-sm text-gray-300">
                  Page <span className="text-cyan-400 font-semibold">{currentPage}</span> of <span className="text-cyan-400 font-semibold">{totalPages}</span>
                </span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50 hover:border-blue-500/30 disabled:opacity-30 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 border border-gray-600/30 rounded-2xl p-16 text-center">
          <div className="animate-float">
            <Search className="h-16 w-16 mx-auto mb-6 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">No objects found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {selectedClass 
              ? `No objects found in class "${selectedClass}". Try selecting a different class or create a new object.`
              : 'No objects found in your Weaviate instance. Start by creating your first object.'
            }
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg hover:scale-105 transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Create an object
          </Button>
        </div>
      )}

      <ObjectDetailsModal
        object={selectedObject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AddObjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateObject}
        schema={schema}
      />
    </div>
  );
}