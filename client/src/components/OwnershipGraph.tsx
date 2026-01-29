/**
 * Ownership Structure Visualization
 * Interactive graph showing corporate ownership relationships
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  User,
  Globe,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Filter,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react';

// Types for ownership data
interface OwnershipNode {
  id: string;
  name: string;
  nameAr?: string;
  type: 'company' | 'individual' | 'government' | 'foreign' | 'unknown';
  country?: string;
  sector?: string;
  regime?: 'aden_irg' | 'sanaa_defacto' | 'mixed' | 'unknown';
  sanctioned?: boolean;
  pep?: boolean; // Politically Exposed Person
  metadata?: Record<string, any>;
}

interface OwnershipEdge {
  source: string;
  target: string;
  percentage: number;
  type: 'direct' | 'indirect' | 'beneficial';
  verified: boolean;
  sourceDoc?: string;
  date?: string;
}

interface OwnershipData {
  nodes: OwnershipNode[];
  edges: OwnershipEdge[];
  lastUpdated: string;
  dataQuality: 'high' | 'medium' | 'low';
}

// Sample data for demonstration
const SAMPLE_DATA: OwnershipData = {
  nodes: [
    { id: 'hsa-group', name: 'HSA Group', nameAr: 'مجموعة هائل سعيد أنعم', type: 'company', country: 'YE', sector: 'conglomerate', regime: 'mixed' },
    { id: 'hsa-trading', name: 'HSA Trading', nameAr: 'هائل سعيد للتجارة', type: 'company', country: 'YE', sector: 'trading', regime: 'mixed' },
    { id: 'hsa-food', name: 'HSA Food Industries', nameAr: 'صناعات غذائية هائل سعيد', type: 'company', country: 'YE', sector: 'food', regime: 'mixed' },
    { id: 'hsa-bank', name: 'HSA Banking Services', type: 'company', country: 'YE', sector: 'banking', regime: 'aden_irg' },
    { id: 'founder-1', name: 'Hail Saeed Anam (Estate)', nameAr: 'تركة هائل سعيد أنعم', type: 'individual', country: 'YE' },
    { id: 'family-trust', name: 'HSA Family Trust', type: 'company', country: 'AE', sector: 'holding' },
    { id: 'intl-partner', name: 'International Trading Partner', type: 'foreign', country: 'SA', sector: 'trading' },
    { id: 'govt-stake', name: 'Government of Yemen', nameAr: 'حكومة اليمن', type: 'government', country: 'YE', regime: 'aden_irg' },
    { id: 'unknown-1', name: 'Unknown Beneficial Owner', type: 'unknown' },
    { id: 'yemen-mobile', name: 'Yemen Mobile', nameAr: 'يمن موبايل', type: 'company', country: 'YE', sector: 'telecom', regime: 'sanaa_defacto' },
    { id: 'teleyemen', name: 'TeleYemen', nameAr: 'تيليمن', type: 'company', country: 'YE', sector: 'telecom', regime: 'sanaa_defacto' },
    { id: 'ptc', name: 'Public Telecom Corp', nameAr: 'المؤسسة العامة للاتصالات', type: 'government', country: 'YE', regime: 'sanaa_defacto' },
  ],
  edges: [
    { source: 'founder-1', target: 'hsa-group', percentage: 100, type: 'beneficial', verified: true, date: '1960' },
    { source: 'hsa-group', target: 'hsa-trading', percentage: 85, type: 'direct', verified: true, sourceDoc: 'Company Registry 2023' },
    { source: 'hsa-group', target: 'hsa-food', percentage: 100, type: 'direct', verified: true, sourceDoc: 'Company Registry 2023' },
    { source: 'hsa-group', target: 'hsa-bank', percentage: 51, type: 'direct', verified: true, sourceDoc: 'CBY Aden Records' },
    { source: 'family-trust', target: 'hsa-group', percentage: 60, type: 'indirect', verified: false },
    { source: 'intl-partner', target: 'hsa-trading', percentage: 15, type: 'direct', verified: true, sourceDoc: 'Trade Agreement 2021' },
    { source: 'govt-stake', target: 'hsa-bank', percentage: 20, type: 'direct', verified: true, sourceDoc: 'CBY Aden Records' },
    { source: 'unknown-1', target: 'hsa-bank', percentage: 29, type: 'beneficial', verified: false },
    { source: 'ptc', target: 'teleyemen', percentage: 100, type: 'direct', verified: true },
    { source: 'ptc', target: 'yemen-mobile', percentage: 26, type: 'direct', verified: true },
  ],
  lastUpdated: '2024-01-15',
  dataQuality: 'medium'
};

// Node type colors
const NODE_COLORS: Record<string, string> = {
  company: 'bg-blue-500',
  individual: 'bg-green-500',
  government: 'bg-purple-500',
  foreign: 'bg-orange-500',
  unknown: 'bg-gray-500',
};

const NODE_ICONS: Record<string, React.ReactNode> = {
  company: <Building2 className="h-4 w-4" />,
  individual: <User className="h-4 w-4" />,
  government: <Building2 className="h-4 w-4" />,
  foreign: <Globe className="h-4 w-4" />,
  unknown: <AlertTriangle className="h-4 w-4" />,
};

interface OwnershipGraphProps {
  data?: OwnershipData;
  rootEntityId?: string;
  language?: 'en' | 'ar';
  onNodeClick?: (node: OwnershipNode) => void;
}

export function OwnershipGraph({ 
  data = SAMPLE_DATA, 
  rootEntityId,
  language = 'en',
  onNodeClick 
}: OwnershipGraphProps) {
  const [selectedNode, setSelectedNode] = useState<OwnershipNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegime, setFilterRegime] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'graph' | 'tree' | 'list'>('tree');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on search and filters
  const filteredNodes = data.nodes.filter(node => {
    const matchesSearch = searchTerm === '' || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.nameAr && node.nameAr.includes(searchTerm));
    const matchesType = filterType === 'all' || node.type === filterType;
    const matchesRegime = filterRegime === 'all' || node.regime === filterRegime;
    return matchesSearch && matchesType && matchesRegime;
  });

  // Get edges for filtered nodes
  const filteredEdges = data.edges.filter(edge => 
    filteredNodes.some(n => n.id === edge.source) &&
    filteredNodes.some(n => n.id === edge.target)
  );

  // Build ownership hierarchy
  const buildHierarchy = (nodeId: string, visited = new Set<string>()): any => {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);

    const node = data.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const childEdges = data.edges.filter(e => e.source === nodeId);
    const children = childEdges
      .map(edge => {
        const child = buildHierarchy(edge.target, visited);
        if (child) {
          return { ...child, ownership: edge.percentage, edgeType: edge.type, verified: edge.verified };
        }
        return null;
      })
      .filter(Boolean);

    return { ...node, children };
  };

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = data.nodes.filter(node => 
    !data.edges.some(edge => edge.target === node.id)
  );

  const handleNodeClick = (node: OwnershipNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  // Render tree node recursively
  const renderTreeNode = (node: any, depth = 0, ownership?: number, edgeType?: string, verified?: boolean) => {
    const isFiltered = !filteredNodes.some(n => n.id === node.id);
    if (isFiltered) return null;

    return (
      <div key={node.id} className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
            ${selectedNode?.id === node.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'}
            ${node.sanctioned ? 'border-l-4 border-l-red-500' : ''}
          `}
          onClick={() => handleNodeClick(node)}
        >
          <div className={`p-1.5 rounded-full ${NODE_COLORS[node.type]} text-white`}>
            {NODE_ICONS[node.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {language === 'ar' && node.nameAr ? node.nameAr : node.name}
              </span>
              {ownership !== undefined && (
                <Badge variant={verified ? "default" : "outline"} className="text-xs">
                  {ownership}%
                  {edgeType === 'indirect' && ' (indirect)'}
                  {edgeType === 'beneficial' && ' (beneficial)'}
                </Badge>
              )}
              {!verified && ownership !== undefined && (
                <span title="Unverified"><AlertTriangle className="h-3 w-3 text-yellow-500" /></span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{node.type}</span>
              {node.country && <span>• {node.country}</span>}
              {node.sector && <span>• {node.sector}</span>}
              {node.regime && node.regime !== 'unknown' && (
                <Badge variant="outline" className="text-xs">
                  {node.regime === 'aden_irg' ? 'Aden/IRG' : 
                   node.regime === 'sanaa_defacto' ? 'Sanaa' : 'Mixed'}
                </Badge>
              )}
            </div>
          </div>
          {node.children?.length > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        {node.children?.map((child: any) => 
          renderTreeNode(child, depth + 1, child.ownership, child.edgeType, child.verified)
        )}
      </div>
    );
  };

  // Render list view
  const renderListView = () => (
    <div className="space-y-2">
      {filteredNodes.map(node => (
        <div 
          key={node.id}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
            ${selectedNode?.id === node.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted border border-transparent'}
          `}
          onClick={() => handleNodeClick(node)}
        >
          <div className={`p-2 rounded-full ${NODE_COLORS[node.type]} text-white`}>
            {NODE_ICONS[node.type]}
          </div>
          <div className="flex-1">
            <div className="font-medium">
              {language === 'ar' && node.nameAr ? node.nameAr : node.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {node.type} • {node.country || 'Unknown'} • {node.sector || 'N/A'}
            </div>
          </div>
          <div className="text-right">
            {node.regime && node.regime !== 'unknown' && (
              <Badge variant="outline">
                {node.regime === 'aden_irg' ? 'Aden/IRG' : 
                 node.regime === 'sanaa_defacto' ? 'Sanaa' : 'Mixed'}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {language === 'ar' ? 'هيكل الملكية' : 'Ownership Structure'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'تصور العلاقات المؤسسية والملكية'
                : 'Corporate ownership relationships visualization'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={data.dataQuality === 'high' ? 'default' : data.dataQuality === 'medium' ? 'secondary' : 'outline'}>
              {data.dataQuality} quality
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated: {data.lastUpdated}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ar' ? 'بحث...' : 'Search entities...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="foreign">Foreign</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRegime} onValueChange={setFilterRegime}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Regime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regimes</SelectItem>
              <SelectItem value="aden_irg">Aden/IRG</SelectItem>
              <SelectItem value="sanaa_defacto">Sanaa</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border rounded-md">
            <Button 
              variant={viewMode === 'tree' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              Tree
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* View tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsContent value="tree" className="mt-0">
            <div 
              ref={containerRef}
              className="border rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-auto"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              {rootNodes.map(root => {
                const hierarchy = buildHierarchy(root.id);
                return hierarchy ? renderTreeNode(hierarchy) : null;
              })}
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-0">
            <div className="border rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-auto">
              {renderListView()}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected node details */}
        {selectedNode && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold flex items-center gap-2">
              <div className={`p-1 rounded-full ${NODE_COLORS[selectedNode.type]} text-white`}>
                {NODE_ICONS[selectedNode.type]}
              </div>
              {language === 'ar' && selectedNode.nameAr ? selectedNode.nameAr : selectedNode.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 capitalize">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Country:</span>
                <span className="ml-2">{selectedNode.country || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sector:</span>
                <span className="ml-2">{selectedNode.sector || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Regime:</span>
                <span className="ml-2 capitalize">{selectedNode.regime || 'Unknown'}</span>
              </div>
            </div>
            
            {/* Ownership relationships */}
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Ownership Relationships</h5>
              <div className="space-y-1">
                {data.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((edge, i) => {
                  const isOwner = edge.source === selectedNode.id;
                  const otherNode = data.nodes.find(n => n.id === (isOwner ? edge.target : edge.source));
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={isOwner ? 'text-green-600' : 'text-blue-600'}>
                        {isOwner ? '→ Owns' : '← Owned by'}
                      </span>
                      <span className="font-medium">{otherNode?.name}</span>
                      <Badge variant="outline" className="text-xs">{edge.percentage}%</Badge>
                      {!edge.verified && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${NODE_COLORS.company}`} />
            <span>Company</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${NODE_COLORS.individual}`} />
            <span>Individual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${NODE_COLORS.government}`} />
            <span>Government</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${NODE_COLORS.foreign}`} />
            <span>Foreign</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${NODE_COLORS.unknown}`} />
            <span>Unknown</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
            <span>Unverified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OwnershipGraph;
